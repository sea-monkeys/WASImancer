#!/bin/bash
TOKEN="wasimancer-rocks"
#TOKEN="i-love-parakeets"

UPLOAD_ENDPOINT="http://localhost:3001/upload-plugin"

WASM_FILE="./character-name-generator.wasm"

: <<'COMMENT'
export PLUGINS_PATH=./plugins
export UPLOAD_PATH=./plugins/bucket
node index.js
COMMENT


read -r -d '' DATA <<- EOM
{
  "name": "character-name-generator",
  "path": "./bucket/character-name-generator.wasm",
  "version": "1.0.0",
  "description": "a character name generator",
  "functions": [
    {
      "displayName": "GenerateCharacterName",
      "function": "GenerateCharacterName",
      "arguments": [],
      "description": "a function to generate a character name"
    }
  ]
}
EOM


curl -X POST ${UPLOAD_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "wasmFile=@${WASM_FILE}" \
  -F "pluginData=${DATA}"


# It's possible to override the upload path by specifying the dir parameter
#curl -X POST ${UPLOAD_ENDPOINT} \
#  -H "Authorization: Bearer ${TOKEN}" \
#  -F "wasmFile=@${WASM_FILE}" \
#  -F "dir=./plugins" \ 
#  -F "pluginData=${DATA}"