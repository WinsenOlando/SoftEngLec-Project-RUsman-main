package entities

import "github.com/google/uuid"

type Follow struct {
	Id          uuid.UUID `gorm:"primaryKey" json:"id"`
	UserId      uuid.UUID `gorm:"not null" json:"userId"`
	FollowingId uuid.UUID `gorm:"not null" json:"followingId"`
}
