# WASImancer: A WebAssembly-Powered MCP SSE Server

WASImancer is an innovative Model Context Protocol (MCP) server built with Node.js that enhances tool execution through WebAssembly plugins. Leveraging the [Extism](https://extism.org/) framework, it enables seamless integration of WebAssembly modules as plugin functions, creating a flexible and powerful environment for model interactions.

What makes WASImancer special is its ability to load and execute tools as WebAssembly plugin functions, providing:

- Fast, near-native performance for tool execution
- Language-agnostic plugin development through WebAssembly
- Secure sandboxed execution environment
- Seamless integration with the Model Context Protocol
- Easy extensibility through the Extism plugin framework

Think of **WASImancer** as a bridge between the MCP ecosystem and the vast possibilities of WebAssembly, allowing developers to write plugins in their preferred language while maintaining high performance and security.

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
  k33g/wasimancer:preview 
```

Or with Docker Compose:

```yaml
services:  
  wasimancer-server:
    image: k33g/wasimancer:preview
    environment:
      - HTTP_PORT=3001
      - PLUGINS_PATH=./plugins
      - PLUGINS_DEFINITION_FILE=plugins.yml
      - RESOURCES_PATH=./resources
      - RESOURCES_DEFINITION_FILE=resources.yml
    ports:
      - 3001:3001
    volumes:
      - ./resources:/app/resources
      - ./plugins:/app/plugins
```

```bash
docker compose up
```