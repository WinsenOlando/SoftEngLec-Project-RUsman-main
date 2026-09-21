package handlers

import (
	"fmt"
	"net/http"

	"github.com/WillyWinata/WebDevelopment-Personal/backend/application/services"
	"github.com/WillyWinata/WebDevelopment-Personal/backend/domain/entities"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FollowRequestHandler interface {
	CreateFollowRequest(c *gin.Context)
	GetAllByUser(c *gin.Context)
	GetAllByRequestee(c *gin.Context)
	AcceptFollowRequest(c *gin.Context)
	RejectFollowRequest(c *gin.Context)
	CancelFollowRequest(c *gin.Context)
}

type followRequestHandler struct {
	service services.FollowRequestService
}

func NewFollowRequestHandler() FollowRequestHandler {
	return &followRequestHandler{
		service: services.NewFollowRequestService(),
	}
}

func (h *followRequestHandler) CreateFollowRequest(c *gin.Context) {
	fmt.Printf("Handler: Received new follow request\n")
	fmt.Printf("Handler: Received request at %s\n", c.Request.URL.Path)

	type Request struct {
		UserId      string `json:"userId"`
		RequesteeId string `json:"requesteeId"`
	}

	var followReq Request
	if err := c.ShouldBindJSON(&followReq); err != nil {
		fmt.Printf("Handler: Error binding JSON: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	fmt.Printf("Handler: Parsed request data: %+v\n", followReq)

	if followReq.UserId == "" || followReq.RequesteeId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userId and requesteeId are required"})
		return
	}

	userUUID, err := uuid.Parse(followReq.UserId)
	if err != nil {
		fmt.Printf("Handler: Error parsing userId: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userId format"})
		return
	}

	requesteeUUID, err := uuid.Parse(followReq.RequesteeId)
	if err != nil {
		fmt.Printf("Handler: Error parsing requesteeId: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid requesteeId format"})
		return
	}

	followRequest := entities.FollowRequest{
		Id:          uuid.New(),
		UserId:      userUUID,
		RequesteeId: requesteeUUID,
		Status:      "Pending",
	}

	fmt.Printf("Handler: Created follow request object: %+v\n", followRequest)

	if err := h.service.CreateNewFollowRequest(followRequest); err != nil {
		fmt.Printf("Handler: Error saving to database: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create follow request",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Follow request created successfully",
		"data":    followRequest,
	})

	fmt.Printf("Handler: Successfully created follow request: %+v\n", followRequest)
}

func (h *followRequestHandler) GetAllByUser(c *gin.Context) {
	fmt.Printf("Handler: Received request at %s\n", c.Request.URL.Path)

	type FollowRequestID struct {
		UserID string `json:"userId"`
	}

	var followRequestID FollowRequestID

	if err := c.ShouldBindJSON(&followRequestID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	userUUID, err := uuid.Parse(followRequestID.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userId format"})
		return
	}

	FollowRequests, err := h.service.GetFollowRequestsByUser(userUUID)
	if err != nil {
		c.JSON(http.StatusOK, []entities.FollowRequest{})
		return
	}

	fmt.Printf("DEBUG: FollowRequests = %+v\n", FollowRequests)

	if FollowRequests == nil {
		c.JSON(http.StatusOK, []entities.FollowRequest{})
		return
	}

	c.JSON(http.StatusOK, FollowRequests)
}

func (h *followRequestHandler) GetAllByRequestee(c *gin.Context) {
	fmt.Printf("Handler: Received request at %s\n", c.Request.URL.Path)

	type FollowRequestID struct {
		RequesteeID uuid.UUID `json:"requesteeId"`
	}

	var followRequestID FollowRequestID

	if err := c.ShouldBindJSON(&followRequestID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	FollowRequests, err := h.service.GetFollowRequestsByRequestee(followRequestID.RequesteeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong"})
		return
	}

	c.JSON(http.StatusOK, FollowRequests)
}

func (h *followRequestHandler) AcceptFollowRequest(c *gin.Context) {
	fmt.Printf("Handler: Received request at %s\n", c.Request.URL.Path)

	type FollowRequestID struct {
		FollowRequestID uuid.UUID `json:"followRequestId"`
	}

	var followRequestID FollowRequestID

	if err := c.ShouldBindJSON(&followRequestID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := h.service.AcceptFollowRequest(followRequestID.FollowRequestID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "FollowRequest updated"})
}

func (h *followRequestHandler) RejectFollowRequest(c *gin.Context) {
	fmt.Printf("Handler: Received request at %s\n", c.Request.URL.Path)

	type FollowRequestID struct {
		FollowRequestID uuid.UUID `json:"followRequestId"`
	}

	var followRequestID FollowRequestID

	if err := c.ShouldBindJSON(&followRequestID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := h.service.RejectFollowRequest(followRequestID.FollowRequestID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "FollowRequest updated"})
}

func (h *followRequestHandler) CancelFollowRequest(c *gin.Context) {
	type CancelRequest struct {
		UserId      string `json:"userId"`
		RequesteeId string `json:"requesteeId"`
	}

	var req CancelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	userUUID, err := uuid.Parse(req.UserId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userId format"})
		return
	}
	requesteeUUID, err := uuid.Parse(req.RequesteeId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid requesteeId format"})
		return
	}

	if err := h.service.CancelFollowRequest(userUUID, requesteeUUID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Follow request cancelled"})
}
