# WASImancer MCP StreamableHTTP Server Testing Guide (with curl)

!!! info
    This document explains how to test the WASImancer MCP (Model Control Protocol) StreamableHTTP Server using the provided shell scripts.

## Prerequisites

- A running WASImancer MCP StreamableHTTP Server (default: http://localhost:3001)
- Authentication token (default: mcp-is-the-way)
- curl and jq installed on your system

## Configuration

All scripts use the following common configuration:

```bash
MCP_SERVER=http://localhost:3001
AUTHENTICATION_TOKEN=mcp-is-the-way
```
> Look at the `./tests` folder for the scripts.

## Available Testing Scripts

### Listing Available Resources

1. **List Available Tools**

```bash
MCP_SERVER=http://localhost:3001
AUTHENTICATION_TOKEN=mcp-is-the-way

read -r -d '' DATA <<- EOM
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "tools/list",
  "params": {}
}
EOM

curl ${MCP_SERVER}/mcp \
  -H "Authorization: Bearer ${AUTHENTICATION_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "${DATA}" \
  | grep "^data:" | sed 's/^data: //' | jq '.'
```

Lists all available tools that can be called through the MCP server.

2. **List Resource Templates**

```bash
MCP_SERVER=http://localhost:3001
AUTHENTICATION_TOKEN=mcp-is-the-way

read -r -d '' DATA <<- EOM
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "resources/templates/list",
  "params": {}
}
EOM

curl ${MCP_SERVER}/mcp \
  -H "Authorization: Bearer ${AUTHENTICATION_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "${DATA}" \
  | grep "^data:" | sed 's/^data: //' | jq '.'
```

Lists all available resource templates that can be used.

3. **List Resources**

```bash
MCP_SERVER=http://localhost:3001
AUTHENTICATION_TOKEN=mcp-is-the-way


read -r -d '' DATA <<- EOM
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "resources/list",
  "params": {}
}
EOM

curl ${MCP_SERVER}/mcp \
  -H "Authorization: Bearer ${AUTHENTICATION_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "${DATA}" \
  | grep "^data:" | sed 's/^data: //' | jq '.'
```

Lists all available resources that can be accessed.

4. **List Prompts**

```bash
MCP_SERVER=http://localhost:3001
AUTHENTICATION_TOKEN=mcp-is-the-way

read -r -d '' DATA <<- EOM
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "prompts/list",
  "params": {}
}
EOM

curl ${MCP_SERVER}/mcp \
  -H "Authorization: Bearer ${AUTHENTICATION_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "${DATA}" \
  | grep "^data:" | sed 's/^data: //' | jq '.'
```

Lists all available prompts that can be used.

### Using Tools

1. **Roll Dice Tool**

```bash
MCP_SERVER=http://localhost:3001
AUTHENTICATION_TOKEN=mcp-is-the-way

read -r -d '' DATA <<- EOM
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "tools/call",
  "params": {
    "name": "rollDice",
    "arguments": {
      "numDice": 3,
      "numFaces": 6
    }
  }
}
EOM

curl ${MCP_SERVER}/mcp \
  -H "Authorization: Bearer ${AUTHENTICATION_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "${DATA}" \
  | grep "^data:" | sed 's/^data: //' | jq '.'
```

Calls the `rollDice` tool with parameters to roll 3 dice with 6 faces each.

2. **Addition Tool**

```bash
MCP_SERVER=http://localhost:3001
AUTHENTICATION_TOKEN=mcp-is-the-way

read -r -d '' DATA <<- EOM
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "tools/call",
  "params": {
    "name": "add with rust",
    "arguments": {
      "left": 23,
      "right": 19
    }
  }
}
EOM

curl ${MCP_SERVER}/mcp \
  -H "Authorization: Bearer ${AUTHENTICATION_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "${DATA}" \
  | grep "^data:" | sed 's/^data: //' | jq '.'
```

Calls the `add with rust` tool to add two numbers (23 + 19).

### Accessing Resources

1. **Access Resource Template**

```bash
MCP_SERVER=http://localhost:3001
AUTHENTICATION_TOKEN=mcp-is-the-way

read -r -d '' DATA <<- EOM
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "resources/read",
  "params": {
    "uri": "greet-user://Bob/Morane"
  }
}
EOM

curl ${MCP_SERVER}/mcp \
  -H "Authorization: Bearer ${AUTHENTICATION_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "${DATA}" \
  | grep "^data:" | sed 's/^data: //' | jq '.'
```

Reads a resource using a template URI: `greet-user://Bob/Morane`

2. **Access Resource**

```bash
MCP_SERVER=http://localhost:3001
AUTHENTICATION_TOKEN=mcp-is-the-way

read -r -d '' DATA <<- EOM
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "resources/read",
  "params": {
    "uri": "config://server"
  }
}
EOM

curl ${MCP_SERVER}/mcp \
  -H "Authorization: Bearer ${AUTHENTICATION_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "${DATA}" \
  | grep "^data:" | sed 's/^data: //' | jq '.'
```

Reads a resource directly using the URI: `config://server`

### Using Prompts

1. **Use Prompt**

```bash
MCP_SERVER=http://localhost:3001
AUTHENTICATION_TOKEN=mcp-is-the-way

read -r -d '' DATA <<- EOM
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "prompts/get",
  "params": {
    "name": "greet-user",
    "arguments": {
      "nickName": "Bob Morane"
    }  
  }
}
EOM

curl ${MCP_SERVER}/mcp \
  -H "Authorization: Bearer ${AUTHENTICATION_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "${DATA}" \
  | grep "^data:" | sed 's/^data: //' | jq '.'
```

Gets a prompt named "greet-user" with an argument for the nickname.

## JSON-RPC Structure

All requests follow the JSON-RPC 2.0 specification with:

- `jsonrpc`: Always "2.0"
- `id`: Request identifier
- `method`: The API method to call
- `params`: Method-specific parameters

## Response Processing

All scripts process the server response with:

```bash
curl ${MCP_SERVER}/mcp \
  -H "Authorization: Bearer ${AUTHENTICATION_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "${DATA}" \
  | grep "^data:" | sed 's/^data: //' | jq '.'
```

This:
1. Sends a POST request to the server
2. Sets appropriate headers including authentication
3. Filters response stream data with `grep "^data:"`
4. Removes the `data:` prefix with `sed`
5. Pretty-prints the JSON with `jq`

## Creating Your Own Tests

To create a new test script:

1. Copy an existing script as a template
2. Modify the `method` and `params` in the JSON data
3. Make the script executable with `chmod +x your-script.sh`
4. Run with `./your-script.sh`

## Common Methods

- `tools/list`: List available tools
- `tools/call`: Call a tool with arguments
- `resources/templates/list`: List resource templates
- `resources/list`: List available resources
- `resources/read`: Read a resource with a specific URI
- `prompts/list`: List available prompts
- `prompts/get`: Get a specific prompt with arguments

## Troubleshooting

- Check that the server is running at the specified address
- Verify that the authentication token is correct
- Ensure the `curl` and `jq` commands are available in your environment
- Examine the full response for error messages if parsing fails
