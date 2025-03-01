# Extism Rust PDK Plugin

See more documentation at https://github.com/extism/rust-pdk and
[join us on Discord](https://extism.org/discord) for more help.


```bash
docker run --rm -v "$PWD":/src -w /src k33g/rust-builder:preview \
  cargo build --release; \
  cp target/wasm32-unknown-unknown/release/wasimancer_plugin_addition.wasm ./
```




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