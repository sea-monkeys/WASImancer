package main

import (
	"math/rand"
	"time"

	"github.com/extism/go-pdk"
)

// Word lists for generating GitHub-style names
var (
	adjectives = []string{
		"admirable", "brave", "charming", "determined", "elegant", "fantastic", "graceful",
		"heroic", "inspiring", "jolly", "kind", "loyal", "majestic", "noble",
		"optimistic", "peaceful", "quirky", "resilient", "serene", "tenacious", "unique",
		"valiant", "wonderful", "xenial", "zealous", "agile", "brilliant", "curious",
		"daring", "energetic", "fierce", "generous", "honest", "imaginative", "jovial",
	}

	nouns = []string{
		"eagle", "whale", "hummingbird", "dolphin", "elephant", "falcon", "gorilla",
		"owl", "iguana", "jaguar", "koala", "leopard", "medusa", "narwhal",
		"orca", "panther", "quokka", "raccoon", "salamander", "tiger", "unicorn",
		"vulture", "wombat", "xerus", "yak", "zebra", "albatross", "bison", "chameleon",
		"dragon", "squirrel", "flamingo", "gazelle", "hippocampus", "ibis",
	}
)


//export GenerateCharacterName
func GenerateCharacterName() {

	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	
	// Select a random adjective and noun
	adj := adjectives[r.Intn(len(adjectives))]
	noun := nouns[r.Intn(len(nouns))]
	
	// Combine with a hyphen, GitHub-style
	output := adj + "-" + noun
	
	// return the value
	// copy output to host memory
	mem := pdk.AllocateString(output)
	pdk.OutputMemory(mem)
	
}

func main() {
	
}

