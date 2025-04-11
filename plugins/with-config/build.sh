#!/bin/bash
tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-with-config.wasm \
  -target wasi main.go

ls -lh *.wasm
