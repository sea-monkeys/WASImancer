#!/bin/bash
set -o allexport; source release.env; set +o allexport

: <<'COMMENT'
## Before creating a release, make sure to:
- Update the version/tag and the about message in release.env 
- Update the tag in ./docker-bake.hcl
- Update the tag in ./docker-bake-wasm.hcl
- Update the tag in ./docker-bake-wasi.hcl
- Update the tag in ./compose.yml

- Update the tag in ./plugins/compose.yml
- Update the tag in ./plugins/addition/README.md
- Update the tag in ./plugins/calc/README.md
- Update the tag in ./plugins/fetch/README.md
- Update the tag in ./plugins/hello/README.md
- Update the tag in ./plugins/roll-dice/README.md

- Update the tag in ./examples/roll-dice/compose.yml

## Tips

- delete tag: git tag -d v${TAG}
COMMENT

echo "📝 Replacing ${PREVIOUS_TAG} by ${TAG} in files..."

go run main.go -old="${PREVIOUS_TAG}" -new="${TAG}" -file="./docker-bake.hcl"
go run main.go -old="${PREVIOUS_TAG}" -new="${TAG}" -file="./docker-bake-wasm.hcl"
go run main.go -old="${PREVIOUS_TAG}" -new="${TAG}" -file="./docker-bake-wasi.hcl"
go run main.go -old="${PREVIOUS_TAG}" -new="${TAG}" -file="./compose.yml"

go run main.go -old="${PREVIOUS_TAG}" -new="${TAG}" -file="./plugins/compose.yml"
go run main.go -old="${PREVIOUS_TAG}" -new="${TAG}" -file="./plugins/addition/README.md"
go run main.go -old="${PREVIOUS_TAG}" -new="${TAG}" -file="./plugins/calc/README.md"
go run main.go -old="${PREVIOUS_TAG}" -new="${TAG}" -file="./plugins/fetch/README.md"
go run main.go -old="${PREVIOUS_TAG}" -new="${TAG}" -file="./plugins/hello/README.md"
go run main.go -old="${PREVIOUS_TAG}" -new="${TAG}" -file="./plugins/roll-dice/README.md"

go run main.go -old="${PREVIOUS_TAG}" -new="${TAG}" -file="./examples/roll-dice-project/compose.yml"

go run main.go -old="${PREVIOUS_TAG}" -new="${TAG}" -file="./README.md"

go run main.go -old="${PREVIOUS_TAG}" -new="${TAG}" -file="./index.js"

echo "🛠️ Generating release: ${ABOUT}"

find . -name '.DS_Store' -type f -delete

git add .
git commit -m "📦 ${ABOUT}"
git push

git tag -a v${TAG} -m "${ABOUT}"
git push origin v${TAG}

echo "🚀 Release v${TAG} created successfully!"
echo "📝 Don't forget to create the release on GitHub"

