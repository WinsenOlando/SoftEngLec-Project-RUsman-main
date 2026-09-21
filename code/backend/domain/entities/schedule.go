package entities

import (
	"time"

	"github.com/google/uuid"
)

type Schedule struct {
	Id          uuid.UUID `gorm:"primaryKey" json:"id"`
	UserId      uuid.UUID `gorm:"not null" json:"userId"`
	StartTime   time.Time `gorm:"not null" json:"startTime"`
	EndTime     time.Time `gorm:"not null" json:"endTime"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `gorm:"not null" json:"description"`
	Location    string    `gorm:"not null" json:"location"`
	Category    string    `gorm:"not null" json:"category"`
	// RecurringUntil *time.Time `json:"recurringUntil"` // opsional, nullable
	// Color       string    `json:"color"`
}

type ScheduleParticipant struct {
	Id         uuid.UUID `gorm:"primaryKey" json:"id"`
	ScheduleId uuid.UUID `gorm:"not null" json:"scheduleId"`
	UserId     uuid.UUID `gorm:"not null" json:"userId"`
	Status     string    `gorm:"not null;default:Pending" json:"status"`
}

type ScheduleParticipantResponse struct {
	Schedule Schedule `json:"schedule"`
	User     User     `json:"user"`
	Status   string   `json:"status"`
}
