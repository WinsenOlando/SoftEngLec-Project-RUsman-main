import { UserRegistration } from "@/components/UserRegistration";
import { UserDeactivation } from "@/components/UserDeactivation";
import { Users, UserX, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminLandingPage() {
  const user = localStorage.getItem("user");
  const userRole = user ? JSON.parse(user).role : null;
  const navigate = useNavigate();

  if (userRole !== "Admin") {
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-tl from-pink-900 to-black">
      {/* Header */}
      <header className="border-b border-pink-500/20 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Shield
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/login");
              }} 
              className="h-8 w-8 text-pink-400 cursor-pointer"
            />
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome, Administrator
          </h2>
          <p className="text-pink-200 text-lg max-w-2xl mx-auto">
            Manage user accounts with ease. Register new users or deactivate
            existing accounts using the tools below.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* User Registration Section */}
          <div className="bg-black/40 backdrop-blur-sm border border-pink-500/30 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-pink-400" />
              <h3 className="text-2xl font-semibold text-white">
                Register New User
              </h3>
            </div>
            <p className="text-pink-200 mb-6">
              Add new users to the system by filling out their complete profile
              information.
            </p>
            <UserRegistration />
          </div>

          {/* User Deactivation Section */}
          <div className="bg-black/40 backdrop-blur-sm border border-pink-500/30 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <UserX className="h-6 w-6 text-pink-400" />
              <h3 className="text-2xl font-semibold text-white">
                Deactivate User Account
              </h3>
            </div>
            <p className="text-pink-200 mb-6">
              Deactivate user accounts by entering their email address.
            </p>
            <UserDeactivation />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-pink-500/20 bg-black/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-pink-200">
            © 2024 Admin Dashboard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
