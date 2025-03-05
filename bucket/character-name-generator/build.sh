#!/bin/bash
tinygo build -scheduler=none --no-debug \
  -o character-name-generator.wasm \
  -target wasi main.go

ls -lh *.wasm
