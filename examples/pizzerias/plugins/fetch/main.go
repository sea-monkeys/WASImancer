package main

import (
	"encoding/json"

	"github.com/extism/go-pdk"
)


type Arguments struct {
	Url string `json:"url"`
}


//export fetch
func fetch() int32 {
	arguments := pdk.InputString()

	var args Arguments
	json.Unmarshal([]byte(arguments), &args)
	url := args.Url

	req := pdk.NewHTTPRequest(pdk.MethodGet, url)

	res := req.Send()
	pdk.OutputMemory(res.Memory())
	return 0
	
}

func main() {}
