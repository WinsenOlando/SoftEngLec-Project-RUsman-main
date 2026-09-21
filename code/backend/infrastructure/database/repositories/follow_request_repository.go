package repositories

import (
	"fmt"

	"github.com/WillyWinata/WebDevelopment-Personal/backend/domain/entities"
	"github.com/WillyWinata/WebDevelopment-Personal/backend/infrastructure/database"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FollowRequestRepository interface {
	CreateNewFollowRequest(model entities.FollowRequest) error
	GetFollowRequestsByUser(userId uuid.UUID) ([]entities.FollowRequest, error)
	GetFollowRequestsByRequestee(requesteeId uuid.UUID) ([]entities.FollowRequest, error)
	AcceptFollowRequest(requestId uuid.UUID) error
	RejectFollowRequest(requestId uuid.UUID) error
	GetFollowByID(requestId uuid.UUID) (entities.FollowRequest, error)
	GetFollowingPendingRequestsByUser(userId uuid.UUID) ([]entities.FollowRequest, error)
	CancelFollowRequest(userId uuid.UUID, requesteeId uuid.UUID) error
}

type followRequestRepository struct {
	db *gorm.DB
}

func NewFollowRequestRepository() FollowRequestRepository {
	return &followRequestRepository{db: database.GetDB()}
}

func (r *followRequestRepository) CreateNewFollowRequest(model entities.FollowRequest) error {

	sqlDB, err := r.db.DB()
	if err != nil {
		return fmt.Errorf("failed to get database connection: %v", err)
	}
	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %v", err)
	}

	fmt.Printf("Repository: Starting transaction for follow request: %+v\n", model)

	tx := r.db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("failed to begin transaction: %v", tx.Error)
	}

	if model.Status == "" {
		model.Status = "Pending"
	}

	result := tx.Create(&model)
	if result.Error != nil {
		tx.Rollback()
		fmt.Printf("Repository: Error creating follow request: %v\n", result.Error)
		return fmt.Errorf("failed to create follow request: %v", result.Error)
	}
	if result.RowsAffected == 0 {
		tx.Rollback()
		return fmt.Errorf("no rows affected when creating follow request")
	}

	var saved entities.FollowRequest
	if err := tx.Where("id = ?", model.Id).First(&saved).Error; err != nil {
		tx.Rollback()
		fmt.Printf("Repository: Error verifying saved data: %v\n", err)
		return fmt.Errorf("failed to verify saved data: %v", err)
	}

	if saved.Id != model.Id || saved.UserId != model.UserId || saved.RequesteeId != model.RequesteeId {
		tx.Rollback()
		return fmt.Errorf("saved data does not match input data")
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		fmt.Printf("Repository: Error committing transaction: %v\n", err)
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	fmt.Printf("Repository: Successfully created and verified follow request: %+v\n", saved)
	return nil
}

func (r *followRequestRepository) GetFollowRequestsByUser(userId uuid.UUID) ([]entities.FollowRequest, error) {
	var requests []entities.FollowRequest

	err := r.db.Where("user_id = ?", userId).Find(&requests).Error
	return requests, err
}

func (r *followRequestRepository) GetFollowRequestsByRequestee(requesteeId uuid.UUID) ([]entities.FollowRequest, error) {
	var entities []entities.FollowRequest

	err := r.db.Where("requestee_id = ?", requesteeId).Find(&entities).Error
	return entities, err
}

func (r *followRequestRepository) AcceptFollowRequest(requestId uuid.UUID) error {
	return r.db.Model(&entities.FollowRequest{}).Where("request_id = ?", requestId).Update("status", "Accepted").Error
}

func (r *followRequestRepository) RejectFollowRequest(requestId uuid.UUID) error {
	return r.db.Model(&entities.FollowRequest{}).Where("request_id = ?", requestId).Update("status", "Rejected").Error
}

func (r *followRequestRepository) GetFollowByID(requestId uuid.UUID) (entities.FollowRequest, error) {
	var entity entities.FollowRequest

	err := r.db.First(&entity, requestId).Error

	return entity, err
}

func (r *followRequestRepository) GetFollowingPendingRequestsByUser(userId uuid.UUID) ([]entities.FollowRequest, error) {
	var entities []entities.FollowRequest

	err := r.db.Where("requestee_id = ? AND status = ?", userId, "Pending").Find(&entities).Error
	return entities, err
}

func (r *followRequestRepository) CancelFollowRequest(userId uuid.UUID, requesteeId uuid.UUID) error {
	return r.db.Where("user_id = ? AND requestee_id = ? AND status = ?", userId, requesteeId, "Pending").Delete(&entities.FollowRequest{}).Error
}
