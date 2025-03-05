#!/bin/bash
TOKEN="wasimancer-rocks"
#TOKEN="i-love-parakeets"

UPLOAD_ENDPOINT="http://localhost:3001/upload-plugin"

WASM_FILE="./wasimancer-plugin-calc.wasm"


read -r -d '' DATA <<- EOM
{
  "name": "calc",
  "path": "./bucket/wasimancer-plugin-calc.wasm",
  "version": "1.0.0",
  "description": "calculator",
  "functions": [
    {
      "displayName": "add",
      "function": "addNumbers",
      "arguments": [
        {
          "name": "a",
          "type": "number",
          "description": "first number"
        },
        {
          "name": "b",
          "type": "number",
          "description": "second number"
        }
      ],
      "description": "a function to add numbers"
    },
    {
      "displayName": "multiply",
      "function": "multiplyNumbers",
      "arguments": [
        {
          "name": "a",
          "type": "number",
          "description": "first number"
        },
        {
          "name": "b",
          "type": "number",
          "description": "second number"
        }
      ],
      "description": "a function to multiply numbers"
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