# WASImancer Plugin Management API Guide
!!! info "🚧 work in progress"

This guide explains how to use WASImancer's REST API to dynamically publish, update, and remove WebAssembly plugins without restarting the server.

## Overview

WASImancer provides a REST API that enables:

- **Publishing new plugins** - Upload WebAssembly modules and register them as tools
- **Updating existing plugins** - Replace a plugin's implementation while preserving its interface
- **Removing plugins** - Unregister and delete plugins that are no longer needed

These operations allow you to manage your MCP server's capabilities at runtime without service interruption.

## Administration authentication

All Administration API endpoints require authentication using a Bearer token. This token is configured when starting the WASImancer server using the `WASIMANCER_ADMIN_TOKEN` environment variable:

```yaml
environment:
  - WASIMANCER_ADMIN_TOKEN=wasimancer-rocks
```

In all API requests, include this header:

```
Authorization: Bearer wasimancer-rocks
```

## API Endpoints

### 1. Upload a New Plugin

Upload a new WebAssembly plugin and register it with the server.

**Endpoint**: `POST /upload-plugin`

**Headers**:
- `Authorization: Bearer <token>` - Authentication token
- `Content-Type: multipart/form-data` - Required for file upload

**Request Body**:
- `wasmFile` - The WebAssembly module file (.wasm)
- `pluginData` - JSON string containing metadata about the plugin

**Plugin Data Format**:
```json
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
```

**Optional Parameters**:
- `dir` - Query parameter to specify a custom target directory

**Success Response**:
- Status Code: 200
- Body:
  ```json
  {
    "message": "🎉 File uploaded successfully",
    "filePath": "./bucket/character-name-generator.wasm",
    "metadata": { ... } // The plugin data you provided
  }
  ```

**Error Responses**:
- Status Code: 400 - Missing or invalid file/data
- Status Code: 403 - Invalid authentication token
- Status Code: 500 - Server error

**cURL Example**:

```bash
#!/bin/bash
TOKEN="wasimancer-rocks"

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

### 2. Update an Existing Plugin

Replace an existing plugin with a new implementation while preserving its registration.

**Endpoint**: `PUT /update-plugin`

**Headers**:
- `Authorization: Bearer <token>` - Authentication token
- `Content-Type: multipart/form-data` - Required for file upload

**Request Body**:
- `wasmFile` - The new WebAssembly module file (.wasm)
- `pluginData` - JSON string containing metadata about the plugin (must include the same name as the plugin being updated)

**Plugin Data Format**: Same as for uploading a new plugin

**Optional Parameters**:
- `dir` - Query parameter to specify a custom target directory

**Success Response**:
- Status Code: 200
- Body:
  ```json
  {
    "message": "🎉 File uploaded successfully",
    "filePath": "./bucket/character-name-generator.wasm",
    "metadata": { ... } // The plugin data you provided
  }
  ```

**Error Responses**:
- Status Code: 400 - Missing or invalid file/data
- Status Code: 403 - Invalid authentication token
- Status Code: 500 - Server error

**cURL Example**:

```bash
#!/bin/bash
TOKEN="wasimancer-rocks"

UPDATE_ENDPOINT="http://localhost:3001/update-plugin"
WASM_FILE="./character-name-generator.wasm"

read -r -d '' DATA <<- EOM
{
  "name": "character-name-generator",
  "path": "./bucket/character-name-generator.wasm",
  "version": "1.0.1",
  "description": "an updated character name generator",
  "functions": [
    {
      "displayName": "GenerateCharacterName",
      "function": "GenerateCharacterName",
      "arguments": [],
      "description": "a function to generate an improved character name"
    }
  ]
}
EOM

