#!/bin/bash
: <<'COMMENT'
# Use prompt

COMMENT



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

