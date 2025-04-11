# Pass configuration data at start to the plugin
!!! info "🚧 work in progress"

If you create environment variables starting by `WASM_`, for example `WASM_VERSION=0.0.1`, `WASM_MESSAGE=wasm plugins are the way`, the variables values will be available in the wasm plugin with the `pdk.GetConfig()` method:

```go
version,_ := pdk.GetConfig("WASM_VERSION")
message,_ := pdk.GetConfig("WASM_MESSAGE")
```