import { Link } from "react-router-dom";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-900 to-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-400">Welcome Back</h1>
          <p className="text-pink-300 mt-2">Sign in to your account</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
