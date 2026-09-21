package handlers

import (
	"log"
	"net/http"

	"github.com/WillyWinata/WebDevelopment-Personal/backend/application/services"
	"github.com/WillyWinata/WebDevelopment-Personal/backend/domain/entities"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UserHandler interface {
	Create(c *gin.Context)
	Get(c *gin.Context)
	Login(c *gin.Context)
	GetAll(c *gin.Context)
	Update(c *gin.Context)
	Delete(c *gin.Context)
	GetUserFollowResponse(c *gin.Context)
}

type userHandler struct {
	service services.UserService
}

func NewUserHandler() UserHandler {
	return &userHandler{
		service: services.NewUserService(),
	}
}

func (h *userHandler) Create(c *gin.Context) {
	var registerRequest struct {
		Id             string `json:"id"`
		Name           string `json:"name"`
		StudentId      string `json:"studentId"`
		Email          string `json:"email"`
		Password       string `json:"password"`
		Role           string `json:"role"`
		Major          string `json:"major"`
		ProfilePicture string `json:"profilePicture"`
		IsActive       bool   `json:"isActive"`
	}

	if err := c.ShouldBindJSON(&registerRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := h.service.CreateNewUser(entities.User{
		Name:           registerRequest.Name,
		StudentId:      registerRequest.StudentId,
		Email:          registerRequest.Email,
		Password:       registerRequest.Password,
		Role:           registerRequest.Role,
		Major:          registerRequest.Major,
		ProfilePicture: registerRequest.ProfilePicture,
		IsActive:       registerRequest.IsActive,
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created"})
}

func (h *userHandler) Login(c *gin.Context) {
	var loginData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BindJSON(&loginData); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	User, err := h.service.Login(loginData.Email, loginData.Password)
	if err != nil {
		if err.Error() == "wrong password" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		}
		return
	}

	c.JSON(http.StatusOK, User)
}

func (h *userHandler) Get(c *gin.Context) {
	id := c.Param("id")

	user, err := h.service.GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	userResponse := &entities.UserFrontendResponse{
		Id:             user.Id.String(),
		Name:           user.Name,
		StudentId:      user.StudentId,
		Role:           user.Role,
		Major:          user.Major,
		ProfilePicture: user.ProfilePicture,
		IsActive:       user.IsActive,
		Email:          user.Email,
	}

	c.JSON(http.StatusOK, userResponse)
}

func (h *userHandler) GetAll(c *gin.Context) {
	Users, err := h.service.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong"})
		return
	}

	c.JSON(http.StatusOK, Users)
}

func (h *userHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var User entities.User

	if err := c.ShouldBindJSON(&User); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	User.Id = uuid.MustParse(id)
	if err := h.service.UpdateUser(User); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated"})
}

func (h *userHandler) Delete(c *gin.Context) {
	email := c.Param("email")

	if err := h.service.DeleteUser(email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}

func (h *userHandler) GetUserFollowResponse(c *gin.Context) {
	id := c.Param("id")

	userId, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	user, err := h.service.GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	followers, err := h.service.GetFollowersByUser(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong"})
		return
	}

	following, err := h.service.GetFollowingByUser(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong"})
		return
	}

	followingPending, err := h.service.GetFollowingPendingRequestsByUser(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong"})
		return
	}

	response := entities.UserFollowResponse{
		User:             user,
		Follower:         followers,
		Following:        following,
		FollowingPending: followingPending,
	}

	c.JSON(http.StatusOK, response)
}
