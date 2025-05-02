# Creating Go Plugins for WASImancer: A Step-by-Step Guide
!!! info "🚧 work in progress"

This guide will walk you through the process of creating, building, and running a WebAssembly plugin for WASImancer using Go. We'll create a simple plugin that generates random character names.

## Prerequisites

To follow this guide, you'll need:

- [Go](https://golang.org/dl/) (1.18 or newer) installed
- [TinyGo](https://tinygo.org/getting-started/install/) installed (required for WebAssembly compilation)
- [Extism CLI](https://github.com/extism/cli) installed (for testing)

Alternatively, you can use the Docker image provided by WASImancer:
```bash
docker pull k33g/wasm-builder:0.0.7
```

## Project Setup

Let's create a new plugin project:

```bash
mkdir -p character-name-generator
cd character-name-generator
```

## Creating the Go Module

Initialize a new Go module:

```bash
go mod init character-name-generator
```

Add the Extism PDK (Plugin Development Kit) as a dependency:

```bash
go get github.com/extism/go-pdk
```

## Writing the Plugin Code

Create a file named `main.go` with the following content:

```go
package main

import (
	"math/rand"
	"time"

	"github.com/extism/go-pdk"
)

// Word lists for generating character names
var (
	adjectives = []string{
		"admirable", "brave", "charming", "determined", "elegant", "fantastic", "graceful",
		"heroic", "inspiring", "jolly", "kind", "loyal", "majestic", "noble",
		"optimistic", "peaceful", "quirky", "resilient", "serene", "tenacious", "unique",
		"valiant", "wonderful", "xenial", "zealous", "agile", "brilliant", "curious",
		"daring", "energetic", "fierce", "generous", "honest", "imaginative", "jovial",
	}

	nouns = []string{
		"eagle", "whale", "hummingbird", "dolphin", "elephant", "falcon", "gorilla",
		"owl", "iguana", "jaguar", "koala", "leopard", "medusa", "narwhal",
		"orca", "panther", "quokka", "raccoon", "salamander", "tiger", "unicorn",
		"vulture", "wombat", "xerus", "yak", "zebra", "albatross", "bison", "chameleon",
		"dragon", "squirrel", "flamingo", "gazelle", "hippocampus", "ibis",
	}
)

//export GenerateCharacterName
func GenerateCharacterName() {
	// Initialize random number generator with a time-based seed
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	
	// Select a random adjective and noun
	adj := adjectives[r.Intn(len(adjectives))]
	noun := nouns[r.Intn(len(nouns))]
	
	// Combine with a hyphen, GitHub-style
	output := adj + "-" + noun
	
	// Return the value to the host
	mem := pdk.AllocateString(output)
	pdk.OutputMemory(mem)
}

func main() {
	// Empty main function required for compilation
}
```

### Understanding the Code

1. We import the `github.com/extism/go-pdk` package, which provides the interface between our Go code and the WebAssembly host environment.

2. We define two slices of strings: `adjectives` and `nouns`, which will be used to generate random character names.

3. We define a function `GenerateCharacterName` with the `//export` comment, which marks this function as exportable from the WebAssembly module.

4. Inside the function, we:
   - Initialize a random number generator
   - Select a random adjective and noun
   - Combine them with a hyphen to create a character name
   - Allocate memory for the string and output it to the host

5. The `main()` function is empty but required for compilation.

## Building the Plugin

### Using Local TinyGo

To compile your Go code to WebAssembly, run:

```bash
tinygo build -scheduler=none --no-debug \
  -o character-name-generator.wasm \
  -target wasi main.go
```

### Using Docker

If you're using the WASImancer's Docker image:

```bash
docker run --rm -v "$PWD":/character-name-generator -w /character-name-generator k33g/wasm-builder:0.0.7 \
  tinygo build -scheduler=none --no-debug \
    -o character-name-generator.wasm \
    -target wasi main.go
```

This will create a file called `character-name-generator.wasm` in your project directory.

## Testing the Plugin Locally

You can test your plugin using the Extism CLI before deploying it to WASImancer:

### Using Local Extism CLI

```bash
extism call character-name-generator.wasm GenerateCharacterName --wasi
```

### Using Docker

```bash
docker run --rm -v "$PWD":/character-name-generator -w /character-name-generator k33g/wasm-builder:0.0.7 \
  extism call character-name-generator.wasm GenerateCharacterName --wasi
```

You should see a randomly generated character name as output, like `brave-dolphin` or `tenacious-dragon`.

## Creating the Plugin Configuration

To use your plugin with WASImancer, you need to create a configuration in the `plugins.yml` file. Add the following entry:

```yaml
plugins:
  - name: character-name-generator
    path: ./bucket/character-name-generator.wasm
    version: 1.0.0
    description: a character name generator
    functions:
      - displayName: GenerateCharacterName
        function: GenerateCharacterName
        arguments: []
        description: a function to generate a character name
```

## Deploying the Plugin to WASImancer

### Method 1: Manual Deployment

1. Copy your WebAssembly file to the WASImancer plugins directory:
   ```bash
   cp character-name-generator.wasm /path/to/wasimancer/plugins/bucket/
   ```

2. Restart WASImancer or use the hot-reload API (next method).

### Method 2: Using the Upload API

You can use the WASImancer API to upload your plugin without restarting the server:

1. Create a shell script named `publish.sh` with the following content:

```bash
#!/bin/bash
TOKEN="wasimancer-rocks"  # Use your configured token

UPLOAD_ENDPOINT="http://localhost:3001/upload-plugin"
WASM_FILE="./character-name-generator.wasm"

read -r -d '' DATA <<- EOM
{
  "name": "character-name-generator",
  "path": "./bucket/character-name-generator.wasm",
  "version": "1.0.0",
  "description": "a character name generator",
  "functions": [
    {
      "displayName": "GenerateCharacterName",
      "function": "GenerateCharacterName",
      "arguments": [],
      "description": "a function to generate a character name"
    }
  ]
}
EOM

curl -X POST ${UPLOAD_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "wasmFile=@${WASM_FILE}" \
  -F "pluginData=${DATA}"
```

2. Make the script executable and run it:
   ```bash
   chmod +x publish.sh
   ./publish.sh
   ```

## Testing the Plugin in WASImancer

You can test your deployed plugin using the MCP Inspector:

1. Start the Inspector:
   ```bash
   npx @modelcontextprotocol/inspector
   ```

2. Connect to your WASImancer instance (typically at `http://localhost:3001/sse`).

3. Navigate to the "Tools" tab, find your plugin, and click "Run Tool".

<!--
## Creating a Plugin with Arguments

Let's modify our plugin to accept arguments. Create a new file called `main_with_args.go`:

```go
package main

import (
	"encoding/json"
	"math/rand"
	"strings"
	"time"

	"github.com/extism/go-pdk"
)

// Word lists (same as before)
var (
	adjectives = []string{
		"admirable", "brave", "charming", "determined", "elegant", "fantastic", "graceful",
		"heroic", "inspiring", "jolly", "kind", "loyal", "majestic", "noble",
		"optimistic", "peaceful", "quirky", "resilient", "serene", "tenacious", "unique",
		"valiant", "wonderful", "xenial", "zealous", "agile", "brilliant", "curious",
		"daring", "energetic", "fierce", "generous", "honest", "imaginative", "jovial",
	}

	nouns = []string{
		"eagle", "whale", "hummingbird", "dolphin", "elephant", "falcon", "gorilla",
		"owl", "iguana", "jaguar", "koala", "leopard", "medusa", "narwhal",
		"orca", "panther", "quokka", "raccoon", "salamander", "tiger", "unicorn",
		"vulture", "wombat", "xerus", "yak", "zebra", "albatross", "bison", "chameleon",
		"dragon", "squirrel", "flamingo", "gazelle", "hippocampus", "ibis",
	}
)

// Arguments structure for the function
type Arguments struct {
	Prefix string `json:"prefix"`
	Count  int    `json:"count"`
}

//export GenerateCharacterNames
func GenerateCharacterNames() {
	// Get input arguments
	arguments := pdk.InputString()

	var args Arguments
	if err := json.Unmarshal([]byte(arguments), &args); err != nil {
		pdk.OutputString("Error parsing arguments: " + err.Error())
		return
	}

	// Use default values if not provided
	if args.Count <= 0 {
		args.Count = 1
	}

	// Initialize random number generator
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	
	// Generate the requested number of names
	names := make([]string, args.Count)
	for i := 0; i < args.Count; i++ {
		adj := adjectives[r.Intn(len(adjectives))]
		noun := nouns[r.Intn(len(nouns))]
		
		if args.Prefix != "" {
			names[i] = args.Prefix + "-" + adj + "-" + noun
		} else {
			names[i] = adj + "-" + noun
		}
	}
	
	// Return the result as JSON
	result, _ := json.Marshal(names)
	pdk.OutputString(string(result))
}

func main() {
	// Empty main function required for compilation
}
```

Build this modified plugin:

```bash
tinygo build -scheduler=none --no-debug \
  -o character-name-generator-with-args.wasm \
  -target wasi main_with_args.go
```

Test it with arguments:

```bash
extism call character-name-generator-with-args.wasm GenerateCharacterNames \
  --input '{"prefix":"hero","count":3}' \
  --wasi
```

And update your plugin configuration accordingly:

```yaml
plugins:
  - name: character-name-generator-advanced
    path: ./bucket/character-name-generator-with-args.wasm
    version: 1.0.0
    description: an advanced character name generator
    functions:
      - displayName: GenerateCharacterNames
        function: GenerateCharacterNames
        arguments:
          - name: prefix
            type: string
            description: optional prefix for the name
          - name: count
            type: number
            description: number of names to generate
        description: a function to generate multiple character names
```
-->

## Debugging Tips

1. **Use Simple Data Types**: Start with simple data types like strings and integers.

2. **Print to Console**: The PDK provides functions for debug logging:
   ```go
   pdk.Log(pdk.LogDebug, "Debug message")
   pdk.Log(pdk.LogInfo, "Info message")
   pdk.Log(pdk.LogError, "Error message")
   ```

3. **Test Incrementally**: Build and test your plugin after each small change.

4. **Check Return Values**: Always validate the data returned by your functions.

## Best Practices

1. **Error Handling**: Always handle errors and provide meaningful error messages.

2. **Input Validation**: Validate all input arguments before processing.

3. **Memory Management**: The PDK handles memory allocation, but be conscious of large data structures.

4. **Statelessness**: Design your plugins to be stateless whenever possible.

5. **Documentation**: Comment your code and provide clear descriptions in your plugin configuration.

## Conclusion

You've now learned how to create, build, test, and deploy a Go plugin for WASImancer. By leveraging Go's performance and the WebAssembly sandbox, you can create powerful, secure tools that enhance your AI applications through the Model Context Protocol.
