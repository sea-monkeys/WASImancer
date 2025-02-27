# Tinygo builder for Extism plugins

## Build the builder
```bash
docker buildx bake tinygo-builder
```

## Build a plugin

To build your TinyGo plugin using Docker with the tinygo-builder image, you can create a Docker command that mounts your local directory containing the main.go file into the container and runs the tinygo build command inside the container. Here's how you can do it:

```bash
docker run --rm -v "$PWD/plugins/calc":/src -w /src tinygo-builder \
  tinygo build -scheduler=none --no-debug \
  -o wasimancer-plugin-calc.wasm \
  -target wasi main.go
```

Breakdown of the command:

- `docker run --rm`: Runs a Docker container and removes it after the command completes.
- `-v "$PWD/plugins/calc":/src`: Mounts your local plugins/calc directory to /src inside the container.
- `-w /src`: Sets the working directory inside the container to `/src`.
- `tinygo-builder`: The name of your Docker image with TinyGo installed.
- `tinygo build ...`: The command to build your Extism plugin, as you would run it locally.

> This command will compile your main.go file into a WebAssembly module named `wasimancer-plugin-calc.wasm` using the TinyGo compiler inside the Docker container. The output file will be placed in your local `plugins/calc` directory.