package services

import (
	"github.com/WillyWinata/WebDevelopment-Personal/backend/domain/entities"
	"github.com/WillyWinata/WebDevelopment-Personal/backend/infrastructure/database/repositories"
	"github.com/google/uuid"
)

type FollowService interface {
	Follow(Follow entities.Follow) error
	GetFollowsByUser(userId uuid.UUID) ([]entities.Follow, error)
	Unfollow(userId uuid.UUID, followingId uuid.UUID) error
	GetFollowersByUser(userId uuid.UUID) ([]entities.Follow, error)
}

type followService struct {
	repo repositories.FollowRepository
}

func NewFollowService() FollowService {
	return &followService{
		repo: repositories.NewFollowRepository(),
	}
}

func (s *followService) Follow(Follow entities.Follow) error {
	err := s.repo.CreateNewFollow(Follow)
	if err != nil {
		return err
	}

	return nil
}

func (s *followService) GetFollowsByUser(userId uuid.UUID) ([]entities.Follow, error) {
	follow, err := s.repo.GetFollowByUser(userId)
	if err != nil {
		return nil, err
	}

	return follow, nil
}

func (s *followService) Unfollow(userId uuid.UUID, followingId uuid.UUID) error {
	follow, err := s.repo.GetFollowByUserAndFollower(userId, followingId)
	if err != nil {
		return err
	}
	return s.repo.DeleteFollow(follow)
}

func (s *followService) GetFollowersByUser(userId uuid.UUID) ([]entities.Follow, error) {
	followers, err := s.repo.GetFollowersByUser(userId)
	if err != nil {
		return nil, err
	}
	return followers, nil
}
