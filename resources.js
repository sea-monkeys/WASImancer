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

export { registerStaticResources };