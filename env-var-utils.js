

/**
 * 
 * @returns {Array} List of environment variables with a name starting with "WASM_" and a value that is not empty
 */
export function _getWasmEnvVarsList() {
    // returns the list of the environment variables with a name starting with "WASM_"
    // and a value that is not empty
    const envVars = Object.entries(process.env)
        .filter(([key, value]) => key.startsWith("WASM_") && value)
        .map(([key, value]) => ({ name: key, value: value }));
    return envVars;
}

// same function but return an object with the env var name as key and the value as value
export function getWasmEnvVarsList() {
    // returns the list of the environment variables with a name starting with "WASM_"
    // and a value that is not empty
    const envVars = Object.entries(process.env)
        .filter(([key, value]) => key.startsWith("WASM_") && value)
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
    return envVars;
}