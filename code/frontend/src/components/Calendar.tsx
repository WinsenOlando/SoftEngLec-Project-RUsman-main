"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EventForm from "./EventForm";

// Sample events data
const EVENTS = [
  {
    id: 1,
    title: "Team Meeting",
    date: "2025-04-29",
    time: "10:00 AM",
    category: "work",
    participants: [
      {
        id: 1,
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      {
        id: 3,
        name: "Emily Wong",
        avatar: "/placeholder.svg?height=24&width=24",
      },
    ],
  },
  {
    id: 2,
    title: "Study Group",
    date: "2025-04-29",
    time: "12:30 PM",
    category: "study",
    participants: [
      {
        id: 2,
        name: "Michael Chen",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      {
        id: 5,
        name: "Anna Kim",
        avatar: "/placeholder.svg?height=24&width=24",
      },
    ],
  },
  {
    id: 3,
    title: "Project Deadline",
    date: "2025-04-30",
    time: "5:00 PM",
    category: "work",
    participants: [],
  },
  {
    id: 4,
    title: "Group Presentation",
    date: "2025-05-01",
    time: "7:00 AM",
    category: "study",
    participants: [
      {
        id: 1,
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      {
        id: 4,
        name: "David Lee",
        avatar: "/placeholder.svg?height=24&width=24",
      },
    ],
  },
  {
    id: 5,
    title: "Campus Event",
    date: "2025-05-02",
    time: "3:30 PM",
    category: "social",
    participants: [
      {
        id: 2,
        name: "Michael Chen",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      {
        id: 3,
        name: "Emily Wong",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      {
        id: 5,
        name: "Anna Kim",
        avatar: "/placeholder.svg?height=24&width=24",
      },
    ],
  },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [viewMode, setViewMode] = useState("personal"); // "personal" or "following"

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-14 md:h-24 p-1 border border-gray-800"
        ></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split("T")[0];
      const dayEvents = EVENTS.filter((event) => event.date === dateString);

      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate.toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={cn(
            "h-14 md:h-24 p-1 border border-gray-800 transition-colors hover:bg-pink-950/30 cursor-pointer relative",
            isToday && "bg-pink-950/20",
            isSelected && "bg-pink-950/50 border-pink-500"
          )}
          onClick={() => handleDateClick(day)}
        >
          <div className="flex justify-between">
            <span
              className={cn("font-medium text-sm", isToday && "text-pink-400")}
            >
              {day}
            </span>
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map((event, idx) => (
              <div
                key={idx}
                className={cn(
                  "text-xs truncate rounded px-1 py-0.5 text-white",
                  event.category === "work" && "bg-pink-800/50",
                  event.category === "study" && "bg-purple-800/50",
                  event.category === "social" && "bg-blue-800/50",
                  event.category === "personal" && "bg-green-800/50",
                  event.category === "health" && "bg-yellow-800/50"
                )}
                title={event.title}
              >
                {event.time} {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-pink-400">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const getSelectedDateEvents = () => {
    const dateString = selectedDate.toISOString().split("T")[0];
    return EVENTS.filter((event) => event.date === dateString);
  };

  return (
    <Card className="border-gray-800 bg-gray-950 text-gray-100 shadow-xl">
      <CardHeader className="bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-pink-400">SE Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="border-gray-700 hover:bg-pink-950 hover:text-pink-300"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button
              variant="outline"
              size="icon"
              className="border-gray-700 hover:bg-pink-950 hover:text-pink-300"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "border-gray-700",
                viewMode === "following" ? "bg-gray-800" : "bg-transparent"
              )}
              onClick={() =>
                setViewMode(viewMode === "personal" ? "following" : "personal")
              }
            >
              <Users className="h-4 w-4 mr-1" />
              {viewMode === "personal" ? "Show Following" : "Personal View"}
            </Button>
            <Popover open={showEventForm} onOpenChange={setShowEventForm}>
              <PopoverTrigger asChild>
                <Button className="bg-pink-700 hover:bg-pink-600 text-white">
                  <Plus className="h-4 w-4 mr-1" /> Add Event
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-gray-900 border-gray-700 text-gray-100">
                <EventForm
                  selectedDate={selectedDate}
                  onClose={() => setShowEventForm(false)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-0">
          {DAYS.map((day) => (
            <div
              key={day}
              className="h-10 flex items-center justify-center font-semibold text-pink-300"
            >
              {day}
            </div>
          ))}
          {renderCalendarDays()}
        </div>

        <Separator className="my-6 bg-gray-800" />

        <div>
          <h3 className="text-lg font-semibold mb-4 text-pink-400">
            Events for{" "}
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <div className="space-y-3">
            {getSelectedDateEvents().length > 0 ? (
              getSelectedDateEvents().map((event, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-gray-900 border border-gray-800"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-pink-300">{event.title}</h4>
                    <span className="text-sm bg-pink-900/50 px-2 py-0.5 rounded text-pink-200">
                      {event.time}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    Category:{" "}
                    <Badge
                      variant="outline"
                      className="ml-1 text-pink-400 capitalize"
                    >
                      {event.category}
                    </Badge>
                  </div>

                  {event.participants.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-400 mb-1">
                        Participants:
                      </p>
                      <div className="flex -space-x-2">
                        {event.participants.map((participant, i) => (
                          <Avatar
                            key={i}
                            className="border-2 border-gray-900 h-6 w-6"
                          >
                            <AvatarImage
                              src={participant.avatar || "/placeholder.svg"}
                              alt={participant.name}
                            />
                            <AvatarFallback className="text-[10px] bg-pink-900">
                              {participant.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs ml-2 border-gray-700"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Invite
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                No events scheduled for this day
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
