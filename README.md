# WASImancer: A WebAssembly-Powered MCP SSE Server

WASImancer is an innovative Model Context Protocol (MCP) server built with Node.js that enhances tool execution through WebAssembly plugins. Leveraging the [Extism](https://extism.org/) framework, it enables seamless integration of WebAssembly modules as plugin functions, creating a flexible and powerful environment for model interactions.

What makes WASImancer special is its ability to load and execute tools as WebAssembly plugin functions, providing:

- Fast, near-native performance for tool execution
- Language-agnostic plugin development through WebAssembly
- Secure sandboxed execution environment
- Seamless integration with the Model Context Protocol
- Easy extensibility through the Extism plugin framework

Think of **WASImancer** as a bridge between the MCP ecosystem and the vast possibilities of WebAssembly, allowing developers to write plugins in their preferred language while maintaining high performance and security.

## Authentication and Admin tokens

WASImancer needs two tokens, and you can set these two tokens with environment variables:

1. A **bearer authentication token** to protect the SSE endpoints (the communications between the MCP Client and the MCP Server), use `WASIMANCER_AUTHENTICATION_TOKEN=mcp-is-the-way` (if you want to disable the authentication, set it to `NO_AUTHENTICATION`).

   > ⚠️ **Important**: The authentication token is used to protect the SSE endpoints. If you don't set it, anyone can connect to your server and send commands. This is a security risk, so make sure to set it in production.

   > ⚠️ **Important**: The authentication token is used to protect the SSE endpoints. If you don't set it, anyone can connect to your server and send commands. This is a security risk, so make sure to set it in production.
2. A **bearer admin token** to protect the prompts, ressources and tools management endpoints (eg: uploading a new tool, removing a resource...), use `WASIMANCER_ADMIN_TOKEN=wasimancer-rocks`

> ✋ If you don't set these tokens, the server will generate them for you at evry start (Look at the logs). You can use them to test the server, but you should set your own tokens for production.

## Start WASImancer

```bash
node index.js
```

Or:
```bash
docker compose --file compose.dev.yml up --build
```

## You can use the [Inspector project](https://github.com/modelcontextprotocol/inspector) to test WASImancer

```bash
#npm install @modelcontextprotocol/sdk
npx @modelcontextprotocol/inspector
```

## Start Docker distribution of WASImancer

```bash
docker run --rm -p 3001:3001 \
  -e HTTP_PORT=3001 \
  -e PLUGINS_PATH=./plugins \
  -e PLUGINS_DEFINITION_FILE=plugins.yml \
  -v "$(pwd)/plugins":/app/plugins \
  -e RESOURCES_PATH=./resources \
  -e RESOURCES_DEFINITION_FILE=resources.yml \
  -v "$(pwd)/resources":/app/resources \
  -e PROMPTS_PATH=./prompts \
  -e PROMPTS_DEFINITION_FILE=prompts.yml \
  -v "$(pwd)/prompts":/app/prompts \
  -e WASIMANCER_ADMIN_TOKEN=wasimancer-rocks \
  -e WASIMANCER_AUTHENTICATION_TOKEN=mcp-is-the-way \
  -e UPLOAD_PATH=./plugins/bucket \
  k33g/wasimancer:0.0.6 
```

Or with Docker Compose:

```yaml
services:  
  wasimancer-server:
    image: k33g/wasimancer:0.0.6
    environment:
      - HTTP_PORT=3001
      - PLUGINS_PATH=./plugins
      - PLUGINS_DEFINITION_FILE=plugins.yml
      - RESOURCES_PATH=./resources
      - RESOURCES_DEFINITION_FILE=resources.yml
      - PROMPTS_PATH=./prompts
      - PROMPTS_DEFINITION_FILE=prompts.yml
      - WASIMANCER_ADMIN_TOKEN=wasimancer-rocks
      - WASIMANCER_AUTHENTICATION_TOKEN=mcp-is-the-way
      - UPLOAD_PATH=./plugins/bucket
    ports:
      - 3001:3001
    volumes:
      - ./resources:/app/resources
      - ./plugins:/app/plugins
      - ./prompts:/app/prompts

```

```bash
docker compose up
```