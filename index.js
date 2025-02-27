import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import createPlugin from '@extism/extism';
import jsyaml from 'js-yaml';
import fs from 'fs';

function loadYamlFile(filePath) {
  try {
    const yamlFile = fs.readFileSync(filePath, 'utf8');
    const pluginsYamlFile = jsyaml.load(yamlFile);
    return { pluginsYamlFile: pluginsYamlFile, error: null };
  }
  catch (e) {
    //console.log(e);
    return { pluginsYamlFile: null, error: e };
  }
}

let pluginsPath = process.env.PLUGINS_PATH || "./plugins";
let pluginsDefinitionFile = process.env.PLUGINS_DEFINITION_FILE || "plugins.yml";

const { pluginsYamlFile, error } = loadYamlFile(`${pluginsPath}/${pluginsDefinitionFile}`);
if (error) {
  console.log("😡:", error);
  process.exit(1);
}

const server = new McpServer({
  name: "wasimancer-server",
  version: "0.0.0",
});

// Helper to create Zod schema based on argument type
function createZodSchema(argType) {
  switch(argType.toLowerCase()) {
    case 'string':
      return z.string();
    case 'number':
      return z.number();
    case 'boolean':
      return z.boolean();
    case 'object':
      return z.record(z.any());
    case 'array':
      return z.array(z.any());
    default:
      return z.any();
  }
}

async function createTools() {
  console.log("🤖 browse wasm plugins and create tools...");
  
  for (const [pluginIndex, plugin] of pluginsYamlFile.plugins.entries()) {
    console.log(`\n🔌 Plugin ${pluginIndex + 1}:`);
    console.log(`  Name: ${plugin.name}`);
    console.log(`  Path: ${plugin.path}`);
    console.log(`  Version: ${plugin.version}`);
    console.log(`  Description: ${plugin.description}`);
    
    // Create plugin instance
    const wamPlugin = await createPlugin(`${pluginsPath}/${plugin.path}`, {
      useWasi: true,
      logger: console,
      runInWorker: true,
      logLevel: 'trace',
      allowedHosts: ['*'],
    });
    //TODO: allowedHosts: it should be a parameter(s) in the plugins.yml file
    
    console.log('  🛠️ Functions:');
    await Promise.all(plugin.functions.map(async (funcSpec, funcIndex) => {
      console.log(`    ${funcIndex + 1}. ${funcSpec.displayName}/${funcSpec.function}: ${funcSpec.description}`);
      
      // Handle different function configurations
      if (funcSpec.arguments && funcSpec.arguments.length > 0) {
        // Log argument details
        console.log(`      Arguments:`);
        funcSpec.arguments.forEach(arg => {
          console.log(`        - ${arg.name} (${arg.type}): ${arg.description}`);
        });
        
        // Create schema object directly
        const schemaObj = {};
        funcSpec.arguments.forEach(arg => {
          schemaObj[arg.name] = createZodSchema(arg.type);
        });
        
        // Register the tool with direct argument mapping
        server.tool(
          funcSpec.displayName,
          schemaObj,
          async (args) => {
            // Convert args to JSON string for WASM function
            const inputData = JSON.stringify(args);
            let out = await wamPlugin.call(funcSpec.function, inputData);
            return {
              content: [{ type: "text", text: out.text() }],
            };
          }
        );
      } else {
        // Legacy format without arguments - use string param
        server.tool(
          funcSpec.displayName,
          { params: z.string() },
          async ({ params }) => {
            let out = await wamPlugin.call(funcSpec.function, params);
            return {
              content: [{ type: "text", text: out.text() }],
            };
          }
        );
      }
    }));
    console.log(`  ✅ Plugin ${plugin.name} loaded with ${plugin.functions.length} functions`);
  }
}

async function startServer() {
  await createTools();
  
  const app = express();
  var transport = null;

  app.get("/sse", async (req, res) => {
    transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);
  });

  app.post("/messages", async (req, res) => {
    await transport.handlePostMessage(req, res);
  });

  // Get HTTP_PORT from environment or default to 3001
  const HTTP_PORT = process.env.PORT || 3001;

  app.listen(HTTP_PORT);
  console.log(`🚀 Server ready at http://0.0.0.0:${HTTP_PORT}`);
}

startServer();
