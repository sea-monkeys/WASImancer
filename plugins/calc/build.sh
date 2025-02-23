#!/bin/bash
tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-calc.wasm \
  -target wasi main.go

ls -lh *.wasm
