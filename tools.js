import { createZodSchema } from './zod-utils.js';
import createPlugin from '@extism/extism';

import fs from "fs";
import jsyaml from "js-yaml";
import path from "path";


/**
 * 
 * @param {Object} server - The server object to register plugins with
 * @param {string} pluginsPath - Path to the plugins directory
 * @param {Object} pluginsData - The plugins data object containing plugin definitions
 */

export async function loadPlugins(server, pluginsPath, pluginsData) {
  // a plugin can have multiple functions
  // a function is a tool in the MCP server
  console.log("🤖 browse wasm plugins and create tools...");
  
  for (const [pluginIndex, plugin] of pluginsData.plugins.entries()) {
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

//! DEPRECATED
/**
 * Loads a single plugin dynamically into the MCP server.
 *
 * @param {Object} server - The MCP server instance
 * @param {string} pluginsPath - Path to the plugins directory
 * @param {Object} pluginData - JSON object defining the plugin
 * @deprecated Use `addPluginAndUpdateYaml` instead
 */
export async function loadSinglePlugin(server, pluginsPath, pluginData) {
  try {
    console.log(`🔌 Loading plugin: ${pluginData.name}`);
    console.log(`  📂 Path: ${pluginData.path}`);
    console.log(`  📝 Description: ${pluginData.description}`);

    // 🔹 Create plugin instance
    const wamPlugin = await createPlugin(`${pluginsPath}/${pluginData.path}`, {
      useWasi: true,
      logger: console,
      runInWorker: true,
      logLevel: "trace",
      allowedHosts: ["*"],
    });

    console.log(`  ✅ Plugin instance created`);

    // 🔹 Register each function inside the plugin
    await Promise.all(
      pluginData.functions.map(async (funcSpec) => {
        console.log(`    🔧 Registering function: ${funcSpec.displayName}`);

        // Build Zod schema for function arguments
        const schemaObj = {};
        if (funcSpec.arguments && funcSpec.arguments.length > 0) {
          funcSpec.arguments.forEach((arg) => {
            schemaObj[arg.name] = createZodSchema(arg.type);
          });
        }

        // Register function in the MCP server
        server.tool(
          funcSpec.displayName,
          schemaObj,
          async (args) => {
            const inputData = JSON.stringify(args);
            let out = await wamPlugin.call(funcSpec.function, inputData);
            return {
              content: [{ type: "text", text: out.text() }],
            };
          }
        );

        console.log(`    ✅ Function ${funcSpec.displayName} registered`);
      })
    );

    console.log(`✅ Plugin ${pluginData.name} successfully loaded`);
    return { success: true, message: `Plugin ${pluginData.name} loaded` };
  } catch (error) {
    console.error(`❌ Error loading plugin ${pluginData.name}:`, error);
    return { success: false, error: error.message };
  }
}


/**
 * Adds a new plugin, updates plugins.yml, and loads it into the MCP server.
 *
 * @param {Object} server - The MCP server instance
 * @param {string} pluginsPath - Path to the plugins directory
 * @param {string} pluginsDefinitionFile - Path to plugins.yml
 * @param {Object} pluginData - The plugin metadata (JSON format)
 * @returns {Object} Success or error message
 */
export async function addPluginAndUpdateYaml(server, pluginsPath, pluginsDefinitionFile, pluginData) {
  const pluginsFilePath = path.join(pluginsPath, pluginsDefinitionFile);

  // 🔹 Load existing plugins.yml
  let pluginsData;
  try {
    const yamlFile = fs.readFileSync(pluginsFilePath, "utf8");
    pluginsData = jsyaml.load(yamlFile);
  } catch (error) {
    console.error("❌ Error loading plugins.yml:", error);
    return { success: false, error: "Failed to load plugins.yml" };
  }

  // 🛠 Ensure pluginsData structure exists
  if (!pluginsData.plugins) {
    pluginsData.plugins = [];
  }

  // 🔍 Check if the plugin already exists
  const existingPlugin = pluginsData.plugins.find((p) => p.name === pluginData.name);
  if (existingPlugin) {
    return { success: false, error: `Plugin ${pluginData.name} already exists` };
  }

  // ➕ Add the new plugin to plugins.yml
  pluginsData.plugins.push(pluginData);

  // ✍️ Save the updated plugins.yml
  try {
    fs.writeFileSync(pluginsFilePath, jsyaml.dump(pluginsData), "utf8");
    console.log(`✅ Plugin ${pluginData.name} added to plugins.yml`);
  } catch (error) {
    console.error("❌ Error saving plugins.yml:", error);
    return { success: false, error: "Failed to update plugins.yml" };
  }

  // 🚀 Load the plugin dynamically into the server
  try {
    console.log(`🔌 Loading plugin: ${pluginData.name}`);

    // Create plugin instance
    const wamPlugin = await createPlugin(`${pluginsPath}/${pluginData.path}`, {
      useWasi: true,
      logger: console,
      runInWorker: true,
      logLevel: "trace",
      allowedHosts: ["*"],
    });

    console.log(`✅ Plugin instance created`);

    // Register each function
    await Promise.all(
      pluginData.functions.map(async (funcSpec) => {
        console.log(`    🔧 Registering function: ${funcSpec.displayName}`);

        // Build Zod schema for function arguments
        const schemaObj = {};
        if (funcSpec.arguments && funcSpec.arguments.length > 0) {
          funcSpec.arguments.forEach((arg) => {
            schemaObj[arg.name] = createZodSchema(arg.type);
          });
        }

        // Register function in the MCP server
        server.tool(
          funcSpec.displayName,
          schemaObj,
          async (args) => {
            const inputData = JSON.stringify(args);
            let out = await wamPlugin.call(funcSpec.function, inputData);
            return {
              content: [{ type: "text", text: out.text() }],
            };
          }
        );

        console.log(`    ✅ Function ${funcSpec.displayName} registered`);
      })
    );

    console.log(`✅ Plugin ${pluginData.name} successfully loaded into MCP`);
    return { success: true, message: `Plugin ${pluginData.name} added, updated plugins.yml, and loaded` };
  } catch (error) {
    console.error(`❌ Error loading plugin ${pluginData.name}:`, error);
    return { success: false, error: error.message };
  }
}



/**
 * Removes a plugin from plugins.yml, unregisters its tools, and deletes the plugin file.
 *
 * @param {Object} server - The MCP server instance
 * @param {string} pluginsPath - Path to the plugins directory
 * @param {string} pluginsDefinitionFile - Path to plugins.yml
 * @param {string} pluginName - The name of the plugin to remove
 * @returns {Object} Success or error message
 */
export async function removePluginAndUpdateYaml(server, pluginsPath, pluginsDefinitionFile, pluginName) {
  const pluginsFilePath = path.join(pluginsPath, pluginsDefinitionFile);

  // 🔹 Load existing plugins.yml
  let pluginsData;
  try {
    const yamlFile = fs.readFileSync(pluginsFilePath, "utf8");
    pluginsData = jsyaml.load(yamlFile);
  } catch (error) {
    console.error("❌ Error loading plugins.yml:", error);
    return { success: false, error: "Failed to load plugins.yml" };
  }

  // 🔍 Find the plugin to remove
  const pluginIndex = pluginsData.plugins.findIndex((p) => p.name === pluginName);
  if (pluginIndex === -1) {
    return { success: false, error: `Plugin ${pluginName} not found in plugins.yml` };
  }

  // 📌 Get plugin details before removal
  const pluginData = pluginsData.plugins[pluginIndex];
  const pluginFilePath = path.join(pluginsPath, pluginData.path);

  // 🗑 Remove the plugin from the YAML file
  pluginsData.plugins.splice(pluginIndex, 1);

  // ✍️ Save the updated plugins.yml
  try {
    fs.writeFileSync(pluginsFilePath, jsyaml.dump(pluginsData), "utf8");
    console.log(`✅ Plugin ${pluginName} removed from plugins.yml`);
  } catch (error) {
    console.error("❌ Error saving plugins.yml:", error);
    return { success: false, error: "Failed to update plugins.yml" };
  }

  // 🔄 Unregister plugin tools from MCP server
  if (pluginData.functions) {
    pluginData.functions.forEach((func) => {
      if (server._registeredTools?.[func.displayName]) {
        console.log(`🗑 Removing tool: ${func.displayName}`);
        delete server._registeredTools[func.displayName];
      }
    });

    // Re-register `tools/call` with remaining tools
    /*
    if (Object.keys(server._registeredTools).length > 0) {
      server.setRequestHandler(
        { method: "tools/call" },
        async (request, extra) => {
          const tool = server._registeredTools[request.params.name];
          if (!tool) {
            throw new Error(`Tool ${request.params.name} not found`);
          }
          return tool.callback(request.params.arguments, extra);
        }
      );
    } else {
      server.removeRequestHandler("tools/call");
    }
    */

    console.log(`✅ Plugin ${pluginName} tools unregistered`);
  }

  // 🗑 Delete the .wasm file
  try {
    if (fs.existsSync(pluginFilePath)) {
      fs.unlinkSync(pluginFilePath);
      console.log(`🗑 Plugin file deleted: ${pluginFilePath}`);
    } else {
      console.warn(`⚠️ Plugin file not found: ${pluginFilePath}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting plugin file: ${error.message}`);
    return { success: false, error: `Failed to delete plugin file: ${error.message}` };
  }

  return { success: true, message: `Plugin ${pluginName} removed, tools unregistered, and file deleted` };

}


/**
 * Overrides a plugin by replacing it with a new version, unregistering old tools, and updating plugins.yml.
 *
 * @param {Object} server - The MCP server instance
 * @param {string} pluginsPath - Path to the plugins directory
 * @param {string} pluginsDefinitionFile - Path to plugins.yml
 * @param {Object} pluginData - The new plugin metadata (JSON format)
 * @param {string} uploadedFilePath - Path to the newly uploaded .wasm file
 * @returns {Object} Success or error message
 */
export async function overridePluginAndUpdateYaml(server, pluginsPath, pluginsDefinitionFile, pluginData, uploadedFilePath) {
  if (!uploadedFilePath) {
    return { success: false, error: "Missing uploaded file path" };
  }

  const pluginsFilePath = path.join(pluginsPath, pluginsDefinitionFile);

  // 🔹 Load existing plugins.yml
  let pluginsData;
  try {
    const yamlFile = fs.readFileSync(pluginsFilePath, "utf8");
    pluginsData = jsyaml.load(yamlFile);
  } catch (error) {
    console.error("❌ Error loading plugins.yml:", error);
    return { success: false, error: "Failed to load plugins.yml" };
  }

  // 🔍 Find the plugin to override
  const pluginIndex = pluginsData.plugins.findIndex((p) => p.name === pluginData.name);
  if (pluginIndex === -1) {
    return { success: false, error: `Plugin ${pluginData.name} not found in plugins.yml` };
  }

  // 📌 Get old plugin details before replacement
  const oldPluginData = pluginsData.plugins[pluginIndex];
  const oldPluginFilePath = path.join(pluginsPath, oldPluginData.path);

  // 🗑 Delete the old `.wasm` file
  try {
    if (fs.existsSync(oldPluginFilePath)) {
      fs.unlinkSync(oldPluginFilePath);
      console.log(`🗑 Old plugin file deleted: ${oldPluginFilePath}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting old plugin file: ${error.message}`);
  }

  // ✅ Ensure `path` field in `pluginData` is updated correctly
  const relativePath = uploadedFilePath.replace(`${pluginsPath}/`, "");
  pluginData.path = `./${relativePath}`; // Ensure correct relative path format

  // ✍️ Replace the plugin in `plugins.yml`
  pluginsData.plugins[pluginIndex] = pluginData;

  try {
    fs.writeFileSync(pluginsFilePath, jsyaml.dump(pluginsData), "utf8");
    console.log(`✅ Plugin ${pluginData.name} overridden in plugins.yml with new path: ${pluginData.path}`);
  } catch (error) {
    console.error("❌ Error saving plugins.yml:", error);
    return { success: false, error: "Failed to update plugins.yml" };
  }

  // 🔄 Unregister old tools from MCP server
  if (oldPluginData.functions) {
    oldPluginData.functions.forEach((func) => {
      if (server._registeredTools?.[func.displayName]) {
        console.log(`🗑 Removing old tool: ${func.displayName}`);
        delete server._registeredTools[func.displayName];
      }
    });
  }

  // 🚀 Load the new plugin dynamically
  try {
    console.log(`🔌 Loading new version of plugin: ${pluginData.name}`);

    // Create new plugin instance
    const wamPlugin = await createPlugin(uploadedFilePath, {
      useWasi: true,
      logger: console,
      runInWorker: true,
      logLevel: "trace",
      allowedHosts: ["*"],
    });

    console.log(`✅ Plugin instance created`);

    // Register new functions
    await Promise.all(
      pluginData.functions.map(async (funcSpec) => {
        console.log(`    🔧 Registering function: ${funcSpec.displayName}`);

        // Build Zod schema for function arguments
        const schemaObj = {};
        if (funcSpec.arguments && funcSpec.arguments.length > 0) {
          funcSpec.arguments.forEach((arg) => {
            schemaObj[arg.name] = createZodSchema(arg.type);
          });
        }

        // Register function in the MCP server
        server.tool(
          funcSpec.displayName,
          schemaObj,
          async (args) => {
            const inputData = JSON.stringify(args);
            let out = await wamPlugin.call(funcSpec.function, inputData);
            return {
              content: [{ type: "text", text: out.text() }],
            };
          }
        );

        console.log(`    ✅ Function ${funcSpec.displayName} registered`);
      })
    );

    console.log(`✅ Plugin ${pluginData.name} successfully overridden and loaded`);
    return { success: true, message: `Plugin ${pluginData.name} overridden, updated plugins.yml, and loaded` };
  } catch (error) {
    console.error(`❌ Error loading new plugin ${pluginData.name}:`, error);
    return { success: false, error: error.message };
  }
}
