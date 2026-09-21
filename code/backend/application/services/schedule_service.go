package services

import (
	"github.com/WillyWinata/WebDevelopment-Personal/backend/domain/entities"
	"github.com/WillyWinata/WebDevelopment-Personal/backend/infrastructure/database/repositories"
	"github.com/google/uuid"
)

type ScheduleService interface {
	CreateNewSchedule(Schedule entities.Schedule) error
	BatchCreateNewSchedule(Schedules []entities.Schedule) error
	BatchAddParticipantsToSchedule(participants []entities.ScheduleParticipant) error
	GetScheduleByID(id uuid.UUID) (entities.Schedule, error)
	GetAllSchedules(userID string) ([]entities.Schedule, error)
	UpdateSchedule(Schedule entities.Schedule) error
	DeleteSchedule(id uuid.UUID) error
	AcceptSchedule(id uuid.UUID) error
	RejectSchedule(id uuid.UUID) error
	GetAllScheduleRequestsByUser(userID uuid.UUID) ([]entities.ScheduleParticipantResponse, error)
	GetAllScheduleRequestsBySchedule(scheduleID uuid.UUID) ([]entities.ScheduleParticipantResponse, error)
	GetAllAcceptedSchedulesBySchedule(scheduleID uuid.UUID) ([]entities.ScheduleParticipantResponse, error)
}

type scheduleService struct {
	repo     repositories.ScheduleRepository
	userRepo repositories.UserRepository
}

func NewScheduleService() ScheduleService {
	return &scheduleService{
		repo:     repositories.NewScheduleRepository(),
		userRepo: repositories.NewUserRepository(),
	}
}

func (s *scheduleService) CreateNewSchedule(Schedule entities.Schedule) error {
	err := s.repo.CreateNewSchedule(Schedule)
	if err != nil {
		return err
	}

	return nil
}

func (s *scheduleService) BatchCreateNewSchedule(Schedules []entities.Schedule) error {
	err := s.repo.BatchCreateNewSchedule(Schedules)
	if err != nil {
		return err
	}

	return nil
}

func (s *scheduleService) BatchAddParticipantsToSchedule(participants []entities.ScheduleParticipant) error {
	err := s.repo.BatchAddParticipantsToSchedule(participants)
	if err != nil {
		return err
	}

	return nil
}

func (s *scheduleService) GetScheduleByID(id uuid.UUID) (entities.Schedule, error) {
	schedule, err := s.repo.FindSchedule(id)
	if err != nil {
		return entities.Schedule{}, err
	}

	return schedule, nil
}

func (s *scheduleService) GetAllSchedules(userID string) ([]entities.Schedule, error) {
	schedules, err := s.repo.GetAllSchedules(userID)
	if err != nil {
		return nil, err
	}

	return schedules, nil
}

func (s *scheduleService) UpdateSchedule(Schedule entities.Schedule) error {
	err := s.repo.UpdateSchedule(Schedule)
	if err != nil {
		return err
	}

	return nil
}

func (s *scheduleService) DeleteSchedule(id uuid.UUID) error {
	err := s.repo.DeleteSchedule(id)
	if err != nil {
		return err
	}

	return nil
}

func (s *scheduleService) AcceptSchedule(id uuid.UUID) error {
	err := s.repo.AcceptSchedule(id)
	if err != nil {
		return err
	}

	return nil
}

func (s *scheduleService) RejectSchedule(id uuid.UUID) error {
	err := s.repo.RejectSchedule(id)
	if err != nil {
		return err
	}

	return nil
}

func (s *scheduleService) GetAllScheduleRequestsByUser(userID uuid.UUID) ([]entities.ScheduleParticipantResponse, error) {
	participants, err := s.repo.GetAllScheduleRequestsByUser(userID)
	if err != nil {
		return nil, err
	}

	responses := make([]entities.ScheduleParticipantResponse, len(participants))

	for _, participant := range participants {
		schedule, err := s.repo.FindSchedule(participant.ScheduleId)
		if err != nil {
			continue
		}
		user, err := s.userRepo.FindUser(participant.UserId)
		if err != nil {
			continue
		}

		response := entities.ScheduleParticipantResponse{
			Schedule: schedule,
			User:     user,
			Status:   participant.Status,
		}

		responses = append(responses, response)
	}

	return responses, nil
}

func (s *scheduleService) GetAllScheduleRequestsBySchedule(scheduleID uuid.UUID) ([]entities.ScheduleParticipantResponse, error) {
	participants, err := s.repo.GetAllScheduleRequestsBySchedule(scheduleID)
	if err != nil {
		return nil, err
	}

	responses := make([]entities.ScheduleParticipantResponse, len(participants))

	for _, participant := range participants {
		schedule, err := s.repo.FindSchedule(participant.ScheduleId)
		if err != nil {
			continue
		}
		user, err := s.userRepo.FindUser(participant.UserId)
		if err != nil {
			continue
		}

		response := entities.ScheduleParticipantResponse{
			Schedule: schedule,
			User:     user,
			Status:   participant.Status,
		}

		responses = append(responses, response)
	}

	return responses, nil
}

func (s *scheduleService) GetAllAcceptedSchedulesBySchedule(scheduleID uuid.UUID) ([]entities.ScheduleParticipantResponse, error) {
	participants, err := s.repo.GetAllAcceptedSchedulesBySchedule(scheduleID)
	if err != nil {
		return nil, err
	}

	responses := make([]entities.ScheduleParticipantResponse, len(participants))

	for _, participant := range participants {
		schedule, err := s.repo.FindSchedule(participant.ScheduleId)
		if err != nil {
			continue
		}
		user, err := s.userRepo.FindUser(participant.UserId)
		if err != nil {
			continue
		}

		response := entities.ScheduleParticipantResponse{
			Schedule: schedule,
			User:     user,
			Status:   participant.Status,
		}

		responses = append(responses, response)
	}

	return responses, nil
}

func ValidateSchedule(Schedule entities.Schedule) bool {
	// Fill this part with attributes and its validations

	return true
}
