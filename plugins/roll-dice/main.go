package main

import (
	"encoding/json"
	"math/rand"
	"strconv"
	"time"

	"github.com/extism/go-pdk"
)

type Arguments struct {
	NumFaces int `json:"numFaces"`
	NumDice  int `json:"numDice"`
}

// RollDice rolls a specified number of dice with a specified number of faces
// and returns the sum of the results

//export rollDice
func rollDice() int32 {

	arguments := pdk.InputString()

	var args Arguments
	json.Unmarshal([]byte(arguments), &args)
	numFaces := args.NumFaces 
	numDice := args.NumDice

	// Initialize random number generator with a time-based seed
	rand.Seed(time.Now().UnixNano())
	
	// Sum of the dice roll results
	sum := 0
	
	// Roll each die and add the result to the sum
	for i := 0; i < numDice; i++ {
		// Generate a random number between 1 and numFaces
		dieValue := rand.Intn(numFaces) + 1
		sum += dieValue
	}
	
	pdk.OutputString(strconv.Itoa(sum))
	return 0
	
}

func main() {
}
