#!/bin/bash
: <<'COMMENT'
# Use resource template
COMMENT

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
