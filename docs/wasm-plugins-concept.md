# Understanding WebAssembly Plugins in WASImancer
!!! info "🚧 work in progress"

## What are WebAssembly Plugins?

In WASImancer, WebAssembly (WASM) plugins are the building blocks that enable the MCP server to execute tools. These plugins are compiled WebAssembly modules that:

1. Contain one or more functions that can be called by the MCP server
2. Run in a sandboxed environment for security
3. Execute at near-native speed
4. Can be written in multiple programming languages

WebAssembly serves as a portable compilation target, allowing developers to write code in their preferred language (Go, Rust, C++, etc.) and compile it to a standard binary format that can be executed in WASImancer.

## How Plugins Work in WASImancer

### Plugin Architecture

WASImancer uses the [Extism](https://extism.org/) framework to load and execute WebAssembly plugins. The architecture follows these principles:

1. **Isolation**: Each plugin runs in its own isolated environment
2. **Communication**: Data is passed between the host (WASImancer) and the plugin via function parameters and return values
3. **Registration**: Plugins are registered with the MCP server and exposed as tools
4. **Execution**: When a client requests a tool, the server calls the corresponding function in the WASM plugin

### Plugin Definition in YAML

Plugins are defined in the `plugins.yml` file, which maps WebAssembly modules to MCP tools:

```yaml
plugins:
  - name: roll dice           # Name of the plugin
    path: ./roll-dice/wasimancer-plugin-roll-dice.wasm  # Path to the WASM file
    version: 1.0.0            # Version information
    description: roll dice     # Description of the plugin
    functions:
      - displayName: rollDice  # The tool name exposed to clients
        function: rollDice     # The exported function in the WASM module
        arguments:             # Input parameters for the function
          - name: numFaces
            type: number
            description: number of faces on the dice
          - name: numDice
            type: number
            description: number of dice to roll
        description: a function to roll dice  # Tool description
```

This configuration:
1. Tells WASImancer where to find the WASM module
2. Defines which functions to expose as tools
3. Specifies the expected input parameters
4. Provides descriptions for documentation

## Plugin Development

### Supported Languages

You can develop plugins for WASImancer in any language that compiles to WebAssembly with WASI support. Commonly used languages include:

- **Go** (using TinyGo)
- **Rust**
- **C/C++**
- **AssemblyScript**

### Development Workflow

1. **Write your plugin code** in your preferred language
2. **Compile to WebAssembly** using the appropriate toolchain
3. **Test locally** using the Extism CLI
4. **Deploy to WASImancer** by placing the WASM file in the plugins directory
5. **Configure in plugins.yml** to expose your functions as tools

### Example: Go Plugin

Here's a simple plugin written in Go that rolls dice:

```go
package main

import (
	"encoding/json"
	"math/rand"
	"strconv"

	"github.com/extism/go-pdk"
)

type Arguments struct {
	NumFaces int `json:"numFaces"`
	NumDice  int `json:"numDice"`
}

//export rollDice
func rollDice() {
	// Get input arguments as a JSON string
	arguments := pdk.InputString()

	// Parse the arguments
	var args Arguments
	json.Unmarshal([]byte(arguments), &args)
	numFaces := args.NumFaces 
	numDice := args.NumDice

	// Roll the dice
	sum := 0
	for i := 0; i < numDice; i++ {
		dieValue := rand.Intn(numFaces) + 1
		sum += dieValue
	}
	
	// Return the result
	pdk.OutputString(strconv.Itoa(sum))
}

func main() {
	// Required for WebAssembly modules but not used
}
```

### Compiling with TinyGo

To compile a Go plugin, use TinyGo with the WASI target:

```bash
tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-roll-dice.wasm \
  -target wasi main.go
```

## JSON Communication Protocol

Plugins in WASImancer communicate using a JSON-based protocol:

1. **Input**: Function arguments are passed as JSON strings
2. **Output**: Function results are returned as text (often JSON or simple values)

For example, when calling the `rollDice` function:
- Input: `{"numFaces": 6, "numDice": 2}`
- Output: `"8"` (the sum of the dice roll)

## Plugin Lifecycle Management

WASImancer provides several REST API endpoints to manage plugins at runtime:

### Upload a New Plugin

```
POST /upload-plugin
Headers: Authorization: Bearer <token>
Body: multipart/form-data with wasmFile and pluginData
```

### Replace an Existing Plugin

```
PUT /update-plugin
Headers: Authorization: Bearer <token>
Body: multipart/form-data with wasmFile and pluginData
```

### Remove a Plugin

```
DELETE /remove-plugin/<name>
Headers: Authorization: Bearer <token>
```

These APIs enable hot-reloading of plugins without restarting the server.

## Best Practices for Plugin Development

1. **Keep plugins focused**: Each plugin should have a specific purpose
2. **Handle errors gracefully**: Return meaningful error messages when things go wrong
3. **Validate inputs**: Check input parameters for validity before processing
4. **Use appropriate types**: Match function parameter types with their expected usage
5. **Document thoroughly**: Provide clear descriptions for your plugin and its functions
6. **Test independently**: Use the Extism CLI to test plugins before deploying to WASImancer

## Security Considerations

WebAssembly plugins run in a sandboxed environment, but you should still follow these security guidelines:

1. **Limit permissions**: Only grant the permissions a plugin needs (e.g., network access, file system access)
2. **Validate inputs**: Always validate and sanitize inputs to prevent injection attacks
3. **Protect sensitive data**: Be careful about handling sensitive information within plugins
4. **Update dependencies**: Keep your plugin dependencies up to date to address security vulnerabilities

## Debugging Plugins

When developing plugins, you can use:

1. **Extism CLI**: Test your plugin locally before deploying
   ```bash
   extism call wasimancer-plugin-roll-dice.wasm rollDice \
     --input '{"numFaces":6,"numDice":2}' \
     --log-level "info" \
     --wasi
   ```

2. **Inspector Tool**: Test your plugins once deployed to WASImancer
   ```bash
   npx @modelcontextprotocol/inspector
   ```

By embracing WebAssembly plugins, WASImancer provides a powerful, flexible, and secure way to extend MCP servers with custom functionality in any programming language.
