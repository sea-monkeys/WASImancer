#!/bin/bash
tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-hello.wasm \
  -target wasi main.go

ls -lh *.wasm
