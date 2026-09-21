export interface User {
  id: string;
  name: string;
  studentId: string;
  email: string;
  major: string;
  role: string;
  password: string;
  profilePicture: string;
  isActive: boolean;
}

export interface Schedule {
  id: string;
  userId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  participants: User[];
  recurringUntil: string;
  color: string;
  date?: string; // format: YYYY-MM-DD
  week?: number; // optional, for weekly grouping
  day?: string; // optional, for day of week (Mon, Tue, ...)
}

export interface ScheduleInvitation {
  schedule: Schedule;
  user: User;
  status: string;
}

export interface UserFollowDetails {
  user: User;
  following: User[];
  follower: User[];
  followingPending: User[];
}