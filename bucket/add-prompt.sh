#!/bin/bash
TOKEN="wasimancer-rocks" 

ADD_ENDPOINT="http://localhost:3001/add-prompt"

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
    }
  ],
  "messages": [
    {
      "text": "Greet the user as \${character} feeling \${emotion}",
      "role": "user"
    }
  ]
}
EOM

curl -X POST ${ADD_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${DATA}"