# Creating Rust Plugins for WASImancer: A Step-by-Step Guide
!!! info "🚧 work in progress"

This guide will walk you through the process of creating, building, and running a WebAssembly plugin for WASImancer using Rust. We'll create a simple calculator plugin that can add two numbers.

## Prerequisites

To follow this guide, you'll need:

- [Rust](https://www.rust-lang.org/tools/install) and Cargo installed
- [wasm32-unknown-unknown target](https://rustwasm.github.io/docs/book/game-of-life/setup.html) for WebAssembly compilation
- [Extism CLI](https://github.com/extism/cli) for testing

Alternatively, you can use the Docker image provided by WASImancer:
```bash
docker pull k33g/wasm-builder:0.0.5
```

## Project Setup

Let's create a new Rust library project:

```bash
mkdir -p addition
cd addition
```

## Creating the Rust Project

Initialize a new Rust library project:

```bash
cargo init --lib
```

## Configuring the Project for WebAssembly

First, edit the `Cargo.toml` file to set up your project for WebAssembly compilation:

```toml
[package]
name = "wasimancer-plugin-addition"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
extism-pdk = "1.3.0"
serde = { version = "1", features = ["derive"] }
```

Key points about this configuration:
- `crate-type = ["cdylib"]` specifies that we're building a dynamic library suitable for WebAssembly
- `extism-pdk` is the Extism Plugin Development Kit for Rust
- `serde` is used for serializing and deserializing JSON data

Next, create a `.cargo/config.toml` file to set the default target:

```toml
[build]
target = "wasm32-unknown-unknown"
```

## Writing the Plugin Code

Replace the contents of `src/lib.rs` with the following code:

```rust
use extism_pdk::*;
use serde::{Deserialize, Serialize};

// Define input structure for addition
#[derive(FromBytes, Deserialize, PartialEq, Debug)]
#[encoding(Json)]
struct Add {
    left: i32,
    right: i32,
}

// Define output structure for the sum
#[derive(ToBytes, Serialize, PartialEq, Debug)]
#[encoding(Json)]
struct Sum {
    value: i32,
}

#[plugin_fn]
pub fn add(input: Add) -> FnResult<Sum> {
    // Add the two numbers and return the result
    Ok(Sum {
        value: input.left + input.right,
    })
}
```

### Understanding the Code

1. We import the necessary components from `extism_pdk` and `serde` to handle WebAssembly interaction and JSON serialization.

2. We define two structs:
   - `Add`: Represents the input with two integers (`left` and `right`)
   - `Sum`: Represents the output with a single integer (`value`)

3. The `#[plugin_fn]` macro marks our `add` function as an exported plugin function.

4. The `add` function takes an `Add` input, performs the addition, and returns a `Sum` result wrapped in `FnResult`.

5. Both structs use the `#[encoding(Json)]` attribute to specify that they should be encoded/decoded as JSON.

## Building the Plugin

### Using Local Rust

To compile your Rust code to WebAssembly:

```bash
cargo build --release
```

The compiled WebAssembly file will be located at `target/wasm32-unknown-unknown/release/wasimancer_plugin_addition.wasm`.

Copy it to your project directory:

```bash
cp target/wasm32-unknown-unknown/release/wasimancer_plugin_addition.wasm ./
```

### Using Docker

If you're using the WASImancer's Docker image:

```bash
docker run --rm -v "$PWD":/addition -w /addition k33g/wasm-builder:0.0.5 \
  bash -c "
    cargo clean && \
    cargo install cargo-cache && \
    cargo cache -a && \
    cargo build --release && \
    cp target/wasm32-unknown-unknown/release/wasimancer_plugin_addition.wasm ./
  "
```

## Testing the Plugin Locally

You can test your plugin using the Extism CLI before deploying it to WASImancer:

### Using Local Extism CLI

```bash
extism call wasimancer_plugin_addition.wasm add \
  --input '{"left":30, "right":12}' \
  --log-level "info" \
  --wasi
```

### Using Docker

```bash
docker run --rm -v "$PWD":/addition -w /addition k33g/wasm-builder:0.0.5 \
  extism call wasimancer_plugin_addition.wasm add \
  --input '{"left":30, "right":12}' \
  --log-level "info" \
  --wasi
```

You should see output like: `{"value":42}`, indicating that the addition function correctly added 30 and 12.

## Creating the Plugin Configuration

To use your plugin with WASImancer, you need to create a configuration in the `plugins.yml` file. Add the following entry:

```yaml
plugins:
  - name: addition
    path: /addition/wasimancer_plugin_addition.wasm
    version: 1.0.0
    description: addition
    functions:
      - displayName: add with rust
        function: add
        arguments:
          - name: left
            type: number
            description: first number
          - name: right
            type: number
            description: second number
        description: a function to add numbers
```

## Deploying the Plugin to WASImancer

### Method 1: Manual Deployment

1. Copy your WebAssembly file to the WASImancer plugins directory:
   ```bash
   cp wasimancer_plugin_addition.wasm /path/to/wasimancer/plugins/addition/
   ```

2. Restart WASImancer or use the hot-reload API (next method).

### Method 2: Using the Upload API

You can use the WASImancer API to upload your plugin without restarting the server:

1. Create a shell script named `publish.sh` with the following content:

```bash
#!/bin/bash
TOKEN="wasimancer-rocks"  # Use your configured token

UPLOAD_ENDPOINT="http://localhost:3001/upload-plugin"
WASM_FILE="./wasimancer_plugin_addition.wasm"

read -r -d '' DATA <<- EOM
{
  "name": "addition",
  "path": "./bucket/wasimancer_plugin_addition.wasm",
  "version": "1.0.0",
  "description": "addition",
  "functions": [
    {
      "displayName": "add with rust",
      "function": "add",
      "arguments": [
        {
          "name": "left",
          "type": "number",
          "description": "first number"
        },
        {
          "name": "right",
          "type": "number",
          "description": "second number"
        }
      ],
      "description": "a function to add numbers"
    }
  ]
}
EOM

curl -X POST ${UPLOAD_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "wasmFile=@${WASM_FILE}" \
  -F "pluginData=${DATA}"
```

2. Make the script executable and run it:
   ```bash
   chmod +x publish.sh
   ./publish.sh
   ```

## Testing the Plugin in WASImancer

You can test your deployed plugin using the MCP Inspector:

1. Start the Inspector:
   ```bash
   npx @modelcontextprotocol/inspector
   ```

2. Connect to your WASImancer instance (typically at `http://localhost:3001/sse`).

3. Navigate to the "Tools" tab, find your plugin, and click "Run Tool".

<!--
## Creating a More Complex Plugin

Let's create a more sophisticated plugin that can perform multiple arithmetic operations. Create a new project:

```bash
mkdir -p calculator
cd calculator
cargo init --lib
```

Edit the `Cargo.toml` file as before, but with a different package name:

```toml
[package]
name = "wasimancer-plugin-calculator"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
extism-pdk = "1.3.0"
serde = { version = "1", features = ["derive"] }
```

Create the `.cargo/config.toml` file:

```toml
[build]
target = "wasm32-unknown-unknown"
```

Now, create a more complex plugin in `src/lib.rs`:

```rust
use extism_pdk::*;
use serde::{Deserialize, Serialize};

// Define input structure for calculator operations
#[derive(FromBytes, Deserialize, PartialEq, Debug)]
#[encoding(Json)]
struct CalcInput {
    operation: String,
    a: f64,
    b: f64,
}

// Define output structure for the result
#[derive(ToBytes, Serialize, PartialEq, Debug)]
#[encoding(Json)]
struct CalcResult {
    result: f64,
    operation: String,
}

#[plugin_fn]
pub fn calculate(input: CalcInput) -> FnResult<CalcResult> {
    let result = match input.operation.as_str() {
        "add" => input.a + input.b,
        "subtract" => input.a - input.b,
        "multiply" => input.a * input.b,
        "divide" => {
            if input.b == 0.0 {
                return Err(Error::new("Division by zero"));
            }
            input.a / input.b
        },
        "power" => input.a.powf(input.b),
        _ => return Err(Error::new("Unknown operation")),
    };
    
    Ok(CalcResult {
        result,
        operation: input.operation,
    })
}
```

Build this plugin:

```bash
cargo build --release
cp target/wasm32-unknown-unknown/release/wasimancer_plugin_calculator.wasm ./
```

Test it with the Extism CLI:

```bash
extism call wasimancer_plugin_calculator.wasm calculate \
  --input '{"operation":"multiply","a":6,"b":7}' \
  --log-level "info" \
  --wasi
```

You should see output like: `{"result":42,"operation":"multiply"}`.

Update your plugin configuration:

```yaml
plugins:
  - name: calculator
    path: /calculator/wasimancer_plugin_calculator.wasm
    version: 1.0.0
    description: advanced calculator
    functions:
      - displayName: calculate
        function: calculate
        arguments:
          - name: operation
            type: string
            description: one of 'add', 'subtract', 'multiply', 'divide', or 'power'
          - name: a
            type: number
            description: first number
          - name: b
            type: number
            description: second number
        description: perform arithmetic operations
```

## Error Handling in Rust Plugins

One advantage of using Rust for WebAssembly plugins is its robust error handling. In the calculator example, we returned errors for division by zero and unknown operations:

```rust
"divide" => {
    if input.b == 0.0 {
        return Err(Error::new("Division by zero"));
    }
    input.a / input.b
},
```

When an error occurs, Extism will catch it and return it to the host, making it easy to handle errors gracefully in your applications.
-->
## Debugging Tips for Rust Plugins

<!--
1. **Use the Debug Macro**: Rust's `Debug` trait (which we derived for our structs) helps you print detailed debug information:
   ```rust
   eprintln!("Debug input: {:?}", input);
   ```
-->
2. **Extism Logging**: The Extism PDK provides logging functions:
   ```rust
   extism_pdk::log::info!("Processing calculation: {} {} {}", input.a, input.operation, input.b);
   ```

3. **Test with `--log-level "debug"` or `--log-level "trace"` flags**: When using the Extism CLI, increase the log level for more details.

4. **Validate JSON Parsing**: If you're having issues with JSON parsing, try adding explicit error handling:
   ```rust
   #[plugin_fn]
   pub fn calculate(json: String) -> FnResult<String> {
       // Manual parsing with explicit error handling
       let input: CalcInput = match serde_json::from_str(&json) {
           Ok(val) => val,
           Err(e) => return Err(Error::new(&format!("JSON parse error: {}", e))),
       };
       
       // Process as before...
   }
   ```

## Best Practices for Rust Plugins

1. **Leverage Rust's Type System**: Use Rust's strong type system to prevent bugs and make your code more maintainable.

2. **Use `Result` for Error Handling**: Return meaningful errors rather than panicking, which can cause unexpected behavior in WebAssembly.

3. **Keep Dependencies Minimal**: Large dependencies can increase your WebAssembly module size and slow down loading times.

4. **Optimize for Size**: Use build flags to optimize for smaller WebAssembly modules:
   ```toml
   [profile.release]
   lto = true
   opt-level = 's'
   ```

5. **Use Rust's Memory Management**: Take advantage of Rust's ownership model to prevent memory leaks, which is especially important in long-running WebAssembly modules.

6. **Document Your Code**: Add thorough documentation comments to make your plugins easier to maintain.

## Build Script for Convenience

Create a `build.sh` script to simplify the build process:

```bash
#!/bin/bash
cargo clean
cargo build --release
cp target/wasm32-unknown-unknown/release/wasimancer_plugin_addition.wasm ./
ls -lh *.wasm
```

And a `run.sh` script to test your plugin:

```bash
#!/bin/bash
extism call wasimancer_plugin_addition.wasm add \
  --input '{"left":30, "right":12}' \
  --log-level "info" \
  --wasi
echo ""
```

Make them executable:
```bash
chmod +x build.sh run.sh
```

## Conclusion

You've now learned how to create, build, test, and deploy a Rust plugin for WASImancer. Rust's combination of safety, performance, and WebAssembly support makes it an excellent choice for developing WASImancer plugins. By leveraging Rust's rich ecosystem and type system, you can create powerful, secure tools that enhance your AI applications through the Model Context Protocol.
