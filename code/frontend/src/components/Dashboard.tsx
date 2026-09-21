"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ScheduleView from "@/components/ScheduleView";
import FollowingView from "@/components/FollowingView";
import EventView from "@/components/EventView";
import type { User, Schedule, UserFollowDetails } from "@/lib/types";
import { useNavigate } from "react-router-dom";

// Sample data
// const CURRENT_USER: User = {
//   id: "user-1",
//   name: "John Doe",
//   email: "john.doe@example.com",
//   department: "Computer Science",
//   year: "2023",
//   avatar: "/placeholder.svg?height=40&width=40",
// };

export default function Dashboard() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]); // Default to showing Alice's schedule
  const [currentView, setCurrentView] = useState<"day" | "week" | "month">(
    "week"
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  // Add a new state for active tab
  const [activeTab, setActiveTab] = useState("calendar");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [followingList, setFollowingList] = useState<User[]>([]);
  const [userFollowDetails, setUserFollowDetails] = useState<UserFollowDetails>(
    {
      user: currentUser as User,
      following: [],
      follower: [],
      followingPending: [],
    }
  );
  const [mutualFollow, setMutualFollow] = useState<User[]>([]);

  const user = localStorage.getItem("user");
  const userId = user ? JSON.parse(user).id : null;

  const navigate = useNavigate();

  const getFriendSchedules = async (friends: string[]) => {
    const users: User[] = mutualFollow.filter((user) =>
      friends.includes(user.id)
    );
    users.push(userFollowDetails.user);

    let allSchedules: Schedule[] = [];

    for (const user of users) {
      const response = await fetch("http://localhost:8888/get-schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await response.json();

      const coloredSchedules = data.map((s: Schedule) => {
        let color = "#FFC0CB"; // pink for others

        if (user.id === userId) {
          switch (s.category) {
            case "Work":
              color = "#ec4899";
              break;
            case "Study":
              color = "#8b5cf6";
              break;
            case "Personal":
              color = "#10b981";
              break;
            case "Social":
              color = "#3b82f6";
              break;
          }
        }

        return {
          ...s,
          color,
        };
      });

      allSchedules = allSchedules.concat(coloredSchedules);
    }

    setSchedules(allSchedules); // ✅ replace instead of append
  };

  const toggleFriend = (userId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  useEffect(() => {
    getFriendSchedules(selectedFriends);
  }, [selectedFriends]);

  useEffect(() => {
    console.log(schedules);
  }, [schedules]);

  // Toggle friend selection

  useEffect(() => {
    if (!currentUser) return;

    const getAllFollowedUsers = async () => {
      const response = await fetch(
        "http://localhost:8888/get-user-follow/" + userId,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      setFollowingList(result.following);

      setUserFollowDetails({
        user: result.user,
        following: result.following,
        follower: result.follower,
        followingPending: result.followingPending,
      });

      const mutual = result.following.filter((user: User) =>
        result.follower.some((follower: User) => follower.id === user.id)
      );

      setMutualFollow(mutual);
    };

    getAllFollowedUsers();
  }, [currentUser]);

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      setIsLoading(false);
      setCurrentUser(JSON.parse(user));
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;

    const getSchedules = async () => {
      const response = await fetch("http://localhost:8888/get-schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
        }),
      });
      const data = await response.json();
      const coloredSchedules = data.map((s: Schedule) => {
        let color = "#CCCCCC"; // default color

        switch (s.category) {
          case "Work":
            color = "#ec4899";
            break;
          case "Study":
            color = "#8b5cf6";
            break;
          case "Personal":
            color = "#10b981";
            break;
          case "Social":
            color = "#3b82f6";
            break;
        }

        return {
          ...s,
          color,
        };
      });

      setSchedules(coloredSchedules);
    };

    getSchedules();
  }, [currentUser]);

  // const getSchedulesToDisplay = () => {
  //   const schedules: { userId: string; user: User; events: Schedule[] }[] = [
  //     {
  //       userId: CURRENT_USER.id,
  //       user: CURRENT_USER,
  //       events: SCHEDULES[CURRENT_USER.id] || [],
  //     },
  //   ];

  //   // Add selected friends' schedules (only if mutual follow)
  //   selectedFriends.forEach((friendId) => {
  //     const friend = FOLLOWING.find((f) => f.id === friendId);
  //     if (friend && friend.mutualFollow) {
  //       schedules.push({
  //         userId: friend.id,
  //         user: friend,
  //         events: SCHEDULES[friend.id] || [],
  //       });
  //     }
  //   });

  //   return schedules;
  // };

  // Add this function to handle tab switching
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return <div className="flex min-h-screen bg-gray-950">Loading...</div>;
  }

  // Update the return statement to pass the new props to Sidebar
  return (
    <>
      <div className="w-64">
        <Sidebar
          currentUser={currentUser as User}
          selectedFriends={selectedFriends}
          toggleFriend={toggleFriend}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
        />
      </div>
      <div className="flex-1 flex flex-col">
        {activeTab === "calendar" ? (
          <ScheduleView
            schedules={schedules}
            currentView={currentView}
            setCurrentView={setCurrentView}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedFriends={
              selectedFriends
                .map((id) => followingList.find((f) => f.id === id))
                .filter(Boolean) as User[]
            }
            currentUser={currentUser as User}
            following={followingList}
            mutualFollow={mutualFollow}
          />
        ) : activeTab === "events" ? (
          <div className="flex-1 p-4">
            <EventView
              currentUser={currentUser as User}
              following={followingList}
              mutualFollow={mutualFollow}
            />
          </div>
        ) : (
          <div className="flex-1 p-4">
            <FollowingView
              setActiveTab={handleTabChange}
              following={followingList}
            />
          </div>
        )}
      </div>
    </>
  );
}
