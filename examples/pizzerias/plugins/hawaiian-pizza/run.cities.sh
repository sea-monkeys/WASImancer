#!/bin/bash
extism call wasimancer-plugin-hawaiian-pizza.wasm listOfCitiesWithHawaiianPizzas \
  --allow-host "*" \
  --log-level "info" \
  --wasi
echo ""
