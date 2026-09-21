package main

import (
	"github.com/WillyWinata/WebDevelopment-Personal/backend/infrastructure/database/migrations"
	"github.com/WillyWinata/WebDevelopment-Personal/backend/presentation/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func initialize() {
	userMigration := migrations.NewUserMigration()
	userMigration.MigrateUser()
	userMigration.SeedUser()

	scheduleMigration := migrations.NewScheduleMigration()
	scheduleMigration.MigrateSchedule()
	scheduleMigration.SeedSchedule()

	followMigration := migrations.NewFollowMigration()
	followMigration.MigrateFollow()
	followMigration.SeedFollow()

	followRequestMigration := migrations.NewFollowRequestMigration()
	followRequestMigration.MigrateFollowRequest()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	routes.InitRoutes(r)

	r.Run(":8888")
}

func main() {
	initialize()
}
