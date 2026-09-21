package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/WillyWinata/WebDevelopment-Personal/backend/application/services"
	"github.com/WillyWinata/WebDevelopment-Personal/backend/domain/entities"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

/*
   TODO: Copy the code below to route.go

   scheduleHandler := handlers.NewScheduleHandler()
   r.POST("/create-schedule", scheduleHandler.Create)
   r.GET("/get-schedule/:id", scheduleHandler.Get)
   r.GET("/get-schedules", scheduleHandler.GetAll)
   r.PUT("/update-schedule/:id", scheduleHandler.Update)
   r.DELETE("/delete-schedule/:id", scheduleHandler.Delete)
*/

type ScheduleHandler interface {
	Create(c *gin.Context)
	Get(c *gin.Context)
	GetAll(c *gin.Context)
	Update(c *gin.Context)
	Delete(c *gin.Context)
	AcceptSchedule(c *gin.Context)
	RejectSchedule(c *gin.Context)
	GetAllScheduleRequestsByUser(c *gin.Context)
	GetAllScheduleRequestsBySchedule(c *gin.Context)
	GetAllAcceptedSchedulesBySchedule(c *gin.Context)
}

type scheduleHandler struct {
	service services.ScheduleService
}

func NewScheduleHandler() ScheduleHandler {
	return &scheduleHandler{
		service: services.NewScheduleService(),
	}
}

func (h *scheduleHandler) Create(c *gin.Context) {
	type ScheduleRequest struct {
		UserId         string          `json:"userId"`
		StartTime      string          `json:"startTime"`
		EndTime        string          `json:"endTime"`
		Title          string          `json:"title"`
		Description    string          `json:"description"`
		Location       string          `json:"location"`
		Category       string          `json:"category"`
		Participants   []entities.User `json:"participants"`
		RecurringUntil string          `json:"recurringUntil"`
	}

	var scheduleRequest ScheduleRequest

	if err := c.ShouldBindJSON(&scheduleRequest); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	startTime, err := time.Parse("2006-01-02T15:04:05", scheduleRequest.StartTime)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start time"})
		return
	}

	endTime, err := time.Parse("2006-01-02T15:04:05", scheduleRequest.EndTime)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end time"})
		return
	}

	if scheduleRequest.RecurringUntil != "" {
		recurringUntil, err := time.Parse("2006-01-02", scheduleRequest.RecurringUntil)
		if err != nil {
			log.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recurring until time"})
			return
		}

		if startTime.After(recurringUntil) {
			log.Println("Start time must be before recurring until date")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Start time must be before recurring until date"})
			return
		}

		delta := endTime.Sub(startTime)

		schedules := make([]entities.Schedule, 0)

		for currTime := startTime; !currTime.After(recurringUntil); currTime = currTime.AddDate(0, 0, 7) {
			schedule := entities.Schedule{
				Id:          uuid.New(),
				UserId:      uuid.MustParse(scheduleRequest.UserId),
				StartTime:   currTime,
				EndTime:     currTime.Add(delta),
				Title:       scheduleRequest.Title,
				Description: scheduleRequest.Description,
				Location:    scheduleRequest.Location,
				Category:    scheduleRequest.Category,
			}

			if len(scheduleRequest.Participants) > 0 {
				schedulesParticipants := make([]entities.ScheduleParticipant, 0)

				for _, participant := range scheduleRequest.Participants {
					scheduleParticipant := entities.ScheduleParticipant{
						Id:         uuid.New(),
						ScheduleId: schedule.Id,
						UserId:     participant.Id,
					}

					schedulesParticipants = append(schedulesParticipants, scheduleParticipant)
				}

				if err := h.service.BatchAddParticipantsToSchedule(schedulesParticipants); err != nil {
					log.Println(err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
			}

			schedules = append(schedules, schedule)

		}

		if err := h.service.BatchCreateNewSchedule(schedules); err != nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Recurring schedules created"})
		return
	}

	schedule := entities.Schedule{
		Id:          uuid.New(),
		UserId:      uuid.MustParse(scheduleRequest.UserId),
		StartTime:   startTime,
		EndTime:     endTime,
		Title:       scheduleRequest.Title,
		Description: scheduleRequest.Description,
		Location:    scheduleRequest.Location,
		Category:    scheduleRequest.Category,
	}

	if err := h.service.CreateNewSchedule(schedule); err != nil {
		log.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(scheduleRequest.Participants) > 0 {
		scheduleParticipants := make([]entities.ScheduleParticipant, 0)

		var scheduleParticipant entities.ScheduleParticipant

		for _, participant := range scheduleRequest.Participants {
			scheduleParticipant = entities.ScheduleParticipant{
				Id:         uuid.New(),
				ScheduleId: schedule.Id,
				UserId:     participant.Id,
			}

			scheduleParticipants = append(scheduleParticipants, scheduleParticipant)
		}

		if err := h.service.BatchAddParticipantsToSchedule(scheduleParticipants); err != nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Schedule created"})
}

func (h *scheduleHandler) Get(c *gin.Context) {
	id, _ := uuid.Parse(c.Param("id"))

	Schedule, err := h.service.GetScheduleByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	}

	c.JSON(http.StatusOK, Schedule)
}

func (h *scheduleHandler) GetAll(c *gin.Context) {
	type UserID struct {
		UserID string `json:"userID"`
	}

	var userID UserID

	if err := c.ShouldBindJSON(&userID); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	Schedules, err := h.service.GetAllSchedules(userID.UserID)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong"})
		return
	}

	c.JSON(http.StatusOK, Schedules)
}

func (h *scheduleHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var Schedule entities.Schedule

	if err := c.ShouldBindJSON(&Schedule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	Schedule.Id = uuid.MustParse(id)
	if err := h.service.UpdateSchedule(Schedule); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Schedule updated"})
}

func (h *scheduleHandler) Delete(c *gin.Context) {
	id, _ := uuid.Parse(c.Param("id"))

	if err := h.service.DeleteSchedule(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Schedule deleted"})
}

func (h *scheduleHandler) AcceptSchedule(c *gin.Context) {
	type AcceptScheduleRequest struct {
		Id uuid.UUID `json:"id"`
	}

	var scheduleRequest AcceptScheduleRequest

	if err := c.ShouldBindJSON(&scheduleRequest); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := h.service.AcceptSchedule(scheduleRequest.Id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Schedule accepted"})
}

func (h *scheduleHandler) RejectSchedule(c *gin.Context) {
	type RejectScheduleRequest struct {
		Id uuid.UUID `json:"id"`
	}

	var scheduleRequest RejectScheduleRequest

	if err := c.ShouldBindJSON(&scheduleRequest); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := h.service.RejectSchedule(scheduleRequest.Id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Schedule rejected"})
}

func (h *scheduleHandler) GetAllScheduleRequestsByUser(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	participants, err := h.service.GetAllScheduleRequestsByUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, participants)
}

func (h *scheduleHandler) GetAllScheduleRequestsBySchedule(c *gin.Context) {
	scheduleID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule ID"})
		return
	}

	participants, err := h.service.GetAllScheduleRequestsBySchedule(scheduleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, participants)
}

func (h *scheduleHandler) GetAllAcceptedSchedulesBySchedule(c *gin.Context) {
	scheduleID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule ID"})
		return
	}

	participants, err := h.service.GetAllAcceptedSchedulesBySchedule(scheduleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, participants)
}
