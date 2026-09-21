"use client";

import { useEffect, useState } from "react";
import { Search, Users, UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UnfollowConfirmationDialog from "@/components/UnfollowConfirmationDialog";
import RemoveFollowerConfirmationDialog from "@/components/RemoveFollowerConfirmationDialog";
import type { User } from "@/lib/types";
import { useNavigate } from "react-router-dom";

interface FollowingViewProps {
  following: User[];
  setActiveTab: (tab: string) => void;
}

export default function FollowingView({
  following,
  setActiveTab,
}: FollowingViewProps) {
  const navigate = useNavigate();
  const [discoverableStudents, setDiscoverableStudents] = useState<User[]>([]);
  const [followingList, setFollowingList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [major, setMajor] = useState("All Majors");
  const [majors, setMajors] = useState<string[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{
    [key: string]: boolean;
  }>({});
  const [pendingReceived, setPendingReceived] = useState<User[]>([]);
  const [pendingReceivedRequests, setPendingReceivedRequests] = useState<any[]>(
    []
  );
  const [followersList, setFollowersList] = useState<User[]>([]);

  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false);
  const [userToUnfollow, setUserToUnfollow] = useState<User | null>(null);

  const [showRemoveFollowerDialog, setShowRemoveFollowerDialog] =
    useState(false);
  const [followerToRemove, setFollowerToRemove] = useState<User | null>(null);

  const user = localStorage.getItem("user");
  const userId = user ? JSON.parse(user).id : null;

  const getAllAvailableUsers = async () => {
    try {
      const response = await fetch("http://localhost:8888/get-users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const result = await response.json();
      const filteredUsers = result.filter((user: User) => user.id !== userId);
      setDiscoverableStudents(filteredUsers);

      const uniqueMajors = Array.from(
        new Set(result.map((user: User) => user.major))
      ).filter((major): major is string => typeof major === "string");
      setMajors(["All Majors", ...uniqueMajors]);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getFollowingList = async () => {
    try {
      const response = await fetch(
        `http://localhost:8888/get-user-follow/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch following list");
      const result = await response.json();
      setFollowingList(result.following || []);
      setFollowersList(result.follower || []);
    } catch (error) {
      console.error("Error fetching following list:", error);
    }
  };

  const getPendingRequests = async () => {
    try {
      const response = await fetch(
        "http://localhost:8888/get-all-requests-by-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch pending requests");
      let requests = await response.json();
      if (!Array.isArray(requests)) requests = [requests];
      const pendingStatus: { [key: string]: boolean } = {};
      requests.forEach((request: any) => {
        if (request && request.requesteeId) {
          pendingStatus[request.requesteeId] = true;
        }
      });
      setPendingRequests(pendingStatus);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const getPendingReceived = async () => {
    try {
      const response = await fetch(
        "http://localhost:8888/get-all-requests-by-requestee",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requesteeId: userId,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch pending received");
      let requests = await response.json();
      if (!Array.isArray(requests)) requests = [requests];

      const pendingRequests = requests.filter(
        (r: any) => r.status === "Pending"
      );

      const userDetails = await Promise.all(
        pendingRequests.map(async (req: any) => {
          const userRes = await fetch(
            `http://localhost:8888/get-user/${req.userId}`
          );
          if (!userRes.ok) return null;
          return await userRes.json();
        })
      );
      setPendingReceivedRequests(userDetails.filter(Boolean));
    } catch (error) {
      console.error("Error fetching pending received:", error);
    }
  };

  useEffect(() => {
    getAllAvailableUsers();
    getFollowingList();
    getPendingRequests();
    getPendingReceived();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getPendingRequests();
      getPendingReceived();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleFollowToggle = async (studentId: string) => {
    try {
      if (followingList.some((f) => f.id === studentId)) {

        const student = followingList.find((s) => s.id === studentId);
        if (student) {
          setUserToUnfollow(student);
          setShowUnfollowDialog(true);
        }
        return;
      }

      if (pendingRequests[studentId]) {
        const response = await fetch(
          "http://localhost:8888/cancel-follow-request",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userId,
              requesteeId: studentId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to cancel follow request");
        }

        getPendingRequests();
        return;
      }

      const response = await fetch(
        "http://localhost:8888/create-follow-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            requesteeId: studentId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send follow request");
      }
      getPendingRequests();
    } catch (error) {
      console.error("Error sending/cancelling follow request:", error);
    }
  };

  const handleRejectRequest = async (requestUserId: string) => {
    try {
      const response = await fetch(
        "http://localhost:8888/cancel-follow-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: requestUserId,
            requesteeId: userId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Gagal menolak permintaan");
      }
      getPendingReceived();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleAcceptRequest = async (requestUserId: string) => {
    try {
      const followResponse = await fetch(
        "http://localhost:8888/create-follow",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: requestUserId,
            followingId: userId,
          }),
        }
      );
      if (!followResponse.ok) {
        throw new Error("Gagal menambahkan ke follows");
      }

      const deleteResponse = await fetch(
        "http://localhost:8888/cancel-follow-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: requestUserId,
            requesteeId: userId,
          }),
        }
      );
      if (!deleteResponse.ok) {
        throw new Error("Gagal menghapus follow request");
      }
      getPendingReceived();
      getFollowingList();
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleUnfollow = async (followingId: string) => {
    try {
      const response = await fetch("http://localhost:8888/delete-follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          followingId: followingId,
        }),
      });

      const responseData = await response.json();

      await getFollowingList();
    } catch (error: any) {
      console.error("Error detail saat unfollow:", error);
    }
  };

  const handleConfirmUnfollow = async () => {
    if (userToUnfollow) {
      await handleUnfollow(userToUnfollow.id);
      setShowUnfollowDialog(false);
      setUserToUnfollow(null);
    }
  };

  const handleCancelUnfollow = () => {
    setShowUnfollowDialog(false);
    setUserToUnfollow(null);
  };

  const handleRemoveFollower = async (followerId: string) => {
    try {
      const response = await fetch("http://localhost:8888/delete-follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: followerId,
          followingId: userId,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        let errorMsg = "Failed to remove follower";
        if (responseData && responseData.error) {
          errorMsg += ": " + responseData.error;
          console.error("Unfollow error from server:", responseData.error);
        }
        alert(errorMsg);
        return;
      }

      await getFollowingList();
    } catch (error: any) {
      console.error("Error detail saat unfollow:", error);
    }
  };

  const handleRemoveFollowerClick = (user: User) => {
    setFollowerToRemove(user);
    setShowRemoveFollowerDialog(true);
  };

  const handleConfirmRemoveFollower = async () => {
    if (followerToRemove) {
      await handleRemoveFollower(followerToRemove.id);
      setShowRemoveFollowerDialog(false);
      setFollowerToRemove(null);
    }
  };

  const handleCancelRemoveFollower = () => {
    setShowRemoveFollowerDialog(false);
    setFollowerToRemove(null);
  };

  const filterStudents = (students: User[]) => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMajor = major === "All Majors" || student.major === major;
      return matchesSearch && matchesMajor;
    });
  };

  const filteredFollowing = filterStudents(followingList);
  const filteredPending = filterStudents(pendingReceived);
  const filteredDiscoverable = filterStudents(discoverableStudents);
  const filteredFollowers = filterStudents(followersList);
  const filteredPendingRequests = filterStudents(pendingReceivedRequests);

  return (
    <div>
      <Card className="border-gray-800 bg-gray-950 text-gray-100 shadow-xl overflow-clip">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="text-pink-400 text-2xl font-bold tracking-wide">
            Student Connections
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs
            defaultValue="following"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-6 bg-gray-900 space-x-1">
              <TabsTrigger
                value="following"
                className="data-[state=active]:bg-pink-900 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Following ({filteredFollowing.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-pink-900 data-[state=active]:text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Pending ({filteredPendingRequests.length})
              </TabsTrigger>
              <TabsTrigger
                value="discover"
                className="data-[state=active]:bg-pink-900 data-[state=active]:text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Discover
              </TabsTrigger>
              <TabsTrigger
                value="followers"
                className="data-[state=active]:bg-pink-900 data-[state=active]:text-white"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Followers ({filteredFollowers.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Select value={major} onValueChange={setMajor}>
                <SelectTrigger className="w-full md:w-[180px] bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by Major" />
                </SelectTrigger>
                <SelectContent
                  className="bg-gray-900 border-gray-700 w-[180px] max-h-[280px]"
                  position="popper"
                  sideOffset={4}
                >
                  {majors.map((major) => (
                    <SelectItem
                      key={major}
                      value={major}
                      className="text-white hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
                    >
                      {major}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="following" className="mt-0">
              <div className="flex flex-col gap-4">
                {filteredFollowing && filteredFollowing.length > 0 ? (
                  filteredFollowing.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={student.profilePicture || "/default-avatar.png"}
                          alt={student.name}
                          className="w-10 h-10 rounded-full bg-gray-700"
                        />
                        <div>
                          <h3 className="font-medium text-white">
                            {student.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {student.email}
                          </p>
                          <div className="text-xs text-gray-500">
                            {student.major} • {student.studentId}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/schedule/${student.id}`)}
                          className="bg-gray-700 hover:bg-gray-600"
                        >
                          View Schedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-700 bg-red-900/20 hover:bg-red-900/40 text-red-300 hover:text-red-200"
                          onClick={() => handleFollowToggle(student.id)}
                        >
                          Unfollow
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery || major !== "All Majors"
                      ? "No students match your search criteria"
                      : "You're not following any students yet"}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              <div className="flex flex-col gap-4">
                {filteredPendingRequests &&
                filteredPendingRequests.length > 0 ? (
                  filteredPendingRequests.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={student.profilePicture || "/default-avatar.png"}
                          alt={student.name}
                          className="w-10 h-10 rounded-full bg-gray-700"
                        />
                        <div>
                          <h3 className="font-medium text-white">
                            {student.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {student.email}
                          </p>
                          <div className="text-xs text-gray-500">
                            {student.major} • {student.studentId}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAcceptRequest(student.id)}
                          className="bg-pink-900 hover:bg-pink-800"
                        >
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectRequest(student.id)}
                          className="bg-gray-700 hover:bg-gray-600"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No pending follow requests
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="discover" className="mt-0">
              <div className="space-y-4">
                {filteredDiscoverable.length > 0 ? (
                  filteredDiscoverable.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={student.profilePicture}
                          alt={student.name}
                          className="w-10 h-10 rounded-full bg-gray-700"
                        />
                        <div>
                          <h3 className="font-medium text-white">
                            {student.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {student.email}
                          </p>
                          <div className="text-xs text-gray-500">
                            {student.major} • {student.studentId}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className={
                            followingList.some((f) => f.id === student.id)
                              ? "bg-gray-700 hover:bg-gray-600 text-white"
                              : pendingRequests[student.id]
                              ? "bg-gray-700 hover:bg-gray-600 text-white"
                              : "bg-pink-700 hover:bg-pink-600 text-white"
                          }
                          onClick={() => handleFollowToggle(student.id)}
                        >
                          {(() => {
                            if (
                              followingList.some((f) => f.id === student.id)
                            ) {
                              return "Following";
                            } else if (pendingRequests[student.id]) {
                              return "Pending";
                            } else {
                              return "Follow";
                            }
                          })()}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery || major !== "All Majors"
                      ? "No students match your search criteria"
                      : "No more students to discover"}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="followers" className="mt-0">
              <div className="flex flex-col gap-4">
                {filteredFollowers && filteredFollowers.length > 0 ? (
                  filteredFollowers.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={student.profilePicture || "/default-avatar.png"}
                          alt={student.name}
                          className="w-10 h-10 rounded-full bg-gray-700"
                        />
                        <div>
                          <h3 className="font-medium text-white">
                            {student.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {student.email}
                          </p>
                          <div className="text-xs text-gray-500">
                            {student.major} • {student.studentId}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-700 bg-red-900/20 hover:bg-red-900/40 text-red-300 hover:text-red-200"
                          onClick={() => handleRemoveFollowerClick(student)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery || major !== "All Majors"
                      ? "No students match your search criteria"
                      : "You have no followers yet"}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {/* Unfollow Confirmation Dialog */}
      <UnfollowConfirmationDialog
        isOpen={showUnfollowDialog}
        onClose={handleCancelUnfollow}
        onConfirm={handleConfirmUnfollow}
        user={userToUnfollow}
      />

      <RemoveFollowerConfirmationDialog
        isOpen={showRemoveFollowerDialog}
        onClose={handleCancelRemoveFollower}
        onConfirm={handleConfirmRemoveFollower}
        user={followerToRemove}
      />
    </div>
  );
}
