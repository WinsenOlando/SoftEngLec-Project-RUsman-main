import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

const academicMajors = [
  "Computer Science",
  "Engineering",
  "Business Administration",
  "Psychology",
  "Biology",
  "Mathematics",
  "English Literature",
  "History",
  "Physics",
  "Chemistry",
  "Economics",
  "Political Science",
  "Art & Design",
  "Music",
  "Philosophy",
];

export function UserRegistration() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function registerStudent(formData: FormData) {
  const dto = {
    id: "",
    name: formData.get("fullName") as string,
    studentId: formData.get("studentId") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: "User",
    major: formData.get("major") as string,
    profilePicture: "https://lneeoekvbhpekkzmvlwz.supabase.co/storage/v1/object/public/medias//MountainWallpaper.jpg",
    isActive: true,
  };

  const res = await fetch("http://localhost:8888/register-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Registration failed");
  }

  return true;
}

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();
    const major = formData.get("major")?.toString();
    const studentId = formData.get("studentId")?.toString().trim();

    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword ||
      !major ||
      !studentId
    ) {
      setMessage({ type: "error", text: "There must not be an empty field!" });
      setIsSubmitting(false);
      return;
    }

    if (!email.endsWith("@binus.ac.id")) {
      setMessage({ type: "error", text: "Email must end with @binus.ac.id" });
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      setIsSubmitting(false);
      return;
    }
    try {
      await registerStudent(formData);
      setMessage({ type: "success", text: "User registered successfully!" });
      e.currentTarget.reset();
    }
    finally {
      setIsSubmitting(false);
    }

  };

  return (
    <Card className="bg-pink-950/20 border-pink-500/30">
      <CardContent className="p-6">
        <form
          id="registration-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-pink-100">
              Full Name
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              className="bg-black/50 border-pink-500/50 text-white placeholder:text-pink-300/50 focus:border-pink-400"
              placeholder="Enter full name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-pink-100">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              className="bg-black/50 border-pink-500/50 text-white placeholder:text-pink-300/50 focus:border-pink-400"
              placeholder="Enter email address"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-pink-100">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="bg-black/50 border-pink-500/50 text-white placeholder:text-pink-300/50 focus:border-pink-400 pr-10"
                placeholder="Enter password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-pink-300 hover:text-pink-100"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-pink-100">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="bg-black/50 border-pink-500/50 text-white placeholder:text-pink-300/50 focus:border-pink-400 pr-10"
                placeholder="Confirm password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-pink-300 hover:text-pink-100"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Academic Major */}
          <div className="space-y-2">
            <Label htmlFor="major" className="text-pink-100">
              Academic Major
            </Label>
            <Select name="major">
              <SelectTrigger className="bg-black/50 border-pink-500/50 text-white focus:border-pink-400">
                <SelectValue placeholder="Select academic major" />
              </SelectTrigger>
              <SelectContent className="bg-black border-pink-500/50">
                {academicMajors.map((major) => (
                  <SelectItem
                    key={major}
                    value={major}
                    className="text-white hover:bg-pink-900/50"
                  >
                    {major}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Student ID */}
          <div className="space-y-2">
            <Label htmlFor="studentId" className="text-pink-100">
              Student ID Number
            </Label>
            <Input
              id="studentId"
              name="studentId"
              type="text"
              className="bg-black/50 border-pink-500/50 text-white placeholder:text-pink-300/50 focus:border-pink-400"
              placeholder="Enter student ID"
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-md ${
                message.type === "success"
                  ? "bg-green-900/50 text-green-200 border border-green-500/50"
                  : "bg-red-900/50 text-red-200 border border-red-500/50"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            {isSubmitting ? "Registering..." : "Register User"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
