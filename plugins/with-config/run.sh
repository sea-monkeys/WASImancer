#!/bin/bash

extism call wasimancer-plugin-with-config.wasm display_variables \
  --input "Bob Morane" \
  --log-level "info" \
  --config WASM_VERSION=0.2.0 \
  --config WASM_MESSAGE="hello world" \
  --wasi
echo ""
