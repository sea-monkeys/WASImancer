variable "REPO" {
  default = "k33g"
}

variable "TAG" {
  default = "0.0.2"
}

variable "GO_VERSION" {
  default = "1.23.0"
}

variable "TINYGO_VERSION" {
  default = "0.35.0"
}

variable "EXTISM_VERSION" {
  default = "1.6.2"
}

variable "USER_NAME" {
  default = "wasm-builder"
}

group "default" {
  targets = ["wasm-builder"]
}

target "wasm-builder" {
  context = "."
  dockerfile = "wasm-builder.Dockerfile"
  args = {
    GO_VERSION = GO_VERSION
    TINYGO_VERSION = TINYGO_VERSION
    EXTISM_VERSION = EXTISM_VERSION
    USER_NAME = USER_NAME
  }
  platforms = [
    "linux/amd64",
    "linux/arm64"
  ]
  tags = ["${REPO}/wasm-builder:${TAG}"]
}

# docker buildx bake --push --file docker-bake-wasm.hcl
# docker buildx bake --file docker-bake-wasm.hcl