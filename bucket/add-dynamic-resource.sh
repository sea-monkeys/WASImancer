#!/bin/bash
TOKEN="wasimancer-rocks"

ADD_ENDPOINT="http://localhost:3001/add-resource"

read -r -d '' DATA <<- EOM
{
  "name": "welcome-message",
  "uri": "message://{username}/{language}",
  "arguments": [
    {
      "name": "username",
      "type": "string"
    },
    {
      "name": "language",
      "type": "string"
    }
  ],
  "contents": [
    {
      "text": "Welcome \${username}! You selected \${language} as your preferred language."
    }
  ]
}
EOM

curl -X POST ${ADD_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${DATA}"