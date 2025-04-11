#!/bin/bash
extism call wasimancer-plugin-hawaiian-pizza.wasm retrievePizzeriaAddressesMarkdown \
  --input '{"city": "lyon"}' \
  --allow-host "*" \
  --log-level "info" \
  --wasi
echo ""
