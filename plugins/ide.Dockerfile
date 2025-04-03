FROM --platform=$BUILDPLATFORM gitpod/openvscode-server:latest

LABEL maintainer="@k33g_org"

ARG TARGETOS
ARG TARGETARCH

ARG GO_VERSION=${GO_VERSION}
ARG TINYGO_VERSION=${TINYGO_VERSION}
ARG NODE_MAJOR=${NODE_MAJOR}
ARG EXTISM_VERSION=${EXTISM_VERSION}

ARG USER_NAME=${USER_NAME}

USER root

# ------------------------------------
# Install Tools
# ------------------------------------
RUN <<EOF
apt-get update 
apt-get install -y curl wget git build-essential xz-utils software-properties-common sudo sshpass
apt-get install -y clang lldb lld

apt-get clean autoclean
apt-get autoremove --yes
rm -rf /var/lib/{apt,dpkg,cache,log}/
EOF
    

# ------------------------------------
# Install Docker
# ------------------------------------
RUN <<EOF
# Add Docker's official GPG key:
apt-get update
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
EOF


# ------------------------------------
# Install Go
# ------------------------------------
RUN <<EOF
wget https://go.dev/dl/go${GO_VERSION}.linux-${TARGETARCH}.tar.gz
tar -xzf go${GO_VERSION}.linux-${TARGETARCH}.tar.gz -C /usr/local
rm go${GO_VERSION}.linux-${TARGETARCH}.tar.gz
EOF

# Set Go environment variables
ENV PATH="/usr/local/go/bin:${PATH}"
ENV GOPATH="/go"
ENV GOROOT="/usr/local/go"

RUN <<EOF
go install -v golang.org/x/tools/gopls@latest
EOF

RUN <<EOF
mkdir -p /go/pkg/mod
mkdir -p /go/bin
chown -R ${USER_NAME}:${USER_NAME} /go
EOF

RUN <<EOF
go version
go install -v golang.org/x/tools/gopls@latest
go install -v github.com/ramya-rao-a/go-outline@latest
go install -v github.com/stamblerre/gocode@v1.0.0
go install -v github.com/mgechev/revive@v1.3.2
EOF

# ------------------------------------
# Install TinyGo
# ------------------------------------
RUN <<EOF
wget https://github.com/tinygo-org/tinygo/releases/download/v${TINYGO_VERSION}/tinygo_${TINYGO_VERSION}_${TARGETARCH}.deb
dpkg -i tinygo_${TINYGO_VERSION}_${TARGETARCH}.deb
rm tinygo_${TINYGO_VERSION}_${TARGETARCH}.deb
EOF

# ------------------------------------
# Install Extism CLI
# ------------------------------------
RUN <<EOF
wget https://github.com/extism/cli/releases/download/v${EXTISM_VERSION}/extism-v${EXTISM_VERSION}-linux-${TARGETARCH}.tar.gz
    
tar -xf extism-v${EXTISM_VERSION}-linux-${TARGETARCH}.tar.gz -C /usr/bin
rm extism-v${EXTISM_VERSION}-linux-${TARGETARCH}.tar.gz
    
#extism --version
EOF
    
# ------------------------------------
# Install NodeJS
# ------------------------------------
RUN <<EOF
apt-get update && apt-get install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
apt-get update && apt-get install nodejs -y
EOF

# ------------------------------------
# Install Python 3.9 and pip
# ------------------------------------
RUN <<EOF
apt-get update
apt-get install -y software-properties-common
add-apt-repository -y ppa:deadsnakes/ppa
apt-get update
apt-get install -y python3.9 python3.9-distutils python3.9-dev
curl -sS https://bootstrap.pypa.io/get-pip.py | python3.9
# Create symlinks
ln -sf /usr/bin/python3.9 /usr/bin/python3
ln -sf /usr/bin/python3.9 /usr/bin/python
ln -sf /usr/local/bin/pip3.9 /usr/local/bin/pip3
ln -sf /usr/local/bin/pip3.9 /usr/local/bin/pip
EOF


#  Add new user `${USER_NAME}` to docker group
RUN adduser ${USER_NAME} docker

RUN <<EOF
groupadd docker
usermod -aG docker ${USER_NAME}
EOF
    
USER ${USER_NAME}


# ------------------------------------
# Install Rust + Wasm Toolchain
# ------------------------------------
ENV HOME=/home/${USER_NAME}
ENV PATH="${HOME}/.cargo/bin:${PATH}"

RUN <<EOF
set -eux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | HOME=${HOME} sh -s -- -y

. "${HOME}/.cargo/env"

cargo install --locked wasm-tools
cargo install wit-bindgen-cli
cargo install cargo-component

rustup target add wasm32-wasip1
rustup target add wasm32-unknown-unknown
EOF




