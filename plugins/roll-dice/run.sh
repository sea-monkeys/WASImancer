#!/bin/bash
extism call wasimancer-plugin-roll-dice.wasm rollDice \
  --input '{"numFaces":6,"numDice":2}' \
  --log-level "info" \
  --wasi
echo ""
