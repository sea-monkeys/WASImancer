package main

import "github.com/extism/go-pdk"

//export say_hello
func say_hello() int32 {

	// read input
	// read the function argument from the memory
	input := pdk.Input()

	
    version,_ := pdk.GetConfig("WASM_VERSION")
    message,_ := pdk.GetConfig("WASM_MESSAGE")
    hello_message,_ := pdk.GetConfig("WASM_HELLO")

	// create output
	output := "🎉 Extism is 💜, 🌍, by " + string(input) + "\n" + version + "\n" + message+ "\n" +  hello_message
	
	// return the value
	// copy output to host memory
	mem := pdk.AllocateString(output)
	pdk.OutputMemory(mem)
	return 0
	
}

func main() {
	//say_hello()
}
