# WASImancer plugins

# Build all plugins with Docker Compose

```bash
docker compose up
```


mkdir addition && cd addition
extism generate plugin 


cargo build --release 

cp target/wasm32-unknown-unknown/release/wasimancer_plugin_addition.wasm ./


