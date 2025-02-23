package main

import (
	"encoding/json"
	"strconv"

	"github.com/extism/go-pdk"
)

type Arguments struct {
	A int `json:"a"`
	B int `json:"b"`
}

//export addNumbers
func addNumbers() {
	arguments := pdk.InputString()

	var args Arguments
	json.Unmarshal([]byte(arguments), &args)
	res := args.A + args.B

	pdk.OutputString("🤖 result = " + strconv.Itoa(res))

}

//export multiplyNumbers
func multiplyNumbers() {
	arguments := pdk.InputString()

	var args Arguments
	json.Unmarshal([]byte(arguments), &args)
	res := args.A * args.B

	pdk.OutputString("🤖 result = " + strconv.Itoa(res))

}


func main() {
}
