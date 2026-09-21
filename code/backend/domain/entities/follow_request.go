package entities

import "github.com/google/uuid"

type FollowRequest struct {
	Id          uuid.UUID `gorm:"primaryKey" json:"id"`
	UserId      uuid.UUID `gorm:"not null" json:"userId"`
	RequesteeId uuid.UUID `gorm:"not null" json:"requesteeId"`
	Status      string    `gorm:"not null;default:Pending" json:"status"`
}
