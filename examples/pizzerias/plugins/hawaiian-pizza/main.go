package main

import (
	"encoding/json"
	"strconv"
	"strings"

	"github.com/extism/go-pdk"
)


type Arguments struct {
	City string `json:"city"`
}


//export retrievePizzeriaAddresses
func retrievePizzeriaAddresses() int32 {
	arguments := pdk.InputString()

	var args Arguments
	json.Unmarshal([]byte(arguments), &args)

    // Convert to lowercase
    lowercase := strings.ToLower(args.City)    
    // Remove spaces
    city := strings.ReplaceAll(lowercase, " ", "")

	url := "https://raw.githubusercontent.com/hawaiian-pizza-corp/api/refs/heads/main/" + city + ".json"

	req := pdk.NewHTTPRequest(pdk.MethodGet, url)

	res := req.Send()
	
	status := res.Status()
	if status > 299 || status < 200 {
		pdk.OutputString("Error: " + strconv.Itoa(int(status)))
		return 1
	}

	pdk.OutputMemory(res.Memory())
	return 0
	
}

//export retrievePizzeriaAddressesMarkdown
func retrievePizzeriaAddressesMarkdown() int32 {
	arguments := pdk.InputString()

	var args Arguments
	json.Unmarshal([]byte(arguments), &args)

    // Convert to lowercase
    lowercase := strings.ToLower(args.City)    
    // Remove spaces
    city := strings.ReplaceAll(lowercase, " ", "")

	url := "https://raw.githubusercontent.com/hawaiian-pizza-corp/api/refs/heads/main/" + city + ".md"

	req := pdk.NewHTTPRequest(pdk.MethodGet, url)

	res := req.Send()
	
	status := res.Status()
	if status > 299 || status < 200 {
		pdk.OutputString("Error: " + strconv.Itoa(int(status)))
		return 1
	}

	pdk.OutputMemory(res.Memory())
	return 0
	
}


//export listOfCitiesWithHawaiianPizzas
func listOfCitiesWithHawaiianPizzas() int32 {
	url := "https://raw.githubusercontent.com/hawaiian-pizza-corp/api/refs/heads/main/cities.json"
	req := pdk.NewHTTPRequest(pdk.MethodGet, url)

	res := req.Send()
	
	status := res.Status()
	if status > 299 || status < 200 {
		pdk.OutputString("Error: " + strconv.Itoa(int(status)))
		return 1
	}

	pdk.OutputMemory(res.Memory())
	return 0
}


//export whoDared
func whoDared() int32 {
	url := "https://raw.githubusercontent.com/hawaiian-pizza-corp/api/refs/heads/main/who-dared.json"
	req := pdk.NewHTTPRequest(pdk.MethodGet, url)

	res := req.Send()
	
	status := res.Status()
	if status > 299 || status < 200 {
		pdk.OutputString("Error: " + strconv.Itoa(int(status)))
		return 1
	}

	pdk.OutputMemory(res.Memory())
	return 0
}

func main() {}
