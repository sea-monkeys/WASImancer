import express from "express";
import crypto from "crypto";

import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import multer from "multer";
import path from "path";

// project helpers
import {
  loadPluginsYamlFile,
  loadResourcesYamlFile,
  loadPromptsYamlFile,
} from "./yaml-utils.js";

import { registerAndLoadPlugins } from "./tools.js";

import {
  registerStaticResources,
  registerDynamicResources,
} from "./resources.js";

import { registerPredefinedPrompts } from "./prompts.js";

import { registerResourceApiEndpoints } from "./resources-api.js";
import { registerPromptApiEndpoints } from "./prompts-api.js";
import { registerToolApiEndpoints } from "./tools-api.js";
import { copyFileSync } from "fs";

// This function generate a token if the environment variable
//  WASIMANCER_ADMIN_TOKEN is not set
function generateBearerAdminToken() {
  const token = crypto.randomBytes(16).toString("hex");
  console.log(`🔐 Generated authentication token: ${token}`);
  console.log(
    `🔐 Set authentication token in your environment variables: export WASIMANCER_ADMIN_TOKEN=${token}`
  );
  return token;
}

// This function generate a token if the environment variables
// WASIMANCER_AUTHENTICATION_TOKEN is not set
function generateBearerAuthenticationToken() {
  const token = crypto.randomBytes(16).toString("hex");
  console.log(`🔐 Generated bearer token: ${token}`);
  console.log(
    `🔐 Set bearer token in your environment variables: export WASIMANCER_AUTHENTICATION_TOKEN=${token}`
  );
  return token;
}

const adminToken =
  process.env.WASIMANCER_ADMIN_TOKEN || generateBearerAdminToken();

const bearerToken =
  process.env.WASIMANCER_AUTHENTICATION_TOKEN ||
  generateBearerAuthenticationToken();

const server = new McpServer({
  name: "wasimancer-server",
  version: "0.0.7",
  auth: {
    type: "bearer",
    token: bearerToken,
  },
});

// Add this after server initialization
console.log("🔑 Server configured with bearer token:", bearerToken);

function getServer() {
  return server;
}

function getAuthenticationRequestMiddelware(bearerToken) {
  if (bearerToken === "NO_AUTHENTICATION") {
    return (req, res, next) => {
      // No authentication required
      // you need to set the environment variable
      // WASIMANCER_AUTHENTICATION_TOKEN to NO_AUTHENTICATION
      next();
    };
  } else {
    return (req, res, next) => {
      const authHeader = req.headers.authorization;

      if (process.env.DEBUG) {
        console.log("✋ Debug: headers:", req.headers);
        console.log("📝 Received auth header:", authHeader);
        console.log("🔐 Expected token:", bearerToken);
      }

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ Missing or invalid Authorization header format");
        res.status(401).send("Unauthorized: Missing or invalid token");
        return;
      }

      const token = authHeader.split(" ")[1];
      if (token !== bearerToken) {
        console.log("❌ Token mismatch");
        res.status(401).send("Unauthorized: Invalid token");
        return;
      }
      console.log("✅ Authentication successful");

      next();
    };
  }
}

async function startServer() {
  const app = express();
  //app.use(express.json()); you cannot use it otherwise you will not be able use the SSE transport
  var transport = null;

  // Authentication middleware
  const authenticateRequest = getAuthenticationRequestMiddelware(bearerToken);

  //!==============================================
  //! PLUGINS ? TOOLS
  //!==============================================
  let pluginsPath = process.env.PLUGINS_PATH || "";
  const usePlugins = pluginsPath !== "" ? true : false;
  if (usePlugins) {
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

    // Default plugin directory
    const uploadRootPath = process.env.UPLOAD_PATH || "./plugins";
    //const  uploadRootPath = pluginsPath;

    // 📝 Define the upload middleware (using Multer)
    const uploadMiddelware = multer({
      dest: `${pluginsPath}/tmp-uploads/`, // Temporary directory
      limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB
      fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname) !== ".wasm") {
          return cb(new Error("✋ Only .wasm files are allowed"));
        }
        cb(null, true);
      },
    });

    //==============================================
    // Create the WASM MCP server tools
    //==============================================
    await registerAndLoadPlugins(server, pluginsPath, pluginsData);

    //==============================================
    // ⏺️ Register Plugin Management API Endpoints
    //==============================================
    registerToolApiEndpoints(
      app,
      server,
      adminToken,
      uploadRootPath,
      pluginsPath,
      pluginsDefinitionFile,
      uploadMiddelware
    );
  }

  //!==============================================
  //! RESOURCES
  //!==============================================
  //let resourcesPath = process.env.RESOURCES_PATH || "./resources";
  let resourcesPath = process.env.RESOURCES_PATH || "";
  const useResources = resourcesPath !== "" ? true : false;

  if (useResources) {
    let resourcesDefinitionFile =
      process.env.RESOURCES_DEFINITION_FILE || "resources.yml";

    const { resourcesData, errorResources: errorResource } =
      loadResourcesYamlFile(resourcesPath, resourcesDefinitionFile);
    if (errorResource) {
      console.log("😠:", errorResource);
      //process.exit(1);
    }

    //==============================================
    // Register the static resources
    //==============================================
    registerStaticResources(server, resourcesData);

    //==============================================
    // Register the dynamic resources
    //==============================================
    registerDynamicResources(server, resourcesData);

    //===============================================
    // ⏺️ Register Resource Management API Endpoints
    //===============================================
    registerResourceApiEndpoints(
      app,
      server,
      adminToken,
      resourcesPath,
      resourcesDefinitionFile
    );
  }

  //!==============================================
  //! PROMPTS
  //!==============================================
  let promptsPath = process.env.PROMPTS_PATH || "";
  const usePrompts = promptsPath !== "" ? true : false;

  if (usePrompts) {
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

    //==============================================
    // Register the predefined prompts
    //==============================================
    registerPredefinedPrompts(server, promptsData);

    //===============================================
    // ⏺️ Register Prompt Management API Endpoints
    //===============================================
    registerPromptApiEndpoints(
      app,
      server,
      adminToken,
      promptsPath,
      promptsDefinitionFile
    );
  }

  app.post("/mcp", authenticateRequest, async (req, res) => {
    // In stateless mode, create a new instance of transport and server for each request
    // to ensure complete isolation. A single instance would cause request ID collisions
    // when multiple clients connect concurrently.

    try {
      const server = getServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      res.on("close", () => {
        console.log("Request closed");
        transport.close();
        server.close();
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });

  /*
  app.get("/sse", authenticateRequest, async (req, res) => {
    transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);
  });
  */

  app.get("/mcp", authenticateRequest, async (req, res) => {
    transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);
  });

  app.post("/messages", authenticateRequest, async (req, res) => {
    await transport.handlePostMessage(req, res);
  });

  // Get HTTP_PORT from environment or default to 3001
  const HTTP_PORT = process.env.PORT || 3001;

  app.listen(HTTP_PORT, () => {
    console.log(
      `🚀🤖 MCP Stateless Streamable HTTP Server ready at http://0.0.0.0:${HTTP_PORT}`
    );
  });
}

startServer();
