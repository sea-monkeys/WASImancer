package main

import "github.com/extism/go-pdk"

//export display_variables
func display_variables() int32 {

	// read input
	// read the function argument from the memory
	input := pdk.Input()

    version,_ := pdk.GetConfig("WASM_VERSION")
    message,_ := pdk.GetConfig("WASM_MESSAGE")

	// create output
	output := "Argument: " + string(input) + "\nVersion:" + version + "\nMessage:" + message
	
	// return the value
	// copy output to host memory
	mem := pdk.AllocateString(output)
	pdk.OutputMemory(mem)
	return 0
	
}

func main() {
	//display_variables()
}
