#!/bin/bash
TOKEN="wasimancer-rocks"
#TOKEN="i-love-parakeets"

UPDATE_ENDPOINT="http://localhost:3001/update-plugin"

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
  "version": "1.0.1",
  "description": "an heroic fantasy character name generator",
  "functions": [
    {
      "displayName": "GenerateCharacterName",
      "function": "GenerateCharacterName",
      "arguments": [],
      "description": "a function to generate an heroic fantasy character name"
    }
  ]
}
EOM


curl -X PUT ${UPDATE_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "wasmFile=@${WASM_FILE}" \
  -F "pluginData=${DATA}"


# It's possible to override the upload path by specifying the dir parameter
#curl -X PUT ${UPDATE_ENDPOINT} \
#  -H "Authorization: Bearer ${TOKEN}" \
#  -F "wasmFile=@${WASM_FILE}" \
#  -F "dir=./plugins" \ 
#  -F "pluginData=${DATA}"