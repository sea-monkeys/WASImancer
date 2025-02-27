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
  default = "tinygo-builder"
}

target "tinygo-builder" {
  context = "."
  dockerfile = "Dockerfile"
  args = {
    GO_VERSION = GO_VERSION
    TINYGO_VERSION = TINYGO_VERSION
    EXTISM_VERSION = EXTISM_VERSION
    USER_NAME = USER_NAME
  }
  tags = ["tinygo-builder:latest"]
}
