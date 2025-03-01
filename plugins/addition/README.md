# Extism Rust PDK Plugin

## Create Extism plugin

```bash
mkdir addition && cd addition
extism generate plugin 
```
> see: https://github.com/extism/cli?tab=readme-ov-file#generate-a-plugin


**build**:
```bash
cd addition
cargo build --release 
cp target/wasm32-unknown-unknown/release/wasimancer_plugin_addition.wasm ./
```