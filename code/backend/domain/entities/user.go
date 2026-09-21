package entities

import "github.com/google/uuid"

type User struct {
	Id             uuid.UUID `gorm:"primaryKey" json:"id"`
	Name           string    `gorm:"not null" json:"name"`
	StudentId      string    `gorm:"not null" json:"studentId"`
	Email          string    `gorm:"not null" json:"email"`
	Password       string    `gorm:"not null" json:"password"`
	Role           string    `gorm:"not null" json:"role"`
	Major          string    `gorm:"not null" json:"major"`
	ProfilePicture string    `gorm:"not null" json:"profilePicture"`
	IsActive       bool      `gorm:"not null" json:"isActive"`
}

type UserFollowResponse struct {
	User             User   `json:"user"`
	Follower         []User `json:"follower"`
	Following        []User `json:"following"`
	FollowingPending []User `json:"followingPending"`
}

type UserFrontendResponse struct {
	Id             string `json:"id"`
	Name           string `json:"name"`
	Email          string `json:"email"`
	StudentId      string `json:"studentId"`
	Role           string `json:"role"`
	Major          string `json:"major"`
	ProfilePicture string `json:"profilePicture"`
	IsActive       bool   `json:"isActive"`
}
