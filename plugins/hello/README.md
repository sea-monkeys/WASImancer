# Build the plugin with the tinygo builder image

**Build**:
```bash
docker run --rm -v "$PWD":/src -w /src tinygo-builder \
  tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-hello.wasm \
  -target wasi main.go
```

**Run**:
```bash
docker run --rm -v "$PWD":/app -w /app tinygo-builder \
  extism call wasimancer-plugin-hello.wasm say_hello \
  --input "Bob Morane" \
  --log-level "info" \
  --wasi
```
