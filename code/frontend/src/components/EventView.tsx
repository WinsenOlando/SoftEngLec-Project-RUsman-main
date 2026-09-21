"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Calendar,
  Clock,
  Users,
  Tag,
  Check,
  X,
  Bell,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EventCreationForm from "@/components/EventCreationForm";
import type { Schedule, ScheduleInvitation, User } from "@/lib/types";
import Participant from "@/models/Participant";

interface EventViewProps {
  currentUser: User;
  following: User[];
  mutualFollow: User[];
}

export default function EventView({
  currentUser,
  following,
  mutualFollow,
}: EventViewProps) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEventForm, setShowEventForm] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<Schedule[]>([]);
  const [myEvents, setMyEvents] = useState<Schedule[]>([]);
  const [allEvents, setAllEvents] = useState<Schedule[]>([]);
  const [invitedEvents, setInvitedEvents] = useState<ScheduleInvitation[]>([]);

  const refreshEvents = async () => {
    try {
      const [acceptedSchedules, mySchedules, invitedSchedules] = await Promise.all([
        fetch("http://localhost:8888/get-schedules-accepted-by-user/" + currentUser.id).then(res => res.json()),
        fetch("http://localhost:8888/get-schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser.id })
        }).then(res => res.json()),
        fetch("http://localhost:8888/get-schedules-request-by-schedule/" + currentUser.id).then(res => res.json())
      ]);

      setUpcomingEvents(acceptedSchedules);
      setAllEvents(mySchedules);
      setInvitedEvents(invitedSchedules);

      // Filter events based on search query
      const lower = searchQuery.toLowerCase();
      const filteredEvents = mySchedules.filter(
        (ev) =>
          ev.title.toLowerCase().includes(lower) ||
          ev.description.toLowerCase().includes(lower)
      );
      setMyEvents(filteredEvents);
      
      setActiveTab("created"); // Switch to 'created' tab after refresh
    } catch (error) {
      console.error("Error refreshing events:", error);
    }
  };

  // Initial load and refresh when user changes
  useEffect(() => {
    refreshEvents();
  }, [currentUser.id]);

  // Update filtered events when search query changes
  useEffect(() => {
    if (allEvents.length > 0) {
      const lower = searchQuery.toLowerCase();
      setMyEvents(
        allEvents.filter(
          (ev) =>
            ev.title.toLowerCase().includes(lower) ||
            ev.description.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchQuery, allEvents]);

  return (
    <Card className="border-gray-800 bg-gray-950 text-gray-100 shadow-xl overflow-clip">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-pink-400 text-2xl font-bold tracking-wide">
            Events
          </CardTitle>
          <Button
            className="bg-pink-700 hover:bg-pink-600 text-white"
            onClick={() => setShowEventForm(true)}
          >
            <Calendar className="h-4 w-4 mr-1" /> Create Event
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs
          defaultValue="upcoming"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6 bg-gray-900">
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-pink-900 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming Events
            </TabsTrigger>
            <TabsTrigger
              value="created"
              className="data-[state=active]:bg-pink-900 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Created by Me
            </TabsTrigger>
            <TabsTrigger
              value="invited"
              className="data-[state=active]:bg-pink-900 data-[state=active]:text-white relative"
            >
              <Mail className="h-4 w-4 mr-2" />
              Invited to
              {invitedEvents.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {invitedEvents.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Search and filter controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {activeTab === "invited" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem
                    value="all"
                    className="text-white hover:bg-gray-700"
                  >
                    All Invitations
                  </SelectItem>
                  <SelectItem
                    value="pending"
                    className="text-white hover:bg-gray-700"
                  >
                    Pending
                  </SelectItem>
                  <SelectItem
                    value="accepted"
                    className="text-white hover:bg-gray-700"
                  >
                    Accepted
                  </SelectItem>
                  <SelectItem
                    value="declined"
                    className="text-white hover:bg-gray-700"
                  >
                    Declined
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {activeTab === "upcoming" && (
            <TabsContent value="upcoming" className="mt-0">
              <div className="space-y-4">
                {myEvents.length > 0 ? (
                  myEvents
                    .filter(
                      (event) =>
                        new Date(event.startTime).getTime() > Date.now()
                    )
                    .sort(
                      (a, b) =>
                        new Date(a.startTime).getTime() -
                        new Date(b.startTime).getTime()
                    )
                    .map((event) => <EventCard key={event.id} event={event} />)
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No upcoming events
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {activeTab === "created" && (
            <TabsContent value="created" className="mt-0">
              <div className="space-y-4">
                {myEvents.length > 0 ? (
                  myEvents
                    .sort(
                      (a, b) =>
                        new Date(a.startTime).getTime() -
                        new Date(b.startTime).getTime()
                    )
                    .map((event) => <EventCard key={event.id} event={event} />)
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    You haven't created any events yet
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {activeTab === "invited" && (
            <TabsContent value="invited" className="mt-0">
              {invitedEvents.length > 0 && (
                <div className="mb-6 p-4 bg-pink-900/20 border border-pink-800 rounded-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 text-pink-400 mr-3" />
                  <div className="flex-1">
                    <p className="text-pink-300 font-medium">
                      You have {invitedEvents.length} pending invitation
                      {invitedEvents.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-pink-200/70">
                      Please respond to these invitations to update your
                      schedule
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {invitedEvents.length > 0 ? (
                  invitedEvents.map((event) => (
                    <InvitationCard
                      key={event.schedule.id}
                      invitation={event}
                      // respond={(): void => {}}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery || statusFilter !== "all"
                      ? "No invitations match your search criteria"
                      : "You haven't been invited to any events"}
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>

      {/* Event Creation Form */}
      <EventCreationForm
        isOpen={showEventForm}
        onClose={() => setShowEventForm(false)}
        selectedDate={new Date()}
        currentUser={currentUser}
        following={following}
        mutualFollow={mutualFollow}
        onEventCreated={refreshEvents}
      />
    </Card>
  );
}

function EventCard(event: { event: Schedule }) {
  const getTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDate = (date: string) => {
    return new Date(date).toLocaleDateString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getDuration = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = Math.abs(endTime.getTime() - startTime.getTime());
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg text-pink-300">
            {event.event.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {event.event.description}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`
            ${
              event.event.category === "Work"
                ? "border-pink-500 text-pink-400"
                : ""
            }
            ${
              event.event.category === "Study"
                ? "border-purple-500 text-purple-400"
                : ""
            }
            ${
              event.event.category === "Social"
                ? "border-blue-500 text-blue-400"
                : ""
            }
            capitalize
          `}
        >
          {event.event.category}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center text-sm text-gray-300">
          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
          {getDate(event.event.startTime)}
        </div>
        <div className="flex items-center text-sm text-gray-300">
          <Clock className="h-4 w-4 mr-2 text-gray-500" />
          {getTime(event.event.startTime)} - {getTime(event.event.endTime)} (
          {getDuration(event.event.startTime, event.event.endTime)})
        </div>
        <div className="flex items-center text-sm text-gray-300 col-span-2">
          <Tag className="h-4 w-4 mr-2 text-gray-500" />
          {event.event.location}
        </div>
      </div>

      {event.event.participants && event.event.participants.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-800">
          <p className="text-sm text-gray-400 mb-2">Participants:</p>
          <div className="flex flex-wrap gap-2">
            {event.event.participants.map((participant: Participant) => (
              <div
                key={participant.id}
                className="flex items-center bg-gray-800 rounded-full px-2 py-1"
              >
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarImage
                    src={participant.profilePicture || "/placeholder.svg"}
                    alt={participant.name}
                  />
                  <AvatarFallback className="text-[10px] bg-pink-900">
                    {participant.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-300">
                  {participant.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Invitation card component with accept/decline actions
function InvitationCard({
  invitation,
}: // onRespond,
{
  invitation: ScheduleInvitation;
  // onRespond: (id: number, status: "accepted" | "declined") => void;
}) {
  const getTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDate = (date: string) => {
    return new Date(date).toLocaleDateString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getDuration = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = Math.abs(endTime.getTime() - startTime.getTime());
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div
      className={`p-4 bg-gray-900 rounded-lg border ${
        invitation.status.toLowerCase() === "pending"
          ? "border-pink-800"
          : invitation.status.toLowerCase() === "accepted"
          ? "border-green-800"
          : "border-gray-800"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h3 className="font-medium text-lg text-pink-300">
              {invitation.schedule.title}
            </h3>
            {invitation.status === "pending" && (
              <Badge className="ml-2 bg-pink-900 text-pink-100">Pending</Badge>
            )}
            {invitation.status === "accepted" && (
              <Badge className="ml-2 bg-green-900 text-green-100">
                Accepted
              </Badge>
            )}
            {invitation.status === "rejected" && (
              <Badge className="ml-2 bg-gray-700 text-gray-300">Declined</Badge>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {invitation.schedule.description}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Invited by: {invitation.user.name}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`
            ${
              invitation.schedule.category.toLowerCase() === "work"
                ? "border-pink-500 text-pink-400"
                : ""
            }
            ${
              invitation.schedule.category.toLowerCase() === "study"
                ? "border-purple-500 text-purple-400"
                : ""
            }
            ${
              invitation.schedule.category.toLowerCase() === "social"
                ? "border-blue-500 text-blue-400"
                : ""
            }
            capitalize
          `}
        >
          {invitation.schedule.category}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center text-sm text-gray-300">
          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
          {getDate(invitation.schedule.startTime)}
        </div>
        <div className="flex items-center text-sm text-gray-300">
          <Clock className="h-4 w-4 mr-2 text-gray-500" />
          {getTime(invitation.schedule.startTime)} -{" "}
          {getTime(invitation.schedule.endTime)} (
          {getDuration(
            invitation.schedule.startTime,
            invitation.schedule.endTime
          )}
          )
        </div>
        <div className="flex items-center text-sm text-gray-300 col-span-2">
          <Tag className="h-4 w-4 mr-2 text-gray-500" />
          {invitation.schedule.location || "No specific location"}
        </div>
      </div>

      {invitation.schedule.participants &&
        invitation.schedule.participants.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-800">
            <p className="text-sm text-gray-400 mb-2">Other Participants:</p>
            <div className="flex flex-wrap gap-2">
              {invitation.schedule.participants.map(
                (participant: Participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center bg-gray-800 rounded-full px-2 py-1"
                  >
                    <Avatar className="h-5 w-5 mr-1">
                      <AvatarImage
                        src={participant.profilePicture || "/placeholder.svg"}
                        alt={participant.name}
                      />
                      <AvatarFallback className="text-[10px] bg-pink-900">
                        {participant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-300">
                      {participant.name}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

      <div className="mt-4 flex justify-between items-center">
        <div>
          {invitation.status.toLowerCase() === "pending" && (
            <p className="text-xs text-pink-300 flex items-center">
              <Bell className="h-3 w-3 mr-1" /> Please respond to this
              invitation
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          {invitation.status.toLowerCase() === "pending" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-red-800 hover:bg-red-900/30 text-red-300 flex items-center"
                // onClick={() => onRespond(event.id, "declined")}
              >
                <X className="h-4 w-4 mr-1" /> Decline
              </Button>
              <Button
                size="sm"
                className="bg-green-700 hover:bg-green-600 text-white flex items-center"
                // onClick={() => onRespond(event.id, "accepted")}
              >
                <Check className="h-4 w-4 mr-1" /> Accept
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 hover:bg-gray-800 text-gray-300"
              >
                View Details
              </Button>
              {invitation.status.toLowerCase() === "accepted" ? (
                <Button
                  size="sm"
                  className="bg-pink-700 hover:bg-pink-600 text-white"
                >
                  Add to Calendar
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-pink-700 hover:bg-pink-600 text-white"
                  // onClick={() => onRespond(event.id, "accepted")}
                >
                  Accept Invitation
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
