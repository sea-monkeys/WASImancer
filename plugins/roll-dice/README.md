# Build the plugin

**Build**:
```bash
tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-roll-dice.wasm \
  -target wasi main.go
```

**Run**:
```bash
extism call wasimancer-plugin-roll-dice.wasm rollDice \
  --input '{"numFaces":6,"numDice":2}' \
  --log-level "info" \
  --wasi
```
