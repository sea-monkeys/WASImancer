#!/bin/bash
TOKEN="wasimancer-rocks"
RESOURCE_NAME="welcome-message"

REMOVE_ENDPOINT="http://localhost:3001/remove-resource/${RESOURCE_NAME}"

curl -X DELETE ${REMOVE_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}"
