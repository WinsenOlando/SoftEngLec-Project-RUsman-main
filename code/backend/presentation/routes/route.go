package routes

import (
	"fmt"

	"github.com/WillyWinata/WebDevelopment-Personal/backend/presentation/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func InitRoutes(r *gin.Engine) {
	r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
        AllowHeaders:     []string{"Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * 3600,
    }))
	
	r.Use(func(c *gin.Context) {
		fmt.Printf("Incoming request: %s %s\n", c.Request.Method, c.Request.URL.Path)
		c.Next()
	})

	userHandler := handlers.NewUserHandler()
	r.POST("/register-user", userHandler.Create)
	r.POST("/login-user", userHandler.Login)
	r.GET("/get-user/:id", userHandler.Get)
	r.GET("/get-users", userHandler.GetAll)
	r.PUT("/update-user/:id", userHandler.Update)
	r.DELETE("/delete-user/:email", userHandler.Delete)
	r.GET("/get-user-follow/:id", userHandler.GetUserFollowResponse)

	scheduleHandler := handlers.NewScheduleHandler()
	r.POST("/create-schedule", scheduleHandler.Create)
	r.GET("/get-schedule/:id", scheduleHandler.Get)
	r.POST("/get-schedules", scheduleHandler.GetAll)
	r.PUT("/update-schedule/:id", scheduleHandler.Update)
	r.DELETE("/delete-schedule/:id", scheduleHandler.Delete)
	r.GET("/get-schedules-request-by-user/:id", scheduleHandler.GetAllScheduleRequestsByUser)
	r.GET("/get-schedules-request-by-schedule/:id", scheduleHandler.GetAllScheduleRequestsBySchedule)
	r.GET("/get-schedules-accepted-by-user/:id", scheduleHandler.GetAllAcceptedSchedulesBySchedule)
	r.PATCH("/accept-schedule", scheduleHandler.AcceptSchedule)
	r.PATCH("/reject-schedule", scheduleHandler.RejectSchedule)

	followHandler := handlers.NewFollowHandler()
	r.POST("/get-follows-by-user", followHandler.GetFollowsByUser)
	r.POST("/create-follow", followHandler.Create)
	r.POST("/delete-follow", followHandler.Delete)
	r.POST("/get-followers-by-user", followHandler.GetUserFollowers)

	followRequestHandler := handlers.NewFollowRequestHandler()
	r.POST("/create-follow-request", followRequestHandler.CreateFollowRequest)
	r.POST("/get-all-requests-by-user", followRequestHandler.GetAllByUser)
	r.POST("/get-all-requests-by-requestee", followRequestHandler.GetAllByRequestee)
	r.PATCH("/accept-request", followRequestHandler.AcceptFollowRequest)
	r.PATCH("/reject-request", followRequestHandler.RejectFollowRequest)
	r.POST("/cancel-follow-request", followRequestHandler.CancelFollowRequest)
}
