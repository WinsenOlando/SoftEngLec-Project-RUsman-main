"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { CalendarIcon, Clock, Users, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Schedule, User } from "@/lib/types";
import { format, isSameDay } from "date-fns";

// Update the interface to accept startTime and endTime props
interface EventCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  startTime?: string;
  endTime?: string;
  currentUser: User;
  following: User[];
  mutualFollow: User[];
  onEventCreated?: () => void;
}

// Sample locations
const LOCATIONS = [
  "Room 101",
  "Room 102",
  "Room 103",
  "Room 201",
  "Room 202",
  "Room 203",
  "Library",
  "Computer Lab",
  "Student Center",
  "Cafeteria",
  "Online",
  "Other",
];

// Update the component to use the provided startTime and endTime if available
export default function EventCreationForm({
  isOpen,
  onClose,
  selectedDate = new Date(),
  startTime: initialStartTime,
  endTime: initialEndTime,
  currentUser,
  following,
  mutualFollow,
  onEventCreated,
}: EventCreationFormProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(selectedDate.toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState(initialStartTime || "09:00");
  const [endTime, setEndTime] = useState(initialEndTime || "10:00");
  const [category, setCategory] = useState("Study");
  const [location, setLocation] = useState("Room 101");
  const [customLocation, setCustomLocation] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<User[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState("weekly");
  const [recurringDays, setRecurringDays] = useState<string[]>([]);
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [reminders, setReminders] = useState<string[]>(["30min"]);
  const [errors, setErrors] = useState<{
    title?: string;
    date?: string;
    time?: string;
    category?: string;
  }>({});

  // Toggle participant selection
  const toggleParticipant = (user: User) => {
    setSelectedParticipants((prev) =>
      prev.includes(user) ? prev.filter((p) => p !== user) : [...prev, user]
    );
  };

  // Toggle recurring day selection
  const toggleRecurringDay = (day: string) => {
    setRecurringDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Toggle reminder selection
  const toggleReminder = (reminder: string) => {
    setReminders((prev) =>
      prev.includes(reminder)
        ? prev.filter((r) => r !== reminder)
        : [...prev, reminder]
    );
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create event object
    const newEvent = {
      title,
      description,
      date,
      startTime,
      endTime,
      category,
      location: location === "Other" ? customLocation : location,
      participants: selectedParticipants,
      recurringUntil: isRecurring ? recurringEndDate : "",
      // isRecurring,
      // recurringPattern: isRecurring ? recurringPattern : null,
      // recurringDays: isRecurring ? recurringDays : [],
      // recurringEndDate: isRecurring ? recurringEndDate : null,
      // isPrivate,
      // reminders,
      // createdBy: currentUser.id,
    };

    const newSchedule: Schedule = {
      id: Date.now().toString(),
      userId: currentUser.id,
      title,
      description,
      startTime: `${date}T${startTime}:00`,
      endTime: `${date}T${endTime}:00`,
      location,
      category,
      participants: selectedParticipants,
      recurringUntil: isRecurring ? recurringEndDate : "",
      color: category === "Study" ? "#8b5cf6" : 
             category === "Work" ? "#ec4899" : 
             category === "Personal" ? "#10b981" : 
             "#3b82f6", // Default blue for Social
    };

    createEvent();

    console.log("New event:", newSchedule);

    // Reset form and close dialog
    resetForm();
    onClose();
  };

  // Reset form fields
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setStartTime("09:00");
    setEndTime("10:00");
    setCategory("Study");
    setLocation("Room 101");
    setCustomLocation("");
    setSelectedParticipants([]);
    setIsRecurring(false);
    setRecurringPattern("weekly");
    setRecurringDays([]);
    setRecurringEndDate("");
    setIsPrivate(false);
    setReminders(["30min"]);
    setActiveTab("details");
  };

  // Update the date and times when the props change
  useEffect(() => {
    setDate(selectedDate.toISOString().split("T")[0]);
    if (initialStartTime) setStartTime(initialStartTime);
    if (initialEndTime) setEndTime(initialEndTime);
  }, [selectedDate, initialStartTime, initialEndTime]);

  // If the form is opened with a specific time slot, automatically go to the schedule tab
  useEffect(() => {
    if (isOpen && initialStartTime && initialEndTime) {
      setActiveTab("schedule");

      // Set a default title based on the time slot
      const dayName = format(selectedDate, "EEEE");
      setTitle(`Group Work on ${dayName}`);

      // Set a default description
      setDescription(
        `Group work session with ${
          mutualFollow.length
        } mutual followers: ${mutualFollow.map((f) => f.name).join(", ")}`
      );

      // Pre-select mutual followers as participants
      setSelectedParticipants(mutualFollow.map((f) => f));
    }
  }, [isOpen, initialStartTime, initialEndTime, following, selectedDate]);

  const createEvent = async () => {
    const newErrors: {
      title?: string;
      date?: string;
      time?: string;
      category?: string;
    } = {};

    if (!title.trim()) {
      newErrors.title = "Judul event harus diisi";
      setErrors(newErrors);
      return;
    }

    // Get current date and time
    const now = new Date();
    const eventStartTime = new Date(`${date}T${startTime}:00`);
    const eventEndTime = new Date(`${date}T${endTime}:00`);

    // Validate start time is not in the past
    if (eventStartTime < now) {
      newErrors.date = "Tidak dapat membuat event di masa lalu";
      setErrors(newErrors);
      return;
    }

    // Validate start time is before end time
    if (eventStartTime >= eventEndTime) {
      newErrors.time = "Waktu selesai harus setelah waktu mulai";
      setErrors(newErrors);
      return;
    }

    // Assign different colors based on category
    let eventColor = "#3b82f6"; // Default blue
    switch (category.toLowerCase()) {
      case "study":
        eventColor = "#8b5cf6"; // Purple
        break;
      case "work":
        eventColor = "#ec4899"; // Pink
        break;
      case "personal":
        eventColor = "#10b981"; // Green
        break;
      case "social":
        eventColor = "#3b82f6"; // Blue
        break;
      default:
        eventColor = "#3b82f6"; // Default blue
    }

    const newSchedule: Schedule = {
      id: Date.now().toString(),
      userId: currentUser.id,
      title,
      description,
      startTime: `${date}T${startTime}:00`,
      endTime: `${date}T${endTime}:00`,
      location,
      category,
      participants: selectedParticipants,
      recurringUntil: isRecurring ? recurringEndDate : "",
      color: eventColor,
    };

    try {
      const response = await fetch("http://localhost:8888/create-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSchedule),
      });

      if (response.ok) {
        await onEventCreated?.();
        onClose();
      } else {
        newErrors.date = "Gagal membuat event";
        setErrors(newErrors);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      newErrors.date = "Gagal membuat event";
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: {
      title?: string;
      date?: string;
      time?: string;
      category?: string;
    } = {};

    if (!title.trim()) {
      newErrors.title = "Judul event harus diisi";
    }

    if (!date) {
      newErrors.date = "Tanggal harus dipilih";
    } else {
      const now = new Date();
      const eventStartTime = new Date(`${date}T${startTime}:00`);
      
      if (eventStartTime < now) {
        newErrors.date = "Tidak dapat membuat event di masa lalu";
      }
    }

    if (!startTime || !endTime) {
      newErrors.time = "Waktu mulai dan selesai harus diisi";
    } else if (startTime >= endTime) {
      newErrors.time = "Waktu selesai harus setelah waktu mulai";
    }

    if (!category) {
      newErrors.category = "Kategori harus dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 text-gray-100 max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-pink-400 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Create New Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6 bg-gray-800 w-full grid grid-cols-3">
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-pink-900 data-[state=active]:text-white"
              >
                <Info className="h-4 w-4 mr-2" />
                Event Details
              </TabsTrigger>
              <TabsTrigger
                value="participants"
                className="data-[state=active]:bg-pink-900 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Participants
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="data-[state=active]:bg-pink-900 data-[state=active]:text-white"
              >
                <Clock className="h-4 w-4 mr-2" />
                Schedule
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-200">
                  Event Title*
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add title"
                  required
                  className={`bg-gray-800 border-gray-700 text-gray-100 ${
                    errors.title ? 'border-pink-500' : ''
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-pink-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-200">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add description"
                  className="bg-gray-800 border-gray-700 text-gray-100 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-200">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className={`bg-gray-800 border-gray-700 text-gray-100 ${
                    errors.category ? 'border-pink-500' : ''
                  }`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="Study" className="text-pink-300">
                      Study
                    </SelectItem>
                    <SelectItem value="Work" className="text-pink-300">
                      Work
                    </SelectItem>
                    <SelectItem value="Social" className="text-pink-300">
                      Social
                    </SelectItem>
                    <SelectItem value="Personal" className="text-pink-300">
                      Personal
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="mt-1 text-sm text-pink-500">{errors.category}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-200">Invite Participants</Label>
                <div className="bg-gray-800 border border-gray-700 rounded-md p-4 max-h-[300px] overflow-y-auto">
                  {mutualFollow.length > 0 ? (
                    <div className="space-y-3">
                      {mutualFollow.map((person) => (
                        <div
                          key={person.id}
                          className="flex items-center space-x-2 py-1"
                        >
                          <Checkbox
                            id={`person-${person.id}`}
                            checked={selectedParticipants.includes(person)}
                            onCheckedChange={() => toggleParticipant(person)}
                            className="border-gray-600 data-[state=checked]:bg-pink-600"
                          />
                          <div className="flex items-center space-x-2 flex-1">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  person.profilePicture || "/placeholder.svg"
                                }
                                alt={person.name}
                              />
                              <AvatarFallback className="bg-pink-900">
                                {person.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Label
                                htmlFor={`person-${person.id}`}
                                className="text-sm text-gray-300 cursor-pointer"
                              >
                                {person.name}
                              </Label>
                              <div className="text-xs text-gray-500">
                                {person.major}
                              </div>
                            </div>
                          </div>
                          {mutualFollow && (
                            <Badge className="bg-pink-900/50 text-pink-300 text-xs">
                              Mutual Follow
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      You're not following anyone yet
                    </p>
                  )}
                </div>
              </div>

              {selectedParticipants.length > 0 && (
                <div className="pt-2">
                  <Label className="text-gray-200 block mb-2">
                    Selected Participants ({selectedParticipants.length})
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedParticipants.map((prt) => {
                      const person = mutualFollow.find((f) => f === prt);
                      if (!person) return null;

                      return (
                        <div
                          key={prt.id}
                          className="flex items-center bg-gray-800 rounded-full px-2 py-1 border border-gray-700"
                        >
                          <Avatar className="h-5 w-5 mr-1">
                            <AvatarImage
                              src={person.profilePicture || "/placeholder.svg"}
                              alt={person.name}
                            />
                            <AvatarFallback className="text-[10px] bg-pink-900">
                              {person.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-300">
                            {person.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 ml-1 text-gray-500 hover:text-gray-300"
                            onClick={() => toggleParticipant(prt)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-gray-200">
                    Date*
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className={`bg-gray-800 border-gray-700 text-gray-100 ${
                      errors.date ? 'border-pink-500' : ''
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-pink-500">{errors.date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-gray-200">
                    Start Time*
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className={`bg-gray-800 border-gray-700 text-gray-100 ${
                      errors.time ? 'border-pink-500' : ''
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-gray-200">
                    End Time*
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className={`bg-gray-800 border-gray-700 text-gray-100 ${
                      errors.time ? 'border-pink-500' : ''
                    }`}
                  />
                  {errors.time && (
                    <p className="mt-1 text-sm text-pink-500">{errors.time}</p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="isRecurring"
                    checked={isRecurring}
                    onCheckedChange={(checked) =>
                      setIsRecurring(checked as boolean)
                    }
                    className="border-gray-600 data-[state=checked]:bg-pink-600"
                  />
                  <Label
                    htmlFor="isRecurring"
                    className="text-sm text-gray-300 cursor-pointer"
                  >
                    This is a recurring event
                  </Label>
                </div>

                {isRecurring && (
                  <div className="space-y-4 pl-6 border-l-2 border-gray-800">
                    {/* <div className="space-y-2">
                      <Label
                        htmlFor="recurringPattern"
                        className="text-gray-200"
                      >
                        Recurring Pattern
                      </Label>
                      <RadioGroup
                        value={recurringPattern}
                        onValueChange={setRecurringPattern}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="daily"
                            id="daily"
                            className="border-gray-600 text-pink-600"
                          />
                          <Label
                            htmlFor="daily"
                            className="text-sm text-gray-300"
                          >
                            Daily
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="weekly"
                            id="weekly"
                            className="border-gray-600 text-pink-600"
                          />
                          <Label
                            htmlFor="weekly"
                            className="text-sm text-gray-300"
                          >
                            Weekly
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="monthly"
                            id="monthly"
                            className="border-gray-600 text-pink-600"
                          />
                          <Label
                            htmlFor="monthly"
                            className="text-sm text-gray-300"
                          >
                            Monthly
                          </Label>
                        </div>
                      </RadioGroup>
                    </div> */}

                    {/* {recurringPattern === "weekly" && (
                      <div className="space-y-2">
                        <Label className="text-gray-200">Repeat on</Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                          ].map((day) => (
                            <div
                              key={day}
                              onClick={() => toggleRecurringDay(day)}
                              className={cn(
                                "cursor-pointer rounded-full px-3 py-1 text-xs font-medium",
                                recurringDays.includes(day)
                                  ? "bg-pink-900 text-pink-100"
                                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                              )}
                            >
                              {day.substring(0, 3)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )} */}

                    <div className="space-y-2">
                      <Label
                        htmlFor="recurringEndDate"
                        className="text-gray-200"
                      >
                        End Date
                      </Label>
                      <Input
                        id="recurringEndDate"
                        type="date"
                        value={recurringEndDate}
                        onChange={(e) => setRecurringEndDate(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-gray-100"
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between items-center pt-4 border-t border-gray-800">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="border-gray-700 hover:bg-gray-800 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-pink-700 hover:bg-pink-600 text-white"
              >
                Create Event
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
