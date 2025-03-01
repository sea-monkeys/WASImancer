#!/bin/bash
cargo build --release 
cp target/wasm32-unknown-unknown/release/wasimancer_plugin_addition.wasm ./

ls -lh *.wasm