curl -X PUT ${UPDATE_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "wasmFile=@${WASM_FILE}" \
  -F "pluginData=${DATA}"
```

### 3. Remove a Plugin

Unregister and delete a plugin from the server.

**Endpoint**: `DELETE /remove-plugin/:name`

**URL Parameters**:
- `:name` - The name of the plugin to remove

**Headers**:
- `Authorization: Bearer <token>` - Authentication token

**Success Response**:
- Status Code: 200
- Body:
  ```json
  {
    "message": "🙂 Plugin removed successfully"
  }
  ```

**Error Responses**:
- Status Code: 400 - Missing plugin name
- Status Code: 403 - Invalid authentication token
- Status Code: 500 - Server error or plugin not found

**cURL Example**:

```bash
#!/bin/bash
TOKEN="wasimancer-rocks"

REMOVE_ENDPOINT="http://localhost:3001/remove-plugin"
PLUGIN_NAME="character-name-generator"

curl -X DELETE ${REMOVE_ENDPOINT}/${PLUGIN_NAME} \
  -H "Authorization: Bearer ${TOKEN}"
```

## Practical Examples

### Example 1: Creating and Publishing a New Plugin

This example shows how to create a simple Go plugin, compile it, and publish it to WASImancer:

```bash
#!/bin/bash
# Step 1: Create a directory for your plugin
mkdir -p roll-dice
cd roll-dice

# Step 2: Create go.mod file
cat > go.mod << 'EOF'
module wasimancer-plugin-roll-dice
go 1.23.0
require github.com/extism/go-pdk v1.1.1
EOF

# Step 3: Create main.go file
cat > main.go << 'EOF'
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
	arguments := pdk.InputString()
	var args Arguments
	json.Unmarshal([]byte(arguments), &args)
	numFaces := args.NumFaces 
	numDice := args.NumDice
	
	sum := 0
	for i := 0; i < numDice; i++ {
		dieValue := rand.Intn(numFaces) + 1
		sum += dieValue
	}
	
	pdk.OutputString(strconv.Itoa(sum))
}

func main() {}
EOF

# Step 4: Compile the plugin
docker run --rm -v "$PWD":/roll-dice -w /roll-dice k33g/wasm-builder:0.0.5 \
  tinygo build -scheduler=none --no-debug \
    -o wasimancer-plugin-roll-dice.wasm \
    -target wasi main.go

# Step 5: Create publish script
cat > publish.sh << 'EOF'
#!/bin/bash
TOKEN="wasimancer-rocks"
UPLOAD_ENDPOINT="http://localhost:3001/upload-plugin"
WASM_FILE="./wasimancer-plugin-roll-dice.wasm"

read -r -d '' DATA <<- EOM
{
  "name": "roll-dice",
  "path": "./bucket/wasimancer-plugin-roll-dice.wasm",
  "version": "1.0.0",
  "description": "roll dice",
  "functions": [
    {
      "displayName": "rollDice",
      "function": "rollDice",
      "arguments": [
        {
          "name": "numFaces",
          "type": "number",
          "description": "number of faces on the dice"
        },
        {
          "name": "numDice",
          "type": "number",
          "description": "number of dice to roll"
        }
      ],
      "description": "a function to roll dice"
    }
  ]
}
EOM

