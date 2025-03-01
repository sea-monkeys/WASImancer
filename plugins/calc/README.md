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
