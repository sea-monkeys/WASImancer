import { z } from 'zod'; // Assuming you're using Zod for validation

/**
 * Registers prompts defined in a YAML file with the server
 * 
 * @param {Object} server - The server object to register prompts with
 * @param {string} yamlFilePath - Path to the YAML file containing prompt definitions
 */
function registerPredefinedPrompts(server, promptsData) {
  
  // Register each predefined prompt
  promptsData.prompts.predefined.forEach(prompt => {
    // Build the schema object for Zod validation
    const schemaObj = {};

    prompt.arguments.forEach(arg => {
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
      prompt.name,
      schemaObj,
      (args) => ({
        messages: prompt.messages.map(message => {
          // Replace template variables in the text
          let text = message.text;
          prompt.arguments.forEach(arg => {
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
    
    console.log(`✅ Registered prompt: ${prompt.name}`);
  });
  
  console.log(`✅ Total prompts registered: ${promptsData.prompts.predefined.length}`);
}

export { registerPredefinedPrompts };