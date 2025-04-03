# Build the plugin

**Build**:
```bash
tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-hawaiian-pizza.wasm \
  -target wasi main.go
```

**Run**:
```bash
extism call wasimancer-plugin-hawaiian-pizza.wasm retrievePizzeriaAddresses \
  --input '{"city": "Hong Kong"}' \
  --allow-host "*" \
  --log-level "info" \
  --wasi
```

## Build with Docker

```bash
docker run --rm -v "$PWD":/fetch -w /fetch k33g/wasm-builder:0.0.4 \
  tinygo build -scheduler=none --no-debug \
    -o wasimancer-plugin-hawaiian-pizza.wasm \
    -target wasi main.go
```

## Run with Docker

```bash
docker run --rm -v "$PWD":/fetch -w /fetch k33g/wasm-builder:0.0.4 \
  extism call wasimancer-plugin-hawaiian-pizza.wasm retrievePizzeriaAddresses \
  --input '{"city": "Hong Kong"}' \
  --allow-host "*" \
  --log-level "info" \
  --wasi
```