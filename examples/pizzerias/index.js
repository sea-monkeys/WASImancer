import { ChatOllama } from "@langchain/ollama";
//import { z } from "zod";
//import { tool } from "@langchain/core/tools";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";

import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { loadMcpTools } from "@langchain/mcp-adapters";

const bearerToken = "mcp-is-the-way";

// Set up the StreamableHTTP client transport (with auth headers)
const transport = new StreamableHTTPClientTransport(new URL("http://localhost:3001/mcp"), {
  authProvider: {
    tokens: async () => {
      return {
        access_token: bearerToken,
      };
    },
  },
});

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
    auth: {
      type: "bearer",
      token: bearerToken,
    },
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

// Connect to the SSE server and get tools
async function startClient() {
  try {
    // Connect to the server

    console.log("🔄 Connecting to MCP SSE Server...");
    await mcpClient.connect(transport);
    console.log("✅ Connected to MCP SSE Server!");

    // Get tools with custom configuration
    const tools = await loadMcpTools("my-server", mcpClient, {
      // Whether to throw errors if a tool fails to load (optional, default: true)
      throwOnLoadError: true,
      // Whether to prefix tool names with the server name (optional, default: false)
      prefixToolNameWithServerName: false,
      // Optional additional prefix for tool names (optional, default: "")
      additionalToolNamePrefix: "",
    });

    console.log("🔧 Tools loaded:", tools);

    // Bind the tools to the LLM instance
    const llmWithTools = llm.bindTools(tools);

    let messages = [
      ["system", "you are a pizza expert"],
      ["user", "give me pizzerias addresses in Paris"],
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
  } catch (error) {
    //console.log("❌ Error:", error);
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
  }
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
