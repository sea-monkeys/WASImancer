import fs from "fs";
import path from "path";

import { addPluginAndUpdateYaml, removePluginAndUpdateYaml } from "./tools.js";

// 📂 Ensure directory exists
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    // Create directory if it doesn't exist 🤔
    fs.mkdirSync(directory, { recursive: true });
  }
}


/**
 * Register the API endpoints for managing
 * the tools (plugins) in the MCP server.
 * @param {Object} app - Express app instance
 * @param {Object} server - MCP server instance
 * @param {string} authenticationToken - The token to authenticate the API requests
 * @param {string} uploadRootPath - The root path for uploaded files
 * @param {string} pluginsPath - The path to the plugins directory
 * @param {string} pluginsDefinitionFile - The plugins definition file
 * @param {Object} uploadMiddelware - The multer middleware instance
 */
export function registerToolApiEndpoints(
  app,
  server,
  authenticationToken,
  uploadRootPath,
  pluginsPath,
  pluginsDefinitionFile,
  uploadMiddelware
) {
  //==============================================
  // 🟣 Upload Wasm Plugin Endpoint
  //==============================================
  app.post("/upload-plugin", uploadMiddelware.single("wasmFile"), async (req, res) => {
    const token = req.headers["authorization"];
    const targetDir = req.query.dir || uploadRootPath; // Default: plugins directory
    const pluginData = req.body.pluginData
      ? JSON.parse(req.body.pluginData)
      : {};

    if (!pluginData || !pluginData.name || !pluginData.functions) {
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
      console.log(`📝 Received Metadata:`, pluginData);

      // 🚀 Load the plugin (Wait for the async function result)
      try {
        const { success, error } = await addPluginAndUpdateYaml(
          server,
          pluginsPath,
          pluginsDefinitionFile,
          pluginData
        );

        if (!success) {
          return res
            .status(500)
            .json({ error: error || "😡 Failed to load plugin" });
        }

        return res.status(200).json({
          message: "🎉 File uploaded successfully",
          filePath: newFilePath,
          metadata: pluginData,
        });
      } catch (error) {
        return res
          .status(500)
          .json({ error: error.message || "😡 Unexpected error" });
      }
    });
  });

  //==============================================
  // 🟣 Remove Wasm Plugin Endpoint
  //==============================================
  app.delete("/remove-plugin/:name", async (req, res) => {
    const token = req.headers["authorization"];

    // 🔒 Validate token (replace with a more secure method)
    if (!token || token !== `Bearer ${authenticationToken}`) {
      return res.status(403).json({ error: "😡 Unauthorized" });
    }

    const pluginName = req.params.name;
    if (!pluginName) {
      return res.status(400).json({ error: "😡 Plugin name is required" });
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
          .json({ error: error || "😡 Failed to remove plugin" });
      }
      return res
        .status(200)
        .json({ message: "🙂 Plugin removed successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "😡 Unexpected error" });
    }
  });

  //==============================================
  // 🟣 Update Wasm File Endpoint
  //==============================================
  app.put("/update-plugin", uploadMiddelware.single("wasmFile"), async (req, res) => {
    const token = req.headers["authorization"];
    const targetDir = req.query.dir || uploadRootPath; // Default: plugins directory
    const pluginData = req.body.pluginData
      ? JSON.parse(req.body.pluginData)
      : {};

    if (!pluginData || !pluginData.name || !pluginData.functions) {
      return res.status(400).json({ error: "😡 Invalid plugin data" });
    }

    // 🔒 Validate token
    if (!token || token !== `Bearer ${authenticationToken}`) {
      return res.status(403).json({ error: "😡 Unauthorized" });
    }

    // 🗑️ remove the existing plugin
    let pluginName = pluginData.name;
    try {
      const { success, error } = await removePluginAndUpdateYaml(
        server,
        pluginsPath,
        pluginsDefinitionFile,
        pluginName
      );
      if (!success) {
        return res
          .status(500)
          .json({ error: error || "😡 Failed to remove plugin" });
      }
      //return res.status(200).json({ message: "Plugin removed successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "😡 Unexpected error" });
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
      console.log(`📝 Received Metadata:`, pluginData);

      // 🚀 Load the plugin (Wait for the async function result)
      try {
        const { success, error } = await addPluginAndUpdateYaml(
          server,
          pluginsPath,
          pluginsDefinitionFile,
          pluginData
        );

        if (!success) {
          return res
            .status(500)
            .json({ error: error || "😡 Failed to load plugin" });
        }

        return res.status(200).json({
          message: "🎉 File uploaded successfully",
          filePath: newFilePath,
          metadata: pluginData,
        });
      } catch (error) {
        return res
          .status(500)
          .json({ error: error.message || "😡 Unexpected error" });
      }
    });
  });
}
