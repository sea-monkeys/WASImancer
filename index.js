import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

import multer from "multer";
import path from "path";

//import { z } from "zod";
//import createPlugin from '@extism/extism';

// project helpers
import {
  loadPluginsYamlFile,
  loadResourcesYamlFile,
  loadPromptsYamlFile,
} from "./yaml-utils.js";

import {
  registerAndLoadPlugins,
} from "./tools.js";

import {
  registerStaticResources,
  registerDynamicResources,
} from "./resources.js";

import { registerPredefinedPrompts } from "./prompts.js";


import { registerResourceApiEndpoints } from "./resources-api.js";
import { registerPromptApiEndpoints } from "./prompts-api.js";
import { registerToolApiEndpoints } from "./tools-api.js";

let pluginsPath = process.env.PLUGINS_PATH || "./plugins";
let pluginsDefinitionFile =
  process.env.PLUGINS_DEFINITION_FILE || "plugins.yml";

const { pluginsData, errorPlugins: errorPlugin } = loadPluginsYamlFile(
  pluginsPath,
  pluginsDefinitionFile
);
if (errorPlugin) {
  console.log("😡:", errorPlugin);
  process.exit(1);
}

let resourcesPath = process.env.RESOURCES_PATH || "./resources";
let resourcesDefinitionFile =
  process.env.RESOURCES_DEFINITION_FILE || "resources.yml";

const { resourcesData, errorResources: errorResource } = loadResourcesYamlFile(
  resourcesPath,
  resourcesDefinitionFile
);
if (errorResource) {
  console.log("😠:", errorResource);
  //process.exit(1);
}

let promptsPath = process.env.PROMPTS_PATH || "./prompts";
let promptsDefinitionFile =
  process.env.PROMPTS_DEFINITION_FILE || "prompts.yml";

const { promptsData, errorPrompts: errorPrompt } = loadPromptsYamlFile(
  promptsPath,
  promptsDefinitionFile
);
if (errorPrompt) {
  console.log("😠:", errorPrompt);
  //process.exit(1);
}

const authenticationToken = process.env.WASIMANCER_AUTH_TOKEN || "i-love-parakeets";
// Default plugin directory
const uploadRootPath = process.env.UPLOAD_PATH || "./plugins";
//const  uploadRootPath = pluginsPath;

// 📝 Define the upload middleware (using Multer)
const uploadMiddelware = multer({
  dest: `${pluginsPath}/tmp-uploads/`, // Temporary directory
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== ".wasm") {
      return cb(new Error("✋ Only .wasm files are allowed"));
    }
    cb(null, true);
  },
});


const server = new McpServer({
  name: "wasimancer-server",
  version: "0.0.4",
});

async function startServer() {
  //==============================================
  // Create the WASM MCP server tools
  //==============================================
  await registerAndLoadPlugins(server, pluginsPath, pluginsData);

  //==============================================
  // Register the static resources
  //==============================================
  registerStaticResources(server, resourcesData);

  //==============================================
  // Register the dynamic resources
  //==============================================
  registerDynamicResources(server, resourcesData);

  //==============================================
  // Register the predefined prompts
  //==============================================
  registerPredefinedPrompts(server, promptsData);

  const app = express();
  //app.use(express.json()); you cannot use it otherwise you will not be able use the SSE transport
  var transport = null;

  app.get("/sse", async (req, res) => {
    transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);
  });

  app.post("/messages", async (req, res) => {
    await transport.handlePostMessage(req, res);
  });

  //==============================================
  // ⏺️ Register Plugin Management API Endpoints
  //==============================================
  registerToolApiEndpoints(
    app,
    server,
    authenticationToken,
    uploadRootPath,
    pluginsPath,
    pluginsDefinitionFile,
    uploadMiddelware
  );

  //===============================================
  // ⏺️ Register Resource Management API Endpoints
  //===============================================
  registerResourceApiEndpoints(
    app,
    server,
    authenticationToken,
    resourcesPath,
    resourcesDefinitionFile
  );

  //===============================================
  // ⏺️ Register Prompt Management API Endpoints
  //===============================================
  registerPromptApiEndpoints(
    app,
    server,
    authenticationToken,
    promptsPath,
    promptsDefinitionFile
  );

  // Get HTTP_PORT from environment or default to 3001
  const HTTP_PORT = process.env.PORT || 3001;

  app.listen(HTTP_PORT);
  console.log(`🚀🤖 Server ready at http://0.0.0.0:${HTTP_PORT}`);
}

startServer();
