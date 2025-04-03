#!/bin/sh
set -e

/home/.openvscode-server/bin/openvscode-server --install-extension huytd.github-light-monochrome
/home/.openvscode-server/bin/openvscode-server --install-extension golang.go
/home/.openvscode-server/bin/openvscode-server --install-extension aaron-bond.better-comments
/home/.openvscode-server/bin/openvscode-server --install-extension pkief.material-icon-theme
/home/.openvscode-server/bin/openvscode-server --install-extension pkief.material-product-icons
/home/.openvscode-server/bin/openvscode-server --install-extension rust-lang.rust-analyzer

#/home/.openvscode-server/bin/openvscode-server --install-extension GitHub.github-vscode-theme
