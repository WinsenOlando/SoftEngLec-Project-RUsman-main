package database

import (
	"fmt"
	"os"
	"sync"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var (
	db   *gorm.DB
	once sync.Once
	err  error
)

func init() {
	if err := godotenv.Load("config/.env"); err != nil {
		fmt.Printf("Warning: Error loading .env file: %v\n", err)
	}
}

func GetDB() *gorm.DB {
	once.Do(func() { // Mengambil environment variables dengan nilai default
		host := getEnvWithDefault("DB_HOST", "localhost")
		port := getEnvWithDefault("DB_PORT", "3306")
		user := getEnvWithDefault("DB_USER", "root")
		password := getEnvWithDefault("DB_PASSWORD", "")
		name := getEnvWithDefault("DB_NAME", "calendar")

		dsn := user + ":" + password + "@tcp(" + host + ":" + port + ")/" + name + "?charset=utf8mb4&parseTime=True&loc=Local"
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err != nil {
			panic("failed to connect to database: " + err.Error())
		}
	})

	return db
}

// Get environment variable with default value if not found
func getEnvWithDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
