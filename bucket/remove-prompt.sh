#!/bin/bash
TOKEN="wasimancer-rocks"  # Use your configured token
PROMPT_NAME="character-greeting"

REMOVE_ENDPOINT="http://localhost:3001/remove-prompt/${PROMPT_NAME}"

curl -X DELETE ${REMOVE_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}"