package migrations

import (
	"github.com/WillyWinata/WebDevelopment-Personal/backend/domain/entities"
	"github.com/WillyWinata/WebDevelopment-Personal/backend/infrastructure/database"
	"gorm.io/gorm"
)

type FollowRequestMigration interface {
	MigrateFollowRequest()
	SeedFollowRequest()
}

type followRequestMigration struct {
	db *gorm.DB
}

func NewFollowRequestMigration() FollowRequestMigration {
	return &followRequestMigration{
		db: database.GetDB(),
	}
}

func (c *followRequestMigration) MigrateFollowRequest() {
	c.db.Migrator().DropTable(&entities.FollowRequest{})
	c.db.AutoMigrate(&entities.FollowRequest{})
}

func (c *followRequestMigration) SeedFollowRequest() {
	// seeds := []entities.FollowRequest{
	// 	{Id: 1},
	// }

	// for _, element := range seeds {
	// 	result := c.db.Create(element)

	// 	if result.Error != nil {
	// 		log.Fatalf("Error Seeder: %s", result.Error)
	// 	}
	// }
}
