package migrations

import (
	"log"

	"github.com/WillyWinata/WebDevelopment-Personal/backend/domain/entities"
	"github.com/WillyWinata/WebDevelopment-Personal/backend/infrastructure/database"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FollowMigration interface {
	MigrateFollow()
	SeedFollow()
}

type followMigration struct {
	db *gorm.DB
}

func NewFollowMigration() FollowMigration {
	return &followMigration{
		db: database.GetDB(),
	}
}

func (c *followMigration) MigrateFollow() {
	c.db.Migrator().DropTable(&entities.Follow{})
	c.db.AutoMigrate(&entities.Follow{})
}

func (c *followMigration) SeedFollow() {
	seeds := []entities.Follow{
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("aef8c352-f6fd-4f7e-8b4a-5f8f3a7d9f4b"),
			FollowingId: uuid.MustParse("bfd239d0-802a-4629-8d5b-ec3c53511e8b"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("bfd239d0-802a-4629-8d5b-ec3c53511e8b"),
			FollowingId: uuid.MustParse("aef8c352-f6fd-4f7e-8b4a-5f8f3a7d9f4b"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("bfd239d0-802a-4629-8d5b-ec3c53511e8b"),
			FollowingId: uuid.MustParse("cff21ea9-90e2-41f6-8424-5de2c5f3bb1a"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("cff21ea9-90e2-41f6-8424-5de2c5f3bb1a"),
			FollowingId: uuid.MustParse("e0b85e2c-b07d-4a3c-9679-2ac1290a9c7e"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("e0b85e2c-b07d-4a3c-9679-2ac1290a9c7e"),
			FollowingId: uuid.MustParse("c40e1dcd-b9d4-4a0e-879b-6c462d144f56"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("c40e1dcd-b9d4-4a0e-879b-6c462d144f56"),
			FollowingId: uuid.MustParse("3d3c2a9c-c058-4ef6-8b61-e56f46fffae4"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("3d3c2a9c-c058-4ef6-8b61-e56f46fffae4"),
			FollowingId: uuid.MustParse("2e8a5a88-4d91-44fd-b384-d066f82e5893"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("2e8a5a88-4d91-44fd-b384-d066f82e5893"),
			FollowingId: uuid.MustParse("1d1e5396-c0c2-4b18-a7a7-fc7d914baf57"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("1d1e5396-c0c2-4b18-a7a7-fc7d914baf57"),
			FollowingId: uuid.MustParse("61f5fef7-3aa9-4048-97d8-6ed3dfbd35c2"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("61f5fef7-3aa9-4048-97d8-6ed3dfbd35c2"),
			FollowingId: uuid.MustParse("33a5345c-daad-40c3-9a1f-9eb7fc5b9325"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("33a5345c-daad-40c3-9a1f-9eb7fc5b9325"),
			FollowingId: uuid.MustParse("aef8c352-f6fd-4f7e-8b4a-5f8f3a7d9f4b"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("cff21ea9-90e2-41f6-8424-5de2c5f3bb1a"),
			FollowingId: uuid.MustParse("33a5345c-daad-40c3-9a1f-9eb7fc5b9325"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("aef8c352-f6fd-4f7e-8b4a-5f8f3a7d9f4b"),
			FollowingId: uuid.MustParse("e0b85e2c-b07d-4a3c-9679-2ac1290a9c7e"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("bfd239d0-802a-4629-8d5b-ec3c53511e8b"),
			FollowingId: uuid.MustParse("1d1e5396-c0c2-4b18-a7a7-fc7d914baf57"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("3d3c2a9c-c058-4ef6-8b61-e56f46fffae4"),
			FollowingId: uuid.MustParse("61f5fef7-3aa9-4048-97d8-6ed3dfbd35c2"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("e0b85e2c-b07d-4a3c-9679-2ac1290a9c7e"),
			FollowingId: uuid.MustParse("2e8a5a88-4d91-44fd-b384-d066f82e5893"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("c40e1dcd-b9d4-4a0e-879b-6c462d144f56"),
			FollowingId: uuid.MustParse("aef8c352-f6fd-4f7e-8b4a-5f8f3a7d9f4b"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("1d1e5396-c0c2-4b18-a7a7-fc7d914baf57"),
			FollowingId: uuid.MustParse("33a5345c-daad-40c3-9a1f-9eb7fc5b9325"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("2e8a5a88-4d91-44fd-b384-d066f82e5893"),
			FollowingId: uuid.MustParse("c40e1dcd-b9d4-4a0e-879b-6c462d144f56"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("33a5345c-daad-40c3-9a1f-9eb7fc5b9325"),
			FollowingId: uuid.MustParse("3d3c2a9c-c058-4ef6-8b61-e56f46fffae4"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("61f5fef7-3aa9-4048-97d8-6ed3dfbd35c2"),
			FollowingId: uuid.MustParse("cff21ea9-90e2-41f6-8424-5de2c5f3bb1a"),
		},
		{
			Id:          uuid.New(),
			UserId:      uuid.MustParse("aef8c352-f6fd-4f7e-8b4a-5f8f3a7d9f4b"),
			FollowingId: uuid.MustParse("33a5345c-daad-40c3-9a1f-9eb7fc5b9325"),
		},
	}

	for _, element := range seeds {
		result := c.db.Create(element)

		if result.Error != nil {
			log.Fatalf("Error Seeder: %s", result.Error)
		}
	}
}
