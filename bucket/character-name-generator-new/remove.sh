#!/bin/bash
TOKEN="wasimancer-rocks"
#TOKEN="i-love-parakeets"

REMOVE_ENDPOINT="http://localhost:3001/remove-plugin"
PLUGIN_NAME="character-name-generator"


curl -X DELETE ${REMOVE_ENDPOINT}/${PLUGIN_NAME} \
  -H "Authorization: Bearer ${TOKEN}"
