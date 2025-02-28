// Register static resources from YAML
function registerStaticResources(server, resources) {
  
  // Register each static resource
  resources.resources.static.forEach(resource => {
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
  
  console.log(`✅ Registered ${resources.resources.static.length} static resources`);
}

// Usage example
// registerStaticResources(server, './resources.yaml');

export { registerStaticResources };