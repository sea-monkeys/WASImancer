#!/bin/bash
extism call wasimancer-plugin-calc.wasm addNumbers \
  --input '{"a":30, "b":12}' \
  --log-level "info" \
  --wasi
echo ""
