package repositories

import (
	"github.com/WillyWinata/WebDevelopment-Personal/backend/domain/entities"
	"github.com/WillyWinata/WebDevelopment-Personal/backend/infrastructure/database"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ScheduleRepository interface {
	CreateNewSchedule(model entities.Schedule) error
	BatchCreateNewSchedule(models []entities.Schedule) error
	BatchAddParticipantsToSchedule(participants []entities.ScheduleParticipant) error
	FindSchedule(id uuid.UUID) (entities.Schedule, error)
	GetAllSchedules(userID string) ([]entities.Schedule, error)
	UpdateSchedule(model entities.Schedule) error
	DeleteSchedule(id uuid.UUID) error
	AcceptSchedule(id uuid.UUID) error
	RejectSchedule(id uuid.UUID) error
	GetAllScheduleRequestsByUser(userID uuid.UUID) ([]entities.ScheduleParticipant, error)
	GetAllScheduleRequestsBySchedule(scheduleID uuid.UUID) ([]entities.ScheduleParticipant, error)
	GetAllAcceptedSchedulesBySchedule(scheduleID uuid.UUID) ([]entities.ScheduleParticipant, error)
}

type scheduleRepository struct {
	db *gorm.DB
}

func NewScheduleRepository() ScheduleRepository {
	return &scheduleRepository{db: database.GetDB()}
}

func (r *scheduleRepository) BatchCreateNewSchedule(models []entities.Schedule) error {
	return r.db.Create(&models).Error
}

func (r *scheduleRepository) CreateNewSchedule(model entities.Schedule) error {
	return r.db.Create(&model).Error
}

func (r *scheduleRepository) BatchAddParticipantsToSchedule(participants []entities.ScheduleParticipant) error {
	return r.db.Create(&participants).Error
}

func (r *scheduleRepository) FindSchedule(id uuid.UUID) (entities.Schedule, error) {
	var entity entities.Schedule

	err := r.db.First(&entity, id).Error
	return entity, err
}

func (r *scheduleRepository) GetAllSchedules(userID string) ([]entities.Schedule, error) {
	var entities []entities.Schedule

	err := r.db.Where("user_id = ?", userID).Find(&entities).Error
	return entities, err
}

func (r *scheduleRepository) UpdateSchedule(model entities.Schedule) error {
	return r.db.Save(&model).Error
}

func (r *scheduleRepository) DeleteSchedule(id uuid.UUID) error {
	return r.db.Delete(&entities.Schedule{}, id).Error
}

func (r *scheduleRepository) AcceptSchedule(id uuid.UUID) error {
	return r.db.Model(&entities.ScheduleParticipant{}).
		Where("id = ?", id).
		Update("status", "Accepted").Error
}

func (r *scheduleRepository) RejectSchedule(id uuid.UUID) error {
	return r.db.Model(&entities.ScheduleParticipant{}).
		Where("id", id).
		Update("status", "Rejected").Error
}

func (r *scheduleRepository) GetAllScheduleRequestsByUser(userID uuid.UUID) ([]entities.ScheduleParticipant, error) {
	var participants []entities.ScheduleParticipant

	err := r.db.Where("user_id = ?", userID).Find(&participants).Error
	return participants, err
}

func (r *scheduleRepository) GetAllScheduleRequestsBySchedule(scheduleID uuid.UUID) ([]entities.ScheduleParticipant, error) {
	var participants []entities.ScheduleParticipant

	err := r.db.Where("schedule_id = ?", scheduleID).Find(&participants).Error
	return participants, err
}

func (r *scheduleRepository) GetAllAcceptedSchedulesBySchedule(scheduleID uuid.UUID) ([]entities.ScheduleParticipant, error) {
	var participants []entities.ScheduleParticipant

	err := r.db.Where("schedule_id = ? AND status = ?", scheduleID, "Accepted").Find(&participants).Error
	return participants, err
}
