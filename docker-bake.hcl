variable "REPO" {
  default = "k33g"
}

variable "TAG" {
  default = "0.0.3"
}

group "default" {
  targets = ["wasimancer"]
}

target "wasimancer" {
  context = "."
  platforms = [
    "linux/amd64",
    "linux/arm64"
  ]
  tags = ["${REPO}/wasimancer:${TAG}"]
}

# docker buildx bake --push --file docker-bake.hcl
# docker buildx bake --file docker-bake.hcl