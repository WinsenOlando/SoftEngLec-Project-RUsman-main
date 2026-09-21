export default interface Event {
  id: string;
  userId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  category: string;
  location: string;
  participants: { id: number; name: string; avatar: string }[];
  createdBy: { id: string; name: string };
  invitationStatus: string;
}
