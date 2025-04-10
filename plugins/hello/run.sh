#!/bin/bash
#export WASM_VERSION="0.2.0"
#export WASM_MESSAGES="wasm-messages"
#export WASM_HELLO="wasm-hello"
extism call wasimancer-plugin-hello.wasm say_hello \
  --input "Bob Morane" \
  --log-level "info" \
  --wasi
echo ""
