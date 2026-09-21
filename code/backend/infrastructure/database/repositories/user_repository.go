package repositories

import (
	"github.com/WillyWinata/WebDevelopment-Personal/backend/domain/entities"
	"github.com/WillyWinata/WebDevelopment-Personal/backend/infrastructure/database"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository interface {
	CreateNewUser(model entities.User) error
	FindUser(id uuid.UUID) (entities.User, error)
	FindUserByCredential(email string, password string) (entities.User, error)
	FindUserByEmail(email string) (entities.User, error)
	GetAllUsers() ([]entities.User, error)
	UpdateUser(model entities.User) error
	DeleteUser(email string) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository() UserRepository {
	return &userRepository{db: database.GetDB()}
}

func (r *userRepository) CreateNewUser(model entities.User) error {
	return r.db.Create(&model).Error
}

func (r *userRepository) FindUser(id uuid.UUID) (entities.User, error) {
	var entity entities.User

	err := r.db.First(&entity, id).Error
	return entity, err
}

func (r *userRepository) FindUserByCredential(email string, password string) (entities.User, error) {
	var entity entities.User

	err := r.db.Where(&entities.User{Email: email, Password: password}).First(&entity).Error
	return entity, err
}

func (r *userRepository) FindUserByEmail(email string) (entities.User, error) {
	var entity entities.User
	err := r.db.Where(&entities.User{Email: email}).First(&entity).Error
	return entity, err
}

func (r *userRepository) GetAllUsers() ([]entities.User, error) {
	var entities []entities.User

	err := r.db.Find(&entities).Error
	return entities, err
}

func (r *userRepository) UpdateUser(model entities.User) error {
	return r.db.Save(&model).Error
}

func (r *userRepository) DeleteUser(email string) error {
	return r.db.Where(&entities.User{Email: email}).Delete(&entities.User{}).Error
}
