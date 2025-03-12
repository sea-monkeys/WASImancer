#!/bin/bash
TOKEN="wasimancer-rocks"

ADD_ENDPOINT="http://localhost:3001/add-resource"

read -r -d '' DATA <<- EOM
{
  "name": "server-details",
  "uri": "config://server-details",
  "contents": [
    {
      "text": "Server configuration details",
      "version": "1.0.0",
      "environment": "production"
    }
  ]
}
EOM

curl -X POST ${ADD_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${DATA}"
