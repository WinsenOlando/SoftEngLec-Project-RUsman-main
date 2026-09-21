package migrations

import (
	"log"

	"github.com/WillyWinata/WebDevelopment-Personal/backend/domain/entities"
	"github.com/WillyWinata/WebDevelopment-Personal/backend/infrastructure/database"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserMigration interface {
	MigrateUser()
	SeedUser()
}

type userMigration struct {
	db *gorm.DB
}

func NewUserMigration() UserMigration {
	return &userMigration{
		db: database.GetDB(),
	}
}

func (c *userMigration) MigrateUser() {
	c.db.Migrator().DropTable(&entities.User{})
	c.db.AutoMigrate(&entities.User{})
}

func (c *userMigration) SeedUser() {
	seeds := []entities.User{
		{
			Id:             uuid.MustParse("33a5345c-daad-40c3-9a1f-9eb7fc5b9325"),
			Name:           "Willy Winata",
			Email:          "willy@binus.ac.id",
			Password:       "Willy@123",
			Role:           "Admin",
			Major:          "Computer Science",
			StudentId:      "250384726",
			ProfilePicture: "https://lneeoekvbhpekkzmvlwz.supabase.co/storage/v1/object/public/medias//MountainWallpaper.jpg",
			IsActive:       true,
		},
		{
			Id:             uuid.MustParse("aef8c352-f6fd-4f7e-8b4a-5f8f3a7d9f4b"),
			Name:           "Alice Santoso",
			Email:          "alice.santoso@binus.ac.id",
			Password:       "Alice@123",
			Role:           "User",
			Major:          "Information Systems",
			StudentId:      "241028395",
			ProfilePicture: "https://lneeoekvbhpekkzmvlwz.supabase.co/storage/v1/object/public/medias//MountainWallpaper.jpg",
			IsActive:       true,
		},
		{
			Id:             uuid.MustParse("bfd239d0-802a-4629-8d5b-ec3c53511e8b"),
			Name:           "Brandon Lie",
			Email:          "brandon.lie@binus.ac.id",
			Password:       "Brandon!456",
			Role:           "User",
			Major:          "Software Engineering",
			StudentId:      "270459182",
			ProfilePicture: "https://lneeoekvbhpekkzmvlwz.supabase.co/storage/v1/object/public/medias//MountainWallpaper.jpg",
			IsActive:       true,
		},
		{
			Id:             uuid.MustParse("cff21ea9-90e2-41f6-8424-5de2c5f3bb1a"),
			Name:           "Cindy Halim",
			Email:          "cindy.halim@binus.ac.id",
			Password:       "Cindy#789",
			Role:           "User",
			Major:          "Cyber Security",
			StudentId:      "261843209",
			ProfilePicture: "https://lneeoekvbhpekkzmvlwz.supabase.co/storage/v1/object/public/medias//MountainWallpaper.jpg",
			IsActive:       true,
		},
		{
			Id:             uuid.MustParse("e0b85e2c-b07d-4a3c-9679-2ac1290a9c7e"),
			Name:           "Daniel Wijaya",
			Email:          "daniel.w@binus.ac.id",
			Password:       "Daniel@456",
			Role:           "User",
			Major:          "Artificial Intelligence",
			StudentId:      "284728310",
			ProfilePicture: "https://lneeoekvbhpekkzmvlwz.supabase.co/storage/v1/object/public/medias//MountainWallpaper.jpg",
			IsActive:       true,
		},
		{
			Id:             uuid.MustParse("c40e1dcd-b9d4-4a0e-879b-6c462d144f56"),
			Name:           "Elaine Gunawan",
			Email:          "elaine.gunawan@binus.ac.id",
			Password:       "Elaine@321",
			Role:           "User",
			Major:          "Data Science",
			StudentId:      "293847120",
			ProfilePicture: "https://lneeoekvbhpekkzmvlwz.supabase.co/storage/v1/object/public/medias//MountainWallpaper.jpg",
			IsActive:       true,
		},
		{
			Id:             uuid.MustParse("3d3c2a9c-c058-4ef6-8b61-e56f46fffae4"),
			Name:           "Felix Hartono",
			Email:          "felix.hartono@binus.ac.id",
			Password:       "Felix@777",
			Role:           "User",
			Major:          "Game Development",
			StudentId:      "265901837",
			ProfilePicture: "https://lneeoekvbhpekkzmvlwz.supabase.co/storage/v1/object/public/medias//MountainWallpaper.jpg",
			IsActive:       true,
		},
		{
			Id:             uuid.MustParse("2e8a5a88-4d91-44fd-b384-d066f82e5893"),
			Name:           "Grace Susilo",
			Email:          "grace.susilo@binus.ac.id",
			Password:       "Grace$123",
			Role:           "User",
			Major:          "Business Information Technology",
			StudentId:      "258273940",
			ProfilePicture: "https://lneeoekvbhpekkzmvlwz.supabase.co/storage/v1/object/public/medias//MountainWallpaper.jpg",
			IsActive:       true,
		},
		{
			Id:             uuid.MustParse("1d1e5396-c0c2-4b18-a7a7-fc7d914baf57"),
			Name:           "Hendrik Tanu",
			Email:          "hendrik.tanu@binus.ac.id",
			Password:       "Hendrik@555",
			Role:           "User",
			Major:          "Information Technology",
			StudentId:      "289374561",
			ProfilePicture: "https://lneeoekvbhpekkzmvlwz.supabase.co/storage/v1/object/public/medias//MountainWallpaper.jpg",
			IsActive:       true,
		},
		{
			Id:             uuid.MustParse("61f5fef7-3aa9-4048-97d8-6ed3dfbd35c2"),
			Name:           "Irene Kusuma",
			Email:          "irene.kusuma@binus.ac.id",
			Password:       "Irene!888",
			Role:           "User",
			Major:          "Cloud Computing",
			StudentId:      "243958271",
			ProfilePicture: "https://lneeoekvbhpekkzmvlwz.supabase.co/storage/v1/object/public/medias//MountainWallpaper.jpg",
			IsActive:       true,
		},
	}

	for _, element := range seeds {
		result := c.db.Create(element)

		if result.Error != nil {
			log.Fatalf("Error Seeder: %s", result.Error)
		}
	}
}
