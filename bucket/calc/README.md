# Build the plugin

**Build**:
```bash
tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-calc.wasm \
  -target wasi main.go
```

**Run**:
```bash
extism call wasimancer-plugin-calc.wasm addNumbers \
  --input '{"a":30, "b":12}' \
  --log-level "info" \
  --wasi
```

```bash
extism call wasimancer-plugin-calc.wasm multiplyNumbers \
  --input '{"a":30, "b":12}' \
  --log-level "info" \
  --wasi
```

## Build with Docker

```bash
docker run --rm -v "$PWD":/calc -w /calc k33g/wasm-builder:0.0.5 \
  tinygo build -scheduler=none --no-debug \
    -o wasimancer-plugin-calc.wasm \
    -target wasi main.go
```

## Run with Docker

```bash
docker run --rm -v "$PWD":/calc -w /calc k33g/wasm-builder:0.0.5 \
  extism call wasimancer-plugin-calc.wasm addNumbers \
  --input '{"a":30, "b":12}' \
  --log-level "info" \
  --wasi
```

```bash
docker run --rm -v "$PWD":/calc -w /calc k33g/wasm-builder:0.0.5 \
  extism call wasimancer-plugin-calc.wasm multiplyNumbers \
  --input '{"a":30, "b":12}' \
  --log-level "info" \
  --wasi
```