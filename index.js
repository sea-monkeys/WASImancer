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

const { pluginsYamlFile , error } = loadYamlFile('./plugins.yml');
if (error) {
  console.log("😡:", error);
  process.exit(1);
}
//console.log(pluginsYamlFile);

const server = new McpServer({
  name: "wasimancer-server",
  version: "0.0.0",
});

async function createTools() {
  console.log("🤖 browse wasm plugins and create tools...");
  
  for (const [pluginIndex, plugin] of pluginsYamlFile.plugins.entries()) {
    console.log(`\n🔌 Plugin ${pluginIndex + 1}:`);
    console.log(`  Name: ${plugin.name}`);
    console.log(`  Path: ${plugin.path}`);
    console.log(`  Version: ${plugin.version}`);
    console.log(`  Description: ${plugin.description}`);
    
    const wamPlugin = await createPlugin(plugin.path, {
      useWasi: true,
      logger: console,
      runInWorker: true,
      logLevel: 'trace',
    });
    
    console.log('  🛠️ Functions:');
    await Promise.all(plugin.functions.map(async (funcSpecifications, funcIndex) => {
      console.log(`    ${funcIndex + 1}. ${funcSpecifications.displayName}/${funcSpecifications.function}: ${funcSpecifications.description}`);
  
      server.tool(funcSpecifications.displayName, 
        { 
          params: z.string() 
        }, 
        async ({ params }) => {
          let out = await wamPlugin.call(funcSpecifications.function, params);
          return {
            content: [{ type: "text", text: out.text() }],
          };
        });
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
