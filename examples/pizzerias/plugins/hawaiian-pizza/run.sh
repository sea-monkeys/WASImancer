#!/bin/bash
extism call wasimancer-plugin-hawaiian-pizza.wasm retrievePizzeriaAddresses \
  --input '{"city": "Hong Kong"}' \
  --allow-host "*" \
  --log-level "info" \
  --wasi
echo ""
