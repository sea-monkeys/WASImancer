# Build the plugin with the tinygo builder image

**Build**:
```bash
docker run --rm -v "$PWD":/src -w /src k33g/wasm-builder:preview \
  tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-hello.wasm \
  -target wasi main.go
```

**Run**:
```bash
docker run --rm -v "$PWD":/app -w /app k33g/wasm-builder:preview \
  extism call wasimancer-plugin-hello.wasm say_hello \
  --input "Bob Morane" \
  --log-level "info" \
  --wasi
```
