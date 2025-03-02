package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
)

func main() {
	// Define command line flags
	oldString := flag.String("old", "", "String to be replaced")
	newString := flag.String("new", "", "String to replace with")
	filename := flag.String("file", "", "File to process")
	flag.Parse()

	// Check if required parameters are provided
	if *oldString == "" || *filename == "" {
		fmt.Println("Error: Required parameters missing.")
		fmt.Println("Usage: program -old=<string_to_replace> -new=<replacement_string> -file=<filename>")
		os.Exit(1)
	}

	// Read the file
	content, err := ioutil.ReadFile(*filename)
	if err != nil {
		fmt.Printf("Error reading file: %s\n", err)
		os.Exit(1)
	}

	// Replace strings
	newContent := strings.ReplaceAll(string(content), *oldString, *newString)

	// Write back to the file
	err = ioutil.WriteFile(*filename, []byte(newContent), 0644)
	if err != nil {
		fmt.Printf("Error writing file: %s\n", err)
		os.Exit(1)
	}

	fmt.Printf("Successfully replaced '%s' with '%s' in file: %s\n", *oldString, *newString, *filename)
}