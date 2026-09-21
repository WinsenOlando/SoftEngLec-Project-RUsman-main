package handlers

import (
	"fmt"
	"net/http"

	"github.com/WillyWinata/WebDevelopment-Personal/backend/application/services"
	"github.com/WillyWinata/WebDevelopment-Personal/backend/domain/entities"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FollowHandler interface {
	Follow(c *gin.Context)
	GetFollowsByUser(c *gin.Context)
	Create(c *gin.Context)
	Delete(c *gin.Context)
	GetUserFollowers(c *gin.Context)
}

type followHandler struct {
	service services.FollowService
}

func NewFollowHandler() FollowHandler {
	return &followHandler{
		service: services.NewFollowService(),
	}
}

func (h *followHandler) Follow(c *gin.Context) {
	var Follow entities.Follow

	if err := c.ShouldBindJSON(&Follow); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := h.service.Follow(Follow); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Follow created"})
}

func (h *followHandler) GetFollowsByUser(c *gin.Context) {
	type FollowID struct {
		UserId uuid.UUID `json:"userId"`
	}

	var userId FollowID

	if err := c.ShouldBindJSON(&userId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	follows, err := h.service.GetFollowsByUser(userId.UserId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong"})
		return
	}

	c.JSON(http.StatusOK, follows)
}

func (h *followHandler) Create(c *gin.Context) {
	var follow entities.Follow

	if err := c.ShouldBindJSON(&follow); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if follow.Id == uuid.Nil {
		follow.Id = uuid.New()
	}

	if err := h.service.Follow(follow); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Follow created"})
}

func (h *followHandler) Delete(c *gin.Context) {
	type DeleteFollowRequest struct {
		UserId      string `json:"userId"`
		FollowingId string `json:"followingId"`
	}

	var req DeleteFollowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format: " + err.Error()})
		return
	}

	fmt.Printf("Received unfollow request: %+v\n", req)

	userUUID, err := uuid.Parse(req.UserId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userId format: " + err.Error()})
		return
	}
	followingUUID, err := uuid.Parse(req.FollowingId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid followingId format: " + err.Error()})
		return
	}

	fmt.Printf("Attempting to unfollow: userId=%s followingId=%s\n", userUUID, followingUUID)

	err = h.service.Unfollow(userUUID, followingUUID)
	if err != nil {
		fmt.Printf("Error during unfollow: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("Successfully unfollowed: userId=%s followingId=%s\n", userUUID, followingUUID)
	c.JSON(http.StatusOK, gin.H{"message": "Unfollow success"})
}

func (h *followHandler) GetUserFollowers(c *gin.Context) {
	type GetUserFollowersRequest struct {
		UserId string `json:"userId"`
	}

	var req GetUserFollowersRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	userId, err := uuid.Parse(req.UserId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userId format"})
		return
	}
	followers, err := h.service.GetFollowersByUser(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"followers": followers})
}
