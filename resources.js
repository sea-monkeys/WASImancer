import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";


/**
 * Registers static resources defined in a YAML file with the server
 * 
 * @param {Object} server - The server object to register resources with
 * @param {Object} resourcesData - The resources data object containing static resources
 */
function registerStaticResources(server, resourcesData) {
  
  // Register each static resource
  resourcesData.resources.static.forEach(resource => {
    server.resource(
      resource.name,
      resource.uri,
      async (uri) => ({
        contents: resource.contents.map(content => ({
          uri: uri.href, // required field
          ...content     // spread all other properties from YAML
        }))
      })
    );
  });
  
  console.log(`✅ Registered ${resourcesData.resources.static.length} static resources`);
}

/**
 * Registers dynamic resources defined in a YAML file with the server
 * 
 * @param {Object} server - The server object to register resources with
 * @param {Object} resourcesData - The resources data object containing dynamic resources
 */
function registerDynamicResources(server, resourcesData) {
  if (!resourcesData.resources || !resourcesData.resources.dynamic) {
    console.log("No dynamic resources defined");
    return;
  }
  
  // Register each dynamic resource
  resourcesData.resources.dynamic.forEach(resource => {
    // Create a ResourceTemplate for the URI template
    const template = new ResourceTemplate(resource.uri, { list: undefined });
    
    server.resource(
      resource.name,
      template,
      async (uri, variables) => {
        // Process the contents, replacing template variables in the text
        const contents = resource.contents.map(content => {
          let processedContent = { ...content };
          
          // If the content has text, replace template variables
          if (content.text) {
            let text = content.text;
            // Replace each variable in the template with its value
            resource.arguments.forEach(arg => {
              const regex = new RegExp(`\\$\\{${arg.name}\\}`, 'g');
              text = text.replace(regex, variables[arg.name]);
            });
            processedContent.text = text;
          }
          
          // Add the URI to the content
          processedContent.uri = uri.href;
          
          return processedContent;
        });
        
        return {
          contents: contents
        };
      }
    );
    
    console.log(`✅ Registered dynamic resource: ${resource.name} with URI template: ${resource.uri}`);
  });
  
  console.log(`✅ Total dynamic resources registered: ${resourcesData.resources.dynamic.length}`);
}


export { registerStaticResources , registerDynamicResources};

