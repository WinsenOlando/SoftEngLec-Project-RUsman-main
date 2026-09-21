"use client";

import { Trash2, Clock, Calendar, Edit, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Schedule } from "@/lib/types";
import type { User } from "@/lib/types";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import format from "date-fns/format";

interface ScheduleDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  event: (Schedule & { user?: User }) | null;
  onDeleted?: () => void;
  onUpdated?: (updatedEvent: Schedule) => void;
  currentUser: User;
}

export default function ScheduleDetailPopup({
  isOpen,
  onClose,
  event,
  onDeleted,
  onUpdated,
  currentUser,
}: ScheduleDetailPopupProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [editTitle, setEditTitle] = useState(event?.title || "");
  const [editDescription, setEditDescription] = useState(
    event?.description || ""
  );
  const [editStartTime, setEditStartTime] = useState(
    event?.startTime || "09:00"
  );
  const [editEndTime, setEditEndTime] = useState(event?.endTime || "10:00");
  const [editLocation, setEditLocation] = useState(event?.location || "");
  const [editColor, setEditColor] = useState(event?.color || "#3b82f6");
  const [editCategory, setEditCategory] = useState(
    event?.category || "lecture"
  );

  // Helper to extract "HH:mm" from ISO datetime string
  const getTimeHHMM = (iso?: string) =>
    typeof iso === "string" && iso.length >= 16 ? iso.substring(11, 16) : "";

  const formatTime = (start?: string, end?: string) =>
    `${getTimeHHMM(start)} - ${getTimeHHMM(end)}`;

  // Helper to combine event date with edited time for backend RFC3339
  const combineDateWithTime = (original: string, timeHHMM: string) => {
    if (!original || !timeHHMM) return "";
    const datePart = original.split("T")[0];
    // Pertahankan offset jika ada (misal +07:00)
    const offset = original.match(/([+-]\d{2}:\d{2}|Z)$/)?.[0] || "Z";
    return `${datePart}T${timeHHMM}:00${offset}`;
  };

  // Helper function to ensure time is in HH:MM format - MOVE THIS TO THE TOP
  const formatTimeForInput = (timeStr: string): string => {
    if (!timeStr) return "";

    // If already in HH:MM format, return as is
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr;
    }

    // If in H:MM format, pad with zero
    if (/^\d{1}:\d{2}$/.test(timeStr)) {
      return `0${timeStr}`;
    }

    // Default fallback
    return timeStr;
  };

  useEffect(() => {
    if (event && isOpen) {
      setEditTitle(event.title || "");
      setEditDescription(event.description || "");
      setEditStartTime(getTimeHHMM(event.startTime)); // only "HH:mm"
      setEditEndTime(getTimeHHMM(event.endTime)); // only "HH:mm"
      setEditLocation(event.location || "");
      setEditColor(event.color || "#3b82f6");
      setEditCategory(event.category || "lecture");
      setIsEditing(false);
      setError(null);
    }
  }, [event, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setError(null);
      // Reset form state when dialog closes
      setEditTitle("");
      setEditDescription("");
      setEditStartTime("");
      setEditEndTime("");
      setEditLocation("");
      setEditColor("#3b82f6");
      setEditCategory("lecture");
    }
  }, [isOpen]);

  if (!event) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:8888/delete-schedule/${event.id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to delete schedule");
      }
      if (onDeleted) onDeleted();
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to delete schedule");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (
      !editTitle.trim() ||
      !editDescription.trim() ||
      !editStartTime ||
      !editEndTime ||
      !editLocation.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // This combines the original event date with the possibly edited time
    const newStartTime = combineDateWithTime(event.startTime, editStartTime);
    const newEndTime = combineDateWithTime(event.endTime, editEndTime);

    const updatedEvent = {
      id: event.id, // must include id and userId as in Go struct
      userId: event.userId,
      title: editTitle.trim(),
      description: editDescription.trim(),
      startTime: newStartTime,
      endTime: newEndTime,
      location: editLocation.trim(),
      category: editCategory,
      // Do not send "color" if your backend does not support it
    };

    setIsUpdating(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:8888/update-schedule/${event.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedEvent),
        }
      );
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update schedule");
      }
      const responseData = await res.json();
      if (onUpdated) onUpdated(responseData);
      setIsEditing(false);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to update schedule");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    if (event) {
      setEditTitle(event.title || "");
      setEditDescription(event.description || "");
      setEditStartTime(getTimeHHMM(event.startTime));
      setEditEndTime(getTimeHHMM(event.endTime));
      setEditLocation(event.location || "");
      setEditColor(event.color || "#3b82f6");
      setEditCategory(event.category || "lecture");
    }
  };

  // Check if the current user can delete/edit this event
  const canModify = event.userId === currentUser.id;

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    let end = new Date(endTime);
    if (end < start) end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHours === 0) return `${diffMinutes} minutes`;
    else if (diffMinutes === 0)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
    else
      return `${diffHours} hour${
        diffHours > 1 ? "s" : ""
      } ${diffMinutes} minutes`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 text-gray-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-pink-400 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Error Alert */}
          {/* {error && (
            // <Alert
            //   variant="destructive"
            //   className="bg-red-900/50 border-red-700 text-red-200"
            // >
            //   <AlertDescription>{error}</AlertDescription>
            // </Alert>
          )} */}

          {isEditing ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                  disabled={isUpdating}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                  disabled={isUpdating}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                  disabled={isUpdating}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-gray-100 rounded-md px-3 py-2"
                  disabled={isUpdating}
                >
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="seminar">Seminar</option>
                  <option value="study">Study</option>
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    type="time"
                    id="startTime"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-100"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    type="time"
                    id="endTime"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-100"
                    disabled={isUpdating}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  type="color"
                  id="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="h-10 w-full bg-gray-800 border-gray-700"
                  disabled={isUpdating}
                />
              </div>
            </>
          ) : (
            <>
              {/* Event Title */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-400">{event.description}</p>
              </div>

              {/* Event Color Indicator */}
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full border border-gray-600"
                  style={{ backgroundColor: event.color }}
                ></div>
                <span className="text-sm text-gray-300">Event Color</span>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <div className="flex items-center text-gray-300">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{formatTime(event.startTime, event.endTime)}</span>
                  <Badge
                    variant="outline"
                    className="ml-2 text-xs border-gray-600 text-gray-400"
                  >
                    {calculateDuration(event.startTime, event.endTime)}
                  </Badge>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-gray-400">{event.location}</p>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-center text-gray-300">
                <div>
                  <p className="font-medium">Category</p>
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-600 text-gray-400 capitalize"
                  >
                    {event.category}
                  </Badge>
                </div>
              </div>
            </>
          )}

          {/* Owner Information */}
          {event.user && (
            <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={event.user.profilePicture || "/placeholder.svg"}
                  alt={event.user.name}
                />
                <AvatarFallback className="bg-pink-900 text-pink-100">
                  {event.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">
                  {event.user.name}
                </p>
                <p className="text-xs text-gray-400">{event.user.major}</p>
              </div>
              {event.user.id !== currentUser.id && (
                <Badge className="bg-blue-900/50 text-blue-300 text-xs">
                  Friend's Schedule
                </Badge>
              )}
            </div>
          )}

          {!event.user && (
            <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={currentUser.profilePicture || "/placeholder.svg"}
                  alt={currentUser.name}
                />
                <AvatarFallback className="bg-pink-900 text-pink-100">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-400">{currentUser.major}</p>
              </div>
              <Badge className="bg-pink-900/50 text-pink-300 text-xs">
                Your Schedule
              </Badge>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-800">
            <div className="text-xs text-gray-500">
              {canModify
                ? "You can modify this event"
                : "You can only view this event"}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-gray-700 hover:bg-gray-800 text-gray-300"
                disabled={isDeleting || isUpdating}
              >
                Close
              </Button>

              {canModify && !isEditing && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-700 hover:bg-gray-600 text-white flex items-center"
                  disabled={isDeleting}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}

              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="border-gray-700 hover:bg-gray-800 text-gray-300"
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleUpdate}
                    className="bg-blue-700 hover:bg-blue-600 text-white flex items-center"
                    disabled={isUpdating}
                  >
                    {isUpdating && (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    )}
                    {isUpdating ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                canModify && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    className="bg-red-700 hover:bg-red-600 text-white flex items-center"
                    disabled={isDeleting || isUpdating}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </>
                    )}
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