curl -X POST ${UPLOAD_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "wasmFile=@${WASM_FILE}" \
  -F "pluginData=${DATA}"
EOF

# Step 6: Make the script executable and run it
chmod +x publish.sh
./publish.sh
```

### Example 2: Updating an Existing Plugin

This example shows how to update the roll dice plugin with improved functionality:

```bash
#!/bin/bash
# Step 1: Update the main.go file
cat > main.go << 'EOF'
package main

import (
	"encoding/json"
	"math/rand"
	"time"
	"github.com/extism/go-pdk"
)

type Arguments struct {
	NumFaces int `json:"numFaces"`
	NumDice  int `json:"numDice"`
}

type Result struct {
	Total  int   `json:"total"`
	Values []int `json:"values"`
}

//export rollDice
func rollDice() {
	// Initialize random with time seed
	rand.Seed(time.Now().UnixNano())
	
	// Get input arguments
	arguments := pdk.InputString()
	var args Arguments
	json.Unmarshal([]byte(arguments), &args)
	
	// Roll dice and track individual values
	values := make([]int, args.NumDice)
	total := 0
	
	for i := 0; i < args.NumDice; i++ {
		values[i] = rand.Intn(args.NumFaces) + 1
		total += values[i]
	}
	
	// Create and return result
	result := Result{
		Total:  total,
		Values: values,
	}
	
	jsonResult, _ := json.Marshal(result)
	pdk.OutputString(string(jsonResult))
}

func main() {}
EOF

# Step 2: Recompile the plugin
docker run --rm -v "$PWD":/roll-dice -w /roll-dice k33g/wasm-builder:0.0.5 \
  tinygo build -scheduler=none --no-debug \
    -o wasimancer-plugin-roll-dice.wasm \
    -target wasi main.go

# Step 3: Create update script
cat > update.sh << 'EOF'
#!/bin/bash
TOKEN="wasimancer-rocks"
UPDATE_ENDPOINT="http://localhost:3001/update-plugin"
WASM_FILE="./wasimancer-plugin-roll-dice.wasm"

read -r -d '' DATA <<- EOM
{
  "name": "roll-dice",
  "path": "./bucket/wasimancer-plugin-roll-dice.wasm",
  "version": "1.1.0",
  "description": "enhanced dice rolling with detailed results",
  "functions": [
    {
      "displayName": "rollDice",
      "function": "rollDice",
      "arguments": [
        {
          "name": "numFaces",
          "type": "number",
          "description": "number of faces on the dice"
        },
        {
          "name": "numDice",
          "type": "number",
          "description": "number of dice to roll"
        }
      ],
      "description": "a function to roll dice and get detailed results"
    }
  ]
}
EOM

curl -X PUT ${UPDATE_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "wasmFile=@${WASM_FILE}" \
  -F "pluginData=${DATA}"
EOF

# Step 4: Make the script executable and run it
chmod +x update.sh
./update.sh
```

### Example 3: Removing a Plugin

This example shows how to remove the roll dice plugin:

```bash
#!/bin/bash
TOKEN="wasimancer-rocks"
REMOVE_ENDPOINT="http://localhost:3001/remove-plugin"
PLUGIN_NAME="roll-dice"

curl -X DELETE ${REMOVE_ENDPOINT}/${PLUGIN_NAME} \
  -H "Authorization: Bearer ${TOKEN}"
```

## Best Practices

### Versioning

Always increment your plugin version when updating:

```json
{
  "name": "example-plugin",
  "version": "1.0.1",  // Increment this with each update
  "path": "./bucket/example-plugin.wasm",
  "description": "An example plugin"
}
```

### Plugin Naming

Use consistent naming conventions:
- Plugin names should be kebab-case (e.g., `character-name-generator`)
- Function display names should be descriptive but concise

### Validation

Always validate plugin functionality before deployment:
1. Test the WebAssembly module locally using the Extism CLI
2. Verify input and output formats match your expectations
3. Check for proper error handling

### Authorization

Keep your authorization token secure:
- Use a strong, unique token for each environment
- Store tokens in secure environment variables
- Rotate tokens periodically

### Error Handling

Check for and handle API errors in your deployment scripts:

```bash
response=$(curl -s -w "\n%{http_code}" -X POST ${UPLOAD_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "wasmFile=@${WASM_FILE}" \
  -F "pluginData=${DATA}")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$http_code" -ne 200 ]; then
  echo "Error: $response_body"
  exit 1
fi

echo "Success: $response_body"
```

## Troubleshooting

### Common Issues

1. **Invalid Token Error (403)**: Verify that your `WASIMANCER_ADMIN_TOKEN` environment variable matches the token in your request.

2. **Plugin Not Found (500)**: When updating or removing, check that the plugin name in your request matches exactly with the registered plugin.

3. **File Upload Failed (500)**: Ensure that the WebAssembly file exists and is accessible.

4. **Failed to Load Plugin (500)**: Verify that your WebAssembly module is correctly compiled and exports the functions referenced in your plugin data.

### Debugging

1. **Check Server Logs**: WASImancer logs detailed information about plugin operations.

2. **Inspect Plugin Registry**: Use the MCP Inspector to list all registered tools and verify your changes.

3. **Test Plugin Independently**: Use the Extism CLI to test your WebAssembly module before uploading.

## Automation and CI/CD Integration

You can integrate plugin management into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: Deploy Plugin

on:
  push:
    branches: [ main ]
    paths:
      - 'plugins/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Plugin
        run: |
          cd plugins/my-plugin
          tinygo build -scheduler=none --no-debug -o my-plugin.wasm -target wasi main.go
      
      - name: Deploy Plugin
        run: |
          cd plugins/my-plugin
          ./publish.sh
        env:
          WASIMANCER_TOKEN: ${{ secrets.WASIMANCER_TOKEN }}
          WASIMANCER_URL: ${{ secrets.WASIMANCER_URL }}
```

## Conclusion

WASImancer's Plugin Management API provides a flexible way to dynamically extend your MCP server's capabilities without service interruption. By leveraging this API, you can implement continuous deployment of new tools and features to enhance your AI applications.

The combination of WebAssembly's portability and security with WASImancer's dynamic loading capabilities creates a powerful platform for developing and deploying AI tools in production environments.
