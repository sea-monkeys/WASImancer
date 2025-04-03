package main

import "github.com/extism/go-pdk"

//export say_hello
func say_hello() int32 {

	// read input
	// read the function argument from the memory
	input := pdk.Input()
		
	// create output
	output := "🎉 Extism is 💜, 🌍, by " + string(input)
	
	// return the value
	// copy output to host memory
	mem := pdk.AllocateString(output)
	pdk.OutputMemory(mem)
	return 0
	
}

func main() {
	//say_hello()
}
