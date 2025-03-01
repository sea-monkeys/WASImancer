# Build the plugin

**Build**:
```bash
tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-hello.wasm \
  -target wasi main.go
```

**Run**:
```bash
extism call wasimancer-plugin-hello.wasm say_hello \
  --input "Bob Morane" \
  --log-level "info" \
  --wasi
```
