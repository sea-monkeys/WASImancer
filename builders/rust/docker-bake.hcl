variable "REPO" {
  default = "k33g"
}

variable "TAG" {
  default = "preview"
}

variable "EXTISM_VERSION" {
  default = "1.6.2"
}

variable "USER_NAME" {
  default = "rust-builder"
}

group "default" {
  targets = ["rust-builder"]
}

target "rust-builder" {
  context = "."
  dockerfile = "Dockerfile"
  args = {
    EXTISM_VERSION = EXTISM_VERSION
    USER_NAME = USER_NAME
  }
  platforms = [
    "linux/amd64",
    "linux/arm64"
  ]
  tags = ["${REPO}/rust-builder:${TAG}"]
}

# docker buildx bake --push rust-builder