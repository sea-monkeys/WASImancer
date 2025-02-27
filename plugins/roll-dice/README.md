# Build the plugin with the tinygo builder image

**Build**:
```bash
docker run --rm -v "$PWD":/src -w /src k33g/tinygo-builder:preview \
  tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-roll-dice.wasm \
  -target wasi main.go
```

**Run**:
```bash
docker run --rm -v "$PWD":/app -w /app k33g/tinygo-builder:preview \
  extism call wasimancer-plugin-roll-dice.wasm rollDice \
  --input '{"numFaces":6,"numDice":2}' \
  --log-level "info" \
  --wasi
```
