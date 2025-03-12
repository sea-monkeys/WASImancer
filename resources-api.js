import fs from "fs";
import path from "path";
import jsyaml from "js-yaml";
import express from "express";

/**
 * Registers resource management endpoints for the Express application
 * @param {Object} app - Express application instance
 * @param {Object} server - MCP server instance
 * @param {string} authToken - Authentication token for API endpoints
 * @param {string} resourcesPath - Path to resources directory
 * @param {string} resourcesDefinitionFile - Name of resources definition file (YAML)
 */
export function registerResourceApiEndpoints(
  app,
  server,
  authToken,
  resourcesPath,
  resourcesDefinitionFile
) {
  const resourcesFilePath = path.join(resourcesPath, resourcesDefinitionFile);

  // Apply JSON middleware only to these resource API routes
  const jsonParser = express.json();
  /*
    This approach applies the JSON parsing middleware only to the specific routes that need to parse JSON in the request body 
    (/add-resource and /update-resource/:name), leaving the other routes untouched.
  */

  //==============================================
  // 🟢 Add Resource Endpoint
  //==============================================
  app.post("/add-resource", jsonParser, async (req, res) => {
    const token = req.headers["authorization"];
    const resourceData = req.body;

    // 🔒 Validate the authentication token
    if (!token || token !== `Bearer ${authToken}`) {
      return res.status(403).json({ error: "😡 Unauthorized" });
    }

    // 🔍 Validate resource data

    //console.log("🅰 resourceData", resourceData);
    //console.log("🅱 resourceData", JSON.stringify(resourceData, null, 2));

    if (
      !resourceData ||
      !resourceData.name ||
      !resourceData.uri ||
      !resourceData.contents
    ) {
      return res.status(400).json({ error: "😡 Invalid resource data" });
    }

    try {
      // 🔹 Load existing resources.yml
      let resourcesData;
      try {
        const yamlFile = fs.readFileSync(resourcesFilePath, "utf8");
        resourcesData = jsyaml.load(yamlFile);
      } catch (error) {
        console.error("😡 Error loading resources.yml:", error);
        return res
          .status(500)
          .json({ error: "😡 Failed to load resources.yml" });
      }

      // 🛠 Ensure resourcesData structure exists
      if (!resourcesData.resources) {
        resourcesData.resources = { static: [], dynamic: [] };
      }
      if (!resourcesData.resources.static) {
        resourcesData.resources.static = [];
      }
      if (!resourcesData.resources.dynamic) {
        resourcesData.resources.dynamic = [];
      }

      // Determine resource type (static or dynamic) based on URI template format
      const isStatic =
        !resourceData.uri.includes("{") || !resourceData.arguments;
      const targetArray = isStatic
        ? resourcesData.resources.static
        : resourcesData.resources.dynamic;

      // 🔍 Check if the resource already exists
      const existingResourceIndex = targetArray.findIndex(
        (r) => r.name === resourceData.name
      );
      if (existingResourceIndex !== -1) {
        return res
          .status(400)
          .json({ error: `😡 Resource ${resourceData.name} already exists` });
      }

      // ➕ Add the new resource
      targetArray.push(resourceData);

      // ✍️ Save the updated resources.yml
      try {
        fs.writeFileSync(resourcesFilePath, jsyaml.dump(resourcesData), "utf8");
        console.log(`✅ Resource ${resourceData.name} added to resources.yml`);
      } catch (error) {
        console.error("😡 Error saving resources.yml:", error);
        return res
          .status(500)
          .json({ error: "😡 Failed to update resources.yml" });
      }

      // 🔄 Register the resource with the server
      try {
        if (isStatic) {
          server.resource(resourceData.name, resourceData.uri, async (uri) => ({
            contents: resourceData.contents.map((content) => ({
              uri: uri.href,
              ...content,
            })),
          }));
        } else {
          // For dynamic resources, we need to handle URI templates and arguments
          const template = new server.constructor.ResourceTemplate(
            resourceData.uri,
            { list: undefined }
          );

          server.resource(
            resourceData.name,
            template,
            async (uri, variables) => {
              // Process the contents, replacing template variables in the text
              const contents = resourceData.contents.map((content) => {
                let processedContent = { ...content };

                // If the content has text, replace template variables
                if (content.text) {
                  let text = content.text;
                  // Replace each variable in the template with its value
                  resourceData.arguments.forEach((arg) => {
                    const regex = new RegExp(`\\$\\{${arg.name}\\}`, "g");
                    text = text.replace(regex, variables[arg.name]);
                  });
                  processedContent.text = text;
                }

                // Add the URI to the content
                processedContent.uri = uri.href;

                return processedContent;
              });

              return { contents };
            }
          );
        }

        console.log(`✅ Resource ${resourceData.name} registered with server`);
        return res.status(200).json({
          message: `🎉 Resource ${resourceData.name} added successfully`,
          resource: resourceData,
        });
      } catch (error) {
        console.error(
          `😡 Error registering resource ${resourceData.name}:`,
          error
        );
        return res
          .status(500)
          .json({ error: `😡 Failed to register resource: ${error.message}` });
      }
    } catch (error) {
      console.error("😡 Unexpected error:", error);
      return res
        .status(500)
        .json({ error: `😡 Unexpected error: ${error.message}` });
    }
  });

  //==============================================
  // 🔴 Remove Resource Endpoint
  //==============================================
  app.delete("/remove-resource/:name", async (req, res) => {
    const token = req.headers["authorization"];
    const resourceName = req.params.name;

    // 🔒 Validate token
    if (!token || token !== `Bearer ${authToken}`) {
      return res.status(403).json({ error: "😡 Unauthorized" });
    }

    if (!resourceName) {
      return res.status(400).json({ error: "😡 Resource name is required" });
    }

    try {
      // 🔹 Load existing resources.yml
      let resourcesData;
      try {
        const yamlFile = fs.readFileSync(resourcesFilePath, "utf8");
        resourcesData = jsyaml.load(yamlFile);
      } catch (error) {
        console.error("😡 Error loading resources.yml:", error);
        return res
          .status(500)
          .json({ error: "😡 Failed to load resources.yml" });
      }

      // 🔍 Find the resource to remove - check both static and dynamic arrays
      let resourceFound = false;
      let resourceType = null;
      let resourceUri = null;

      if (resourcesData.resources.static) {
        const staticIndex = resourcesData.resources.static.findIndex(
          (r) => r.name === resourceName
        );
        if (staticIndex !== -1) {
          // get the uri of the resource to unregister it from the MCP server
          resourceUri = resourcesData.resources.static[staticIndex].uri;

          resourcesData.resources.static.splice(staticIndex, 1);
          resourceFound = true;
          resourceType = "static";
        }
      }

      if (!resourceFound && resourcesData.resources.dynamic) {
        const dynamicIndex = resourcesData.resources.dynamic.findIndex(
          (r) => r.name === resourceName
        );
        if (dynamicIndex !== -1) {
          // get the uri of the resource to unregister it from the MCP server
          resourceUri = resourcesData.resources.static[staticIndex].uri;

          resourcesData.resources.dynamic.splice(dynamicIndex, 1);
          resourceFound = true;
          resourceType = "dynamic";
        }
      }

      if (!resourceFound) {
        return res
          .status(404)
          .json({ error: `😡 Resource ${resourceName} not found` });
      }

      // ✍️ Save the updated resources.yml
      try {
        fs.writeFileSync(resourcesFilePath, jsyaml.dump(resourcesData), "utf8");
        console.log(`✅ Resource ${resourceName} removed from resources.yml`);
      } catch (error) {
        console.error("😡 Error saving resources.yml:", error);
        return res
          .status(500)
          .json({ error: "😡 Failed to update resources.yml" });
      }

      // 🔄 Unregister the resource from the server
      try {
        if (server._registeredResources?.[resourceUri]) {
          delete server._registeredResources[resourceUri];
          console.log(`🗑 Unregistered resource: ${resourceName} URI: ${resourceUri}`);
        }

        return res.status(200).json({
          message: `🙂 Resource ${resourceName} removed successfully`,
          type: resourceType,
        });
      } catch (error) {
        console.error(
          `😡 Error unregistering resource ${resourceName}:`,
          error
        );
        return res.status(500).json({
          error: `😡 Failed to unregister resource: ${error.message}`,
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
  // 🟡 Update Resource Endpoint
  //==============================================
  app.put("/update-resource/:name", jsonParser, async (req, res) => {
    const token = req.headers["authorization"];
    const resourceName = req.params.name;
    const resourceData = req.body;

    // 🔒 Validate token
    if (!token || token !== `Bearer ${authToken}`) {
      return res.status(403).json({ error: "😡 Unauthorized" });
    }

    // 🔍 Validate resource data
    if (
      !resourceData ||
      !resourceData.name ||
      !resourceData.uri ||
      !resourceData.contents
    ) {
      return res.status(400).json({ error: "😡 Invalid resource data" });
    }

    // Ensure the resource name in the URL matches the one in the body
    if (resourceName !== resourceData.name) {
      return res
        .status(400)
        .json({ error: "😡 Resource name mismatch between URL and body" });
    }

    try {
      // 🔹 Load existing resources.yml
      let resourcesData;
      try {
        const yamlFile = fs.readFileSync(resourcesFilePath, "utf8");
        resourcesData = jsyaml.load(yamlFile);
      } catch (error) {
        console.error("😡 Error loading resources.yml:", error);
        return res
          .status(500)
          .json({ error: "😡 Failed to load resources.yml" });
      }

      // 🔍 Find the resource to update - check both static and dynamic arrays
      let resourceFound = false;
      let oldResourceType = null;
      let oldResource = null;
      let resourceUri = null;

      // Determine new resource type
      const isStatic =
        !resourceData.uri.includes("{") || !resourceData.arguments;

      // Remove from static array if found
      if (resourcesData.resources.static) {
        const staticIndex = resourcesData.resources.static.findIndex(
          (r) => r.name === resourceName
        );
        if (staticIndex !== -1) {
          // get the uri of the resource to unregister it from the MCP server
          resourceUri = resourcesData.resources.static[staticIndex].uri;

          oldResource = resourcesData.resources.static[staticIndex];
          resourcesData.resources.static.splice(staticIndex, 1);
          resourceFound = true;
          oldResourceType = "static";
        }
      }

      // Remove from dynamic array if found
      if (!resourceFound && resourcesData.resources.dynamic) {
        const dynamicIndex = resourcesData.resources.dynamic.findIndex(
          (r) => r.name === resourceName
        );
        if (dynamicIndex !== -1) {
          // get the uri of the resource to unregister it from the MCP server
          resourceUri = resourcesData.resources.static[staticIndex].uri;

          oldResource = resourcesData.resources.dynamic[dynamicIndex];
          resourcesData.resources.dynamic.splice(dynamicIndex, 1);
          resourceFound = true;
          oldResourceType = "dynamic";
        }
      }

      if (!resourceFound) {
        return res
          .status(404)
          .json({ error: `😡 Resource ${resourceName} not found` });
      }

      // Add the updated resource to the appropriate array
      if (isStatic) {
        resourcesData.resources.static.push(resourceData);
      } else {
        resourcesData.resources.dynamic.push(resourceData);
      }

      // ✍️ Save the updated resources.yml
      try {
        fs.writeFileSync(resourcesFilePath, jsyaml.dump(resourcesData), "utf8");
        console.log(`✅ Resource ${resourceName} updated in resources.yml`);
      } catch (error) {
        console.error("😡 Error saving resources.yml:", error);
        return res
          .status(500)
          .json({ error: "😡 Failed to update resources.yml" });
      }

      // 🔄 Update the resource in the server
      try {
        // First, unregister the existing resource
        if (server._registeredResources?.[resourceUri]) {
          delete server._registeredResources[resourceUri];
          console.log(`🗑 Unregistered resource before update: ${resourceName} URI: ${resourceUri}`);
        }

        // Then register the updated resource
        if (isStatic) {
          server.resource(resourceData.name, resourceData.uri, async (uri) => ({
            contents: resourceData.contents.map((content) => ({
              uri: uri.href,
              ...content,
            })),
          }));
        } else {
          // For dynamic resources, handle URI templates and arguments
          const template = new server.constructor.ResourceTemplate(
            resourceData.uri,
            { list: undefined }
          );

          server.resource(
            resourceData.name,
            template,
            async (uri, variables) => {
              // Process the contents, replacing template variables in the text
              const contents = resourceData.contents.map((content) => {
                let processedContent = { ...content };

                // If the content has text, replace template variables
                if (content.text) {
                  let text = content.text;
                  // Replace each variable in the template with its value
                  resourceData.arguments.forEach((arg) => {
                    const regex = new RegExp(`\\$\\{${arg.name}\\}`, "g");
                    text = text.replace(regex, variables[arg.name]);
                  });
                  processedContent.text = text;
                }

                // Add the URI to the content
                processedContent.uri = uri.href;

                return processedContent;
              });

              return { contents };
            }
          );
        }

        console.log(`✅ Resource ${resourceName} re-registered with server`);
        return res.status(200).json({
          message: `🎉 Resource ${resourceName} updated successfully`,
          oldType: oldResourceType,
          newType: isStatic ? "static" : "dynamic",
          resource: resourceData,
        });
      } catch (error) {
        console.error(`😡 Error updating resource ${resourceName}:`, error);
        return res
          .status(500)
          .json({ error: `😡 Failed to update resource: ${error.message}` });
      }
    } catch (error) {
      console.error("😡 Unexpected error:", error);
      return res
        .status(500)
        .json({ error: `😡 Unexpected error: ${error.message}` });
    }
  });
}
