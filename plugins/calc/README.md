# Build the plugin with the tinygo builder image

**Build**:
```bash
docker run --rm -v "$PWD":/src -w /src k33g/tinygo-builder:preview \
  tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-calc.wasm \
  -target wasi main.go
```

**Run**:
```bash
docker run --rm -v "$PWD":/app -w /app k33g/tinygo-builder:preview \
  extism call wasimancer-plugin-calc.wasm addNumbers \
  --input '{"a":12,"b":30}' \
  --log-level "info" \
  --wasi
```

```bash
docker run --rm -v "$PWD":/app -w /app k33g/tinygo-builder:preview \
  extism call wasimancer-plugin-calc.wasm multiplyNumbers \
  --input '{"a":12,"b":30}' \
  --log-level "info" \
  --wasi
```