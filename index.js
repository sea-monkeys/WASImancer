import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
//import { z } from "zod";
//import createPlugin from '@extism/extism';

// project helpers
import { loadPluginsYamlFile, loadResourcesYamlFile, loadPromptsYamlFile } from './yaml-utils.js';
import { createTools } from './tools.js';
import { registerStaticResources } from './resources.js';
import { registerPredefinedPrompts } from './prompts.js';

let pluginsPath = process.env.PLUGINS_PATH || "./plugins";
let pluginsDefinitionFile = process.env.PLUGINS_DEFINITION_FILE || "plugins.yml";

const { pluginsData, errorPlugins: errorPlugin } = loadPluginsYamlFile(pluginsPath, pluginsDefinitionFile);
if (errorPlugin) {
  console.log("😡:", errorPlugin);
  process.exit(1);
}

let resourcesPath = process.env.RESOURCES_PATH || "./resources";
let resourcesDefinitionFile = process.env.RESOURCES_DEFINITION_FILE || "resources.yml";

const { resourcesData, errorResources: errorResource} = loadResourcesYamlFile(resourcesPath, resourcesDefinitionFile);
if (errorResource) {
  console.log("😠:", errorResource);
  //process.exit(1);
}

let promptsPath = process.env.PROMPTS_PATH || "./prompts";
let promptsDefinitionFile = process.env.PROMPTS_DEFINITION_FILE || "prompts.yml";

const { promptsData, errorPrompts: errorPrompt } = loadPromptsYamlFile(promptsPath, promptsDefinitionFile);
if (errorPrompt) {
  console.log("😠:", errorPrompt);
  //process.exit(1);
}



const server = new McpServer({
  name: "wasimancer-server",
  version: "preview",
});

async function startServer() {
  // Create the WASM MCP server tools
  await createTools(server, pluginsPath, pluginsData);

  registerStaticResources(server, resourcesData);
  registerPredefinedPrompts(server, promptsData);
  
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
  console.log(`🚀🤖 Server ready at http://0.0.0.0:${HTTP_PORT}`);

}

startServer();
