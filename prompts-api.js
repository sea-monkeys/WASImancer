import fs from "fs";
import path from "path";
import jsyaml from "js-yaml";
import express from "express";
import { z } from "zod";

/**
 * Registers prompt management endpoints for the Express application
 * Registers prompt management endpoints for the Express application
 * @param {Object} app - Express application instance
 * @param {Object} server - MCP server instance
 * @param {string} authToken - Authentication token for API endpoints
 * @param {string} promptsPath - Path to prompts directory
 * @param {string} promptsDefinitionFile - Name of prompts definition file (YAML)
 */
export function registerPromptApiEndpoints(
  app,
  server,
  authToken,
  promptsPath,
  promptsDefinitionFile
) {
  const promptsFilePath = path.join(promptsPath, promptsDefinitionFile);

  // Apply JSON middleware only to these prompt API routes
  const jsonParser = express.json();

  //==============================================
  // 🟢 Add Prompt Endpoint
  //==============================================
  app.post("/add-prompt", jsonParser, async (req, res) => {
    const token = req.headers["authorization"];
    const promptData = req.body;

    // 🔒 Validate the authentication token
    if (!token || token !== `Bearer ${authToken}`) {
      return res.status(403).json({ error: "😡 Unauthorized" });
    }

    // 🔍 Validate prompt data
    if (
      !promptData ||
      !promptData.name ||
      !promptData.arguments ||
      !promptData.messages
    ) {
      return res.status(400).json({ error: "😡 Invalid prompt data" });
    }

    try {
      // 🔹 Load existing prompts.yml
      let promptsData;
      try {
        const yamlFile = fs.readFileSync(promptsFilePath, "utf8");
        promptsData = jsyaml.load(yamlFile);
      } catch (error) {
        console.error("😡 Error loading prompts.yml:", error);
        return res
          .status(500)
          .json({ error: "😡 Failed to load prompts.yml" });
      }

      // 🛠 Ensure promptsData structure exists
      if (!promptsData.prompts) {
        promptsData.prompts = { predefined: [] };
      }
      if (!promptsData.prompts.predefined) {
        promptsData.prompts.predefined = [];
      }

      // 🔍 Check if the prompt already exists
      const existingPromptIndex = promptsData.prompts.predefined.findIndex(
        (p) => p.name === promptData.name
      );
      if (existingPromptIndex !== -1) {
        return res
          .status(400)
          .json({ error: `😡 Prompt ${promptData.name} already exists` });
      }

      // ➕ Add the new prompt
      promptsData.prompts.predefined.push(promptData);

      // ✍️ Save the updated prompts.yml
      try {
        fs.writeFileSync(promptsFilePath, jsyaml.dump(promptsData), "utf8");
        console.log(`✅ Prompt ${promptData.name} added to prompts.yml`);
      } catch (error) {
        console.error("😡 Error saving prompts.yml:", error);
        return res
          .status(500)
          .json({ error: "😡 Failed to update prompts.yml" });
      }

      // 🔄 Register the prompt with the server
      try {
        // Build the schema object for Zod validation
        const schemaObj = {};
        promptData.arguments.forEach(arg => {
          // Map YAML type strings to Zod validators
          switch (arg.type.toLowerCase()) {
            case 'string':
              schemaObj[arg.name] = z.string();
              break;
            case 'number':
              schemaObj[arg.name] = z.number();
              break;
            case 'boolean':
              schemaObj[arg.name] = z.boolean();
              break;
            // Add other types as needed
            default:
              schemaObj[arg.name] = z.any();
          }
        });
        
        // Register the prompt with the server
        server.prompt(
          promptData.name,
          schemaObj,
          (args) => ({
            messages: promptData.messages.map(message => {
              // Replace template variables in the text
              let text = message.text;
              promptData.arguments.forEach(arg => {
                const regex = new RegExp(`\\$\\{${arg.name}\\}`, 'g');
                text = text.replace(regex, args[arg.name]);
              });
              
              return {
                role: message.role,
                content: {
                  type: "text",
                  text: text
                }
              };
            })
          })
        );

        console.log(`✅ Prompt ${promptData.name} registered with server`);
        return res.status(200).json({
          message: `🎉 Prompt ${promptData.name} added successfully`,
          prompt: promptData,
        });
      } catch (error) {
        console.error(
          `😡 Error registering prompt ${promptData.name}:`,
          error
        );
        return res
          .status(500)
          .json({ error: `😡 Failed to register prompt: ${error.message}` });
      }
    } catch (error) {
      console.error("😡 Unexpected error:", error);
      return res
        .status(500)
        .json({ error: `😡 Unexpected error: ${error.message}` });
    }
  });

  //==============================================
  // 🔴 Remove Prompt Endpoint
  //==============================================
  app.delete("/remove-prompt/:name", async (req, res) => {
    const token = req.headers["authorization"];
    const promptName = req.params.name;

    // 🔒 Validate token
    if (!token || token !== `Bearer ${authToken}`) {
      return res.status(403).json({ error: "😡 Unauthorized" });
    }

    if (!promptName) {
      return res.status(400).json({ error: "😡 Prompt name is required" });
    }

    try {
      // 🔹 Load existing prompts.yml
      let promptsData;
      try {
        const yamlFile = fs.readFileSync(promptsFilePath, "utf8");
        promptsData = jsyaml.load(yamlFile);
      } catch (error) {
        console.error("😡 Error loading prompts.yml:", error);
        return res
          .status(500)
          .json({ error: "😡 Failed to load prompts.yml" });
      }

      // 🔍 Find the prompt to remove
      if (!promptsData.prompts || !promptsData.prompts.predefined) {
        return res.status(404).json({ error: "😡 No prompts defined" });
      }

      const promptIndex = promptsData.prompts.predefined.findIndex(
        (p) => p.name === promptName
      );
      if (promptIndex === -1) {
        return res
          .status(404)
          .json({ error: `😡 Prompt ${promptName} not found` });
      }

      // Remove the prompt from the array
      promptsData.prompts.predefined.splice(promptIndex, 1);

      // ✍️ Save the updated prompts.yml
      try {
        fs.writeFileSync(promptsFilePath, jsyaml.dump(promptsData), "utf8");
        console.log(`✅ Prompt ${promptName} removed from prompts.yml`);
      } catch (error) {
        console.error("😡 Error saving prompts.yml:", error);
        return res
          .status(500)
          .json({ error: "😡 Failed to update prompts.yml" });
      }

      // 🔄 Unregister the prompt from the server
      try {
        if (server._registeredPrompts?.[promptName]) {
          delete server._registeredPrompts[promptName];
          console.log(`🗑 Unregistered prompt: ${promptName}`);
        }

        return res.status(200).json({
          message: `🙂 Prompt ${promptName} removed successfully`,
        });
      } catch (error) {
        console.error(`😡 Error unregistering prompt ${promptName}:`, error);
        return res.status(500).json({
          error: `😡 Failed to unregister prompt: ${error.message}`,
        });
      }
    } catch (error) {
      console.error("😡 Unexpected error:", error);
      return res
        .status(500)
        .json({ error: `😡 Unexpected error: ${error.message}` });
    }
  });

  //==============================================
  // 🟡 Update Prompt Endpoint
  //==============================================
  app.put("/update-prompt/:name", jsonParser, async (req, res) => {
    const token = req.headers["authorization"];
    const promptName = req.params.name;
    const promptData = req.body;

    // 🔒 Validate token
    if (!token || token !== `Bearer ${authToken}`) {
      return res.status(403).json({ error: "😡 Unauthorized" });
    }

    // 🔍 Validate prompt data
    if (
      !promptData ||
      !promptData.name ||
      !promptData.arguments ||
      !promptData.messages
    ) {
      return res.status(400).json({ error: "😡 Invalid prompt data" });
    }

    // Ensure the prompt name in the URL matches the one in the body
    if (promptName !== promptData.name) {
      return res
        .status(400)
        .json({ error: "😡 Prompt name mismatch between URL and body" });
    }

    try {
      // 🔹 Load existing prompts.yml
      let promptsData;
      try {
        const yamlFile = fs.readFileSync(promptsFilePath, "utf8");
        promptsData = jsyaml.load(yamlFile);
      } catch (error) {
        console.error("😡 Error loading prompts.yml:", error);
        return res
          .status(500)
          .json({ error: "😡 Failed to load prompts.yml" });
      }

      // 🔍 Find the prompt to update
      if (!promptsData.prompts || !promptsData.prompts.predefined) {
        return res.status(404).json({ error: "😡 No prompts defined" });
      }

      const promptIndex = promptsData.prompts.predefined.findIndex(
        (p) => p.name === promptName
      );
      if (promptIndex === -1) {
        return res
          .status(404)
          .json({ error: `😡 Prompt ${promptName} not found` });
      }

      // Store the old prompt for reference
      const oldPrompt = promptsData.prompts.predefined[promptIndex];

      // Replace the prompt with the new data
      promptsData.prompts.predefined[promptIndex] = promptData;

      // ✍️ Save the updated prompts.yml
      try {
        fs.writeFileSync(promptsFilePath, jsyaml.dump(promptsData), "utf8");
        console.log(`✅ Prompt ${promptName} updated in prompts.yml`);
      } catch (error) {
        console.error("😡 Error saving prompts.yml:", error);
        return res
          .status(500)
          .json({ error: "😡 Failed to update prompts.yml" });
      }

      // 🔄 Update the prompt in the server
      try {
        // First, unregister the existing prompt
        if (server._registeredPrompts?.[promptName]) {
          delete server._registeredPrompts[promptName];
          console.log(`🗑 Unregistered prompt before update: ${promptName}`);
        }

        // Then register the updated prompt
        // Build the schema object for Zod validation
        const schemaObj = {};
        promptData.arguments.forEach(arg => {
          // Map YAML type strings to Zod validators
          switch (arg.type.toLowerCase()) {
            case 'string':
              schemaObj[arg.name] = z.string();
              break;
            case 'number':
              schemaObj[arg.name] = z.number();
              break;
            case 'boolean':
              schemaObj[arg.name] = z.boolean();
              break;
            // Add other types as needed
            default:
              schemaObj[arg.name] = z.any();
          }
        });
        
        // Register the prompt with the server
        server.prompt(
          promptData.name,
          schemaObj,
          (args) => ({
            messages: promptData.messages.map(message => {
              // Replace template variables in the text
              let text = message.text;
              promptData.arguments.forEach(arg => {
                const regex = new RegExp(`\\$\\{${arg.name}\\}`, 'g');
                text = text.replace(regex, args[arg.name]);
              });
              
              return {
                role: message.role,
                content: {
                  type: "text",
                  text: text
                }
              };
            })
          })
        );

        console.log(`✅ Prompt ${promptName} re-registered with server`);
        return res.status(200).json({
          message: `🎉 Prompt ${promptName} updated successfully`,
          prompt: promptData,
        });
      } catch (error) {
        console.error(`😡 Error updating prompt ${promptName}:`, error);
        return res
          .status(500)
          .json({ error: `😡 Failed to update prompt: ${error.message}` });
      }
    } catch (error) {
      console.error("😡 Unexpected error:", error);
      return res
        .status(500)
        .json({ error: `😡 Unexpected error: ${error.message}` });
    }
  });
}
