import { createZodSchema } from './zod-utils.js';
import createPlugin from '@extism/extism';

/**
 * 
 * @param {Object} server - The server object to register plugins with
 * @param {string} pluginsPath - Path to the plugins directory
 * @param {Object} pluginsData - The plugins data object containing plugin definitions
 */

export async function createTools(server, pluginsPath, pluginsData) {
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