#!/bin/bash
tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-hawaiian-pizza.wasm \
  -target wasi main.go

ls -lh *.wasm
