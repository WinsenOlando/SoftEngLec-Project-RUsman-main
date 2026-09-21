import Dashboard from "@/components/Dashboard";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const user = localStorage.getItem("user");
  const userRole = user ? JSON.parse(user).role : null;
  const navigate = useNavigate();

  if (userRole === "Admin") {
    navigate("/admin");
  }

  return (
    <main className="flex min-h-screen bg-gray-950">
      <Dashboard />
    </main>
  );
}
