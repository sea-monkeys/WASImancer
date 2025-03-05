# Build the plugin

**Build**:
```bash
tinygo build -scheduler=none --no-debug \
  -o character-name-generator.wasm \
  -target wasi main.go
```

**Run**:
```bash
extism call character-name-generator.wasm GenerateCharacterName \
  --wasi
```

## Build with Docker

```bash
docker run --rm -v "$PWD":/character-name-generator-new -w /character-name-generator-new k33g/wasm-builder:0.0.1 \
  tinygo build -scheduler=none --no-debug \
    -o character-name-generator.wasm \
    -target wasi main.go
```

## Run with Docker

```bash
docker run --rm -v "$PWD":/character-name-generator-new -w /character-name-generator-new k33g/wasm-builder:0.0.1 \
  extism call character-name-generator.wasm GenerateCharacterName \
  --wasi
```

