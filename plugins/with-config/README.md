# Build the plugin

**Build**:
```bash
tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-with-config.wasm \
  -target wasi main.go
```

**Run**:
```bash
extism call wasimancer-plugin-with-config.wasm display_variables \
  --input "Bob Morane" \
  --log-level "info" \
  --config WASM_VERSION=0.2.0 \
  --config WASM_MESSAGE="hello world" \
  --wasi
```

## Build with Docker

```bash
docker run --rm -v "$PWD":/hello -w /hello k33g/wasm-builder:0.0.6 \
  tinygo build -scheduler=none --no-debug \
    -o wasimancer-plugin-with-config.wasm \
    -target wasi main.go
```

## Run with Docker

```bash
docker run --rm -v "$PWD":/hello -w /hello k33g/wasm-builder:0.0.6 \
  extism call wasimancer-plugin-with-config.wasm display_variables \
  --input "Bob Morane" \
  --log-level "info" \
  --config WASM_VERSION=0.2.0 \
  --config WASM_MESSAGE="hello world" \
  --wasi
```

