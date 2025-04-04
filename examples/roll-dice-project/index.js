import { ChatOllama } from "@langchain/ollama";
import { z } from "zod";
import { tool } from "@langchain/core/tools";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

// Set up the SSE client transport
const transport = new SSEClientTransport(new URL("http://localhost:3001/sse"));

const llm = new ChatOllama({
  model: "qwen2.5:0.5b",
  //baseUrl: "http://host.docker.internal:11434",
  baseUrl: "http://localhost:11434",
  temperature: 0.0,
});

// Create the MCP Client
const mcpClient = new Client(
  {
    name: "mcp-sse-client",
    version: "1.0.0",
  },
  {
    capabilities: {
      prompts: {},
      resources: {},
      tools: {},
      logging: {},
    },
  }
);

// Function to fetch the list of tools
async function fetchTools() {
  try {
    console.log("🔍 Fetching available tools...");
    const result = await mcpClient.listTools();
    return result;
  } catch (error) {
    console.error("❌ Error fetching tools:", error);
  }
}

// Connect to the SSE server and get tools
async function startClient() {
  console.log("🔄 Connecting to MCP SSE Server...");
  await mcpClient.connect(transport);
  console.log("✅ Connected to MCP SSE Server!");

  // Fetch tools
  let mcpTools = await fetchTools();

  console.log("=====================================");
  console.log("✅ Available Tools:");

  mcpTools.tools.forEach((tool) => {
    console.log("🔨 tool:", tool.name);
    console.log("🔨 schema:", tool.inputSchema);
  });
  console.log("=====================================");

  // Transform MCP Tools to Dynamic Tools (Langchain Tools)
  let langchainTools = mcpTools.tools.map((mcpTool) => {
    return tool(null, {
      name: mcpTool.name,
      description: mcpTool.description || "No description provided",
      schema: jsonSchemaToZod(mcpTool.inputSchema),
    });
  });

  // Resources
  const resources = await mcpClient.listResources();
  console.log("📜 Available Resources:", resources);

  const llmInstruction = await mcpClient.readResource({
    uri: "llm://instructions",
  });
  // Resource Content:
  let systemInstructions = llmInstruction.contents[0].text;
  console.log("📝 System Instructions:", systemInstructions);
  console.log("=====================================");

  // Prompts
  const prompts = await mcpClient.listPrompts();
  console.log("📜 Available Prompts:", prompts);

  const prompt = await mcpClient.getPrompt({
    name: "roll-dice",
    arguments: { numDice: "3", numFaces: "12" }, // always use strings for arguments
  });
  let userInstructions = prompt.messages[0].content.text;
  console.log("📝 User Instructions:", userInstructions);
  console.log("=====================================");

  // Bind the tools to the LLM instance
  const llmWithTools = llm.bindTools(langchainTools);

  let messages = [
    ["system", systemInstructions],
    ["user", userInstructions],
  ];

  // Invoke the LLM with the messages
  let llmOutput = await llmWithTools.invoke(messages);

  // Output the LLM response
  console.log("📦 LLM (response )Output:");
  console.log("llmOutput:", llmOutput.tool_calls[0]);
  console.log("=====================================");

  // Call the tool via MCP with the LLM response
  let result = await mcpClient.callTool({
    name: llmOutput.tool_calls[0].name,
    arguments: llmOutput.tool_calls[0].args,
  });
  console.log("✅ Server Response:", result);

  // Exit the client
  console.log("👋 Closing connection...");
  mcpClient.close();
  console.log("🔌 Disconnected!");
}

// Handle incoming messages
transport.onmessage = (message) => {
  console.log("📩 Incoming Message:", message);
};

// Handle errors
transport.onerror = (error) => {
  console.error("🚨 SSE Client Error:", error);
};

// Start the client
startClient();

/**
 * Convert a JSON Schema object to a Zod schema object.
 * @param {object} jsonSchema - The JSON Schema object to convert
 * @returns {object} - The Zod schema object
 */
function jsonSchemaToZod(jsonSchema) {
  if (!jsonSchema || jsonSchema.type !== "object" || !jsonSchema.properties) {
    return z.object({});
  }

  const shape = {};
  for (const [key, value] of Object.entries(jsonSchema.properties)) {
    let zodType;

    // Map JSON Schema types to Zod types
    switch (value.type) {
      case "string":
        zodType = z.string();
        break;
      case "number":
        zodType = z.number();
        break;
      case "integer":
        zodType = z.number().int();
        break;
      case "boolean":
        zodType = z.boolean();
        break;
      case "array":
        zodType = z.array(jsonSchemaToZod(value.items));
        break;
      case "object":
        zodType = jsonSchemaToZod(value);
        break;
      default:
        zodType = z.any(); // Default case if type is unknown
    }

    // Add optionality if `required` is missing
    if (!jsonSchema.required?.includes(key)) {
      zodType = zodType.optional();
    }

    shape[key] = zodType;
  }

  return z.object(shape);
}
