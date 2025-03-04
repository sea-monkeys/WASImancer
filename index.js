import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

import multer from "multer";
import fs from "fs";
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
  loadPlugins,
  loadSinglePlugin,
  addPluginAndUpdateYaml,
  removePluginAndUpdateYaml,
  overridePlugin
} from "./tools.js";
import { registerStaticResources } from "./resources.js";
import { registerPredefinedPrompts } from "./prompts.js";

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

const authenticationToken = process.env.UPLOAD_AUTH_TOKEN || "i-love-parakeets";
const uploadRootPath = process.env.UPLOAD_PATH || "./plugins";

// 📝 Define the upload middleware (using Multer)
const upload = multer({
  dest: "uploads/", // Temporary directory
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== ".wasm") {
      return cb(new Error("✋ Only .wasm files are allowed"));
    }
    cb(null, true);
  },
});

// 📂 Ensure directory exists
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    // Create directory if it doesn't exist 🤔
    fs.mkdirSync(directory, { recursive: true });
  }
}

const server = new McpServer({
  name: "wasimancer-server",
  version: "0.0.0",
});

async function startServer() {
  //==============================================
  // Create the WASM MCP server tools
  //==============================================
  await loadPlugins(server, pluginsPath, pluginsData);

  //==============================================
  // Register the static resources
  //==============================================
  registerStaticResources(server, resourcesData);

  //==============================================
  // Register the predefined prompts
  //==============================================
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

  //==============================================
  // 🟣 Upload Wasm File Endpoint
  //==============================================
  app.post("/upload", upload.single("wasmFile"), async (req, res) => {
    const token = req.headers["authorization"];
    const targetDir = req.query.dir || uploadRootPath; // Default: plugins directory
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    //TODO: validate metadata: to be tested
    if (!metadata || !metadata.name || !metadata.functions) {
      return res.status(400).json({ error: "😡 Invalid plugin data" });
    }


    // 🔒 Validate the authentication token
    if (!token || token !== `Bearer ${authenticationToken}`) {
      return res.status(403).json({ error: "😡 Unauthorized" });
    }

    // 🔍 Validate file upload
    if (!req.file) {
      return res.status(400).json({ error: "😡 No file uploaded" });
    }

    // 📂 Ensure the directory exists
    ensureDirectoryExists(targetDir);

    // 🛠 Move the uploaded file to the target directory
    const newFilePath = path.join(targetDir, req.file.originalname);
    fs.rename(req.file.path, newFilePath, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "😡 File saving failed", details: err.message });
      }

      console.log(`✅ File uploaded to: ${newFilePath}`);
      console.log(`📋 Received Metadata:`, metadata);

      // 🚀 Load the plugin (Wait for the async function result)
      try {
        const { success, error } = await addPluginAndUpdateYaml(
          server,
          pluginsPath,
          pluginsDefinitionFile,
          metadata
        );
        //const { success, error } = await loadSinglePlugin(server, targetDir, metadata);

        if (!success) {
          return res
            .status(500)
            .json({ error: error || "Failed to load plugin" });
        }

        return res.status(200).json({
          message: "🎉 File uploaded successfully",
          filePath: newFilePath,
          metadata: metadata,
        });
      } catch (error) {
        return res
          .status(500)
          .json({ error: error.message || "Unexpected error" });
      }
    });
  });

  app.delete("/remove-plugin/:name", async (req, res) => {
    const token = req.headers["authorization"];

    // 🔒 Validate token (replace with a more secure method)
    if (!token || token !== `Bearer ${authenticationToken}`) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const pluginName = req.params.name;
    if (!pluginName) {
      return res.status(400).json({ error: "Plugin name is required" });
    }

    try {
      const { success, error } = await removePluginAndUpdateYaml(
        server,
        pluginsPath,
        pluginsDefinitionFile,
        pluginName
      );
      //const { success, error } = await removeTool(server, pluginName);
      if (!success) {
        return res
          .status(500)
          .json({ error: error || "Failed to remove plugin" });
      }
      return res.status(200).json({ message: "Plugin removed successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Unexpected error" });
    }

    //const result = removeTool(server, pluginName);
    //res.json(result);
    //res.json({ message: "🚧 Remove plugin endpoint is under construction" });
  });

  import multer from "multer";

  // 🔹 Configure file upload
  const upload = multer({ dest: "uploads/" });
  
  app.put("/override-plugin", upload.single("wasmFile"), async (req, res) => {
    const token = req.headers["authorization"];
  
    // 🔒 Validate token
    if (!token || token !== `Bearer ${AUTH_TOKEN}`) {
      return res.status(403).json({ error: "Unauthorized" });
    }
  
    const pluginData = JSON.parse(req.body.pluginData); // Ensure JSON is correctly parsed
  
    if (!pluginData || !pluginData.name || !pluginData.functions) {
      return res.status(400).json({ error: "Invalid plugin data" });
    }
  
    // Ensure the file is provided
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
  
    // 📂 Move file to plugins directory
    const targetDir = "./plugins";
    const newFilePath = `${targetDir}/${req.file.originalname}`;
    fs.renameSync(req.file.path, newFilePath);
  
    // 🚀 Override the plugin
    const result = await overridePluginAndUpdateYaml(server, targetDir, "plugins.yml", pluginData, newFilePath);
    res.json(result);
  });
  


  // Get HTTP_PORT from environment or default to 3001
  const HTTP_PORT = process.env.PORT || 3001;

  app.listen(HTTP_PORT);
  console.log(`🚀🤖 Server ready at http://0.0.0.0:${HTTP_PORT}`);
}

startServer();
