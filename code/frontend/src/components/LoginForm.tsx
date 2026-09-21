"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    other: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errors.other) {
      setErrors((prev) => ({ ...prev, other: "" }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "", other: "" };

    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    } else if (!formData.email.endsWith("@binus.ac.id")) {
      newErrors.email = "Email must be a @binus.ac.id account";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8888/login-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 404) {
        setErrors({ email: "", password: "Wrong Password", other: "" });
        setIsLoading(false);
        return;
      }

      if (response.status === 401) {
        setErrors({
          email: "",
          password: "Wrong password.",
          other: "Invalid credentials!",
        });
        setIsLoading(false);
        return;
      }

      const result = await response.json();

      localStorage.setItem("user", JSON.stringify(result));

      if (result.id != null) {
        if (result.role === "User") {
          navigate("/home");
        } else if (result.role === "Admin") {
          navigate("/admin");
        }
      } else {
        setErrors({
          email: "",
          password: "",
          other: "Unknown error occurred.",
        });
      }
    } catch (error) {
      setErrors({
        email: "",
        password: "",
        other: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-pink-800 bg-gray-900 shadow-lg">
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-pink-400">
              Email
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MailIcon className="h-5 w-5 text-pink-500" />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@binus.ac.id"
                value={formData.email}
                onChange={handleChange}
                className={`pl-10 bg-gray-800 border-pink-700 focus:border-pink-500 text-white ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-pink-400">
              Password
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <LockIcon className="h-5 w-5 text-pink-500" />
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`pl-10 bg-gray-800 border-pink-700 focus:border-pink-500 text-white ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-pink-400 hover:text-pink-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* BARU: Tampilkan error lain (account doesn't exist, dsb) */}
          {errors.other && (
            <div className="text-red-400 text-sm mt-1">{errors.other}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white mt-3"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
