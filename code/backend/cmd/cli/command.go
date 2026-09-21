package main

import (
	"log"
	"os"
	"strings"

	"github.com/WillyWinata/WebDevelopment-Personal/backend/domain/utils"
)

func Creation(command string) {
	name := strings.TrimPrefix(command, "create_")
	
	err := utils.GenerateFiles(name)
	if err != nil {
		log.Fatalf("Error generating files: %v", err)
	}
}

func main() {
	if len(os.Args) < 2 {
		log.Fatal("Usage: create_<entity_name>")
	}

	command := os.Args[1]

	if strings.HasPrefix(command, "create_") {
		Creation(command)
	} else {
		log.Fatal("Usage: create_<entity_name>")
	}

}