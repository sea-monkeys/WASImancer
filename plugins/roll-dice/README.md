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

## Build with Docker

```bash
docker run --rm -v "$PWD":/roll-dice -w /roll-dice k33g/wasm-builder:preview \
  tinygo build -scheduler=none --no-debug \
    -o wasimancer-plugin-roll-dice.wasm \
    -target wasi main.go
```

## Run with Docker

```bash
docker run --rm -v "$PWD":/roll-dice -w /roll-dice k33g/wasm-builder:preview \
  extism call wasimancer-plugin-roll-dice.wasm rollDice \
  --input '{"numFaces":6,"numDice":2}' \
  --log-level "info" \
  --wasi
```