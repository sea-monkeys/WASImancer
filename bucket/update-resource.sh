#!/bin/bash

TOKEN="wasimancer-rocks"
RESOURCE_NAME="server-details"

UPDATE_ENDPOINT="http://localhost:3001/update-resource/${RESOURCE_NAME}"

read -r -d '' DATA <<- EOM
{
  "name": "server-details",
  "uri": "config://server-details",
  "contents": [
    {
      "text": "Updated server configuration details",
      "version": "1.1.0",
      "environment": "production",
      "updatedAt": "2025-03-12"
    }
  ]
}
EOM

curl -X PUT ${UPDATE_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${DATA}"