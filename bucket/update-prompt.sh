#!/bin/bash
TOKEN="wasimancer-rocks"  # Use your configured token
PROMPT_NAME="character-greeting"

UPDATE_ENDPOINT="http://localhost:3001/update-prompt/${PROMPT_NAME}"

read -r -d '' DATA <<- EOM
{
  "name": "character-greeting",
  "arguments": [
    {
      "name": "character",
      "type": "string"
    },
    {
      "name": "emotion",
      "type": "string"
    },
    {
      "name": "setting",
      "type": "string"
    }
  ],
  "messages": [
    {
      "text": "Greet the user as \${character} feeling \${emotion} in a \${setting} setting",
      "role": "user"
    }
  ]
}
EOM

curl -X PUT ${UPDATE_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${DATA}"