# Build the plugin

**Build**:
```bash
tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-fetch.wasm \
  -target wasi main.go
```

**Run**:
```bash
extism call wasimancer-plugin-fetch.wasm fetch \
  --input "https://modelcontextprotocol.io/introduction" \
  --allow-host "*" \
  --log-level "info" \
  --wasi
```
