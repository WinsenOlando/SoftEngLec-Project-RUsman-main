package utils

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
)

func GetServiceTemplate(name string) (string, error) {
	path := "../backend/domain/utils/templates/service.txt"

	content, err := os.ReadFile(path)
    if err != nil {
        return "", err
    }

	template := string(content)
	template = strings.ReplaceAll(template, "{{EntityNameUpper}}", name)
	template = strings.ReplaceAll(template, "{{EntityNameLower}}", TitleToCamelCase(name))

    return string(template), nil
}

func GetHandlerTemplate(name string) (string, error) {
	path := "../backend/domain/utils/templates/handler.txt"

	content, err := os.ReadFile(path)
    if err != nil {
        return "", err
    }

	template := string(content)
	template = strings.ReplaceAll(template, "{{EntityNameUpper}}", name)
	template = strings.ReplaceAll(template, "{{EntityNameLower}}", TitleToCamelCase(name))
	template = strings.ReplaceAll(template, "{{EntityNameKebab}}", TitleToKebabCase(name))

    return string(template), nil
}

func GetRepositoryTemplate(name string) (string, error) {
	path := "../backend/domain/utils/templates/repository.txt"

	content, err := os.ReadFile(path)
    if err != nil {
        return "", err
    }

	template := string(content)
	template = strings.ReplaceAll(template, "{{EntityNameUpper}}", name)
	template = strings.ReplaceAll(template, "{{EntityNameLower}}", TitleToCamelCase(name))

    return string(template), nil
}

func GetMigrationTemplate(name string) (string, error) {
	path := "../backend/domain/utils/templates/migration.txt"

	content, err := os.ReadFile(path)
    if err != nil {
        return "", err
    }

	template := string(content)
	template = strings.ReplaceAll(template, "{{EntityNameUpper}}", name)
	template = strings.ReplaceAll(template, "{{EntityNameLower}}", TitleToCamelCase(name))

    return string(template), nil
}

func GetEntityTemplate(name string) (string, error) {
	path := "../backend/domain/utils/templates/entity.txt"

	content, err := os.ReadFile(path)
    if err != nil {
        return "", err
    }

	template := string(content)
	template = strings.ReplaceAll(template, "{{EntityNameUpper}}", name)
	template = strings.ReplaceAll(template, "{{EntityNameLower}}", TitleToCamelCase(name))

    return string(template), nil
}

func GenerateFiles(name string) error {
	projectRoot, err := os.Getwd()
	if err != nil {
		log.Fatalf("Failed to get working dir: %v", err)
	}

	entityContent, err := GetEntityTemplate(SnakeToTitleCase(name))
	if err != nil {
		log.Fatalf("Failed to get entity template: %v", err)
	}

	migrationContent, err := GetMigrationTemplate(SnakeToTitleCase(name))
	if err != nil {
		log.Fatalf("Failed to get migration template: %v", err)
	}

	handlerContent, err := GetHandlerTemplate(SnakeToTitleCase(name))
	if err != nil {
		log.Fatalf("Failed to get handler template: %v", err)
	}

	repositoryContent, err := GetRepositoryTemplate(SnakeToTitleCase(name))
	if err != nil {
		log.Fatalf("Failed to get repository template: %v", err)
	}

	serviceContent, err := GetServiceTemplate(SnakeToTitleCase(name))
	if err != nil {
		log.Fatalf("Failed to get service template: %v", err)
	}

	fileList := []map[string]string{
		{
			"type": "entity",
			"path": filepath.Join(projectRoot, "domain", "entities", fmt.Sprintf("%s.go", name)),
			"content": entityContent,
		},
		{
			"type": "migration",
			"path": filepath.Join(projectRoot, "infrastructure", "database", "migrations", fmt.Sprintf("%s_migration.go", name)),
			"content": migrationContent,
		},
		{
			"type": "service",
			"path": filepath.Join(projectRoot, "application", "services", fmt.Sprintf("%s_service.go", name)),
			"content": serviceContent,
		},
		{
			"type": "handler",
			"path": filepath.Join(projectRoot, "presentation", "handlers", fmt.Sprintf("%s_handler.go", name)),
			"content": handlerContent,
		},
		{
			"type": "repository",
			"path": filepath.Join(projectRoot, "infrastructure", "database", "repositories", fmt.Sprintf("%s_repository.go", name)),
			"content": repositoryContent,
		},
	}

	for _, file := range fileList {
		dir := filepath.Dir(file["path"])
		content := file["content"]
		path := file["path"]

		if err := os.MkdirAll(dir, os.ModePerm); err != nil {
			log.Fatalf("Failed to create directory %s: %v", dir, err)
		}

		err := os.WriteFile(path, []byte(content), 0644)
		if err != nil {
			log.Fatalf("Failed to write file %s: %v", filepath.Base(path), err)
		} else {
			fmt.Printf("Successfully written %s\n", filepath.Base(path))
		}
	}

	return nil
}
