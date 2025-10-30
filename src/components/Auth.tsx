"use client";

import type React from "react";
import { useState } from "react";
import { z } from "zod";
import axios from "axios";
import { Eye, EyeOff, Upload } from "lucide-react";
import api from "../APIs/Base_URL";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

// Dummy API client
// const apiClient = axios.create({
//   baseURL: "https://api.example.com",
//   timeout: 10000,
// });

// Dummy API endpoints
const authAPI = {
  login: async (data: LoginFormData) => {
    // Replace this with your real API endpoint
    return api.post("/auth/login", data);
  },
  signup: async (data: Omit<SignupFormData, "confirmPassword">) => {
    // Replace this with your real API endpoint
    return api.post("/auth/signup", data);
  },
  forgotPassword: async (email: string) => {
    // Replace this with your real API endpoint
    return api.post("/auth/forgot-password", { email });
  },
};

export default function Auth() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Login form state
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: "admin@example.com",
    password: "",
  });
  const [loginErrors, setLoginErrors] = useState<Partial<LoginFormData>>({});

  // Signup form state
  const [signupForm, setSignupForm] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [signupErrors, setSignupErrors] = useState<Partial<SignupFormData>>({});

  // Handle login form change
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    setLoginErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Handle signup form change
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
    setSignupErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Handle login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const validatedData = loginSchema.parse(loginForm);
      setLoading(true);

      // Call dummy API
      const response = await authAPI.login(validatedData);

      setMessage({
        type: "success",
        text: "Login successful! (Dummy API)",
      });

      // Reset form
      setLoginForm({ email: "admin@example.com", password: "" });
      console.log("Login response:", response.data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<LoginFormData> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof LoginFormData] = err.message as any;
          }
        });
        setLoginErrors(errors);
      } else if (axios.isAxiosError(error)) {
        setMessage({
          type: "error",
          text:
            error.response?.data?.message || "Login failed. Please try again.",
        });
      } else {
        setMessage({
          type: "error",
          text: "An error occurred. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle signup submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const validatedData = signupSchema.parse(signupForm);
      setLoading(true);

      // Call dummy API
      const { confirmPassword, ...signupData } = validatedData;
      const response = await authAPI.signup(signupData);

      setMessage({
        type: "success",
        text: "Signup successful! (Dummy API)",
      });

      // Reset form
      setSignupForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      console.log("Signup response:", response.data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<SignupFormData> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof SignupFormData] = err.message as any;
          }
        });
        setSignupErrors(errors);
      } else if (axios.isAxiosError(error)) {
        setMessage({
          type: "error",
          text:
            error.response?.data?.message || "Signup failed. Please try again.",
        });
      } else {
        setMessage({
          type: "error",
          text: "An error occurred. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    try {
      setLoading(true);
      await authAPI.forgotPassword(loginForm.email);
      setMessage({
        type: "success",
        text: "Password reset link sent to your email! (Dummy API)",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to send reset link. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            User Management System
          </h1>
          <p className="text-gray-600 text-sm">
            Sign in or create an account to manage users
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => {
              setActiveTab("signin");
              setMessage(null);
            }}
            className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
              activeTab === "signin"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab("signup");
              setMessage(null);
            }}
            className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
              activeTab === "signup"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === "signin" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder="admin@example.com"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  loginErrors.email
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-white"
                }`}
              />
              {loginErrors.email && (
                <p className="text-red-600 text-xs mt-1">{loginErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-10 ${
                    loginErrors.password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {loginErrors.password && (
                <p className="text-red-600 text-xs mt-1">
                  {loginErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2"
            >
              Forgot Password?
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={signupForm.name}
                onChange={handleSignupChange}
                placeholder="John Doe"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  signupErrors.name
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-white"
                }`}
              />
              {signupErrors.name && (
                <p className="text-red-600 text-xs mt-1">{signupErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={signupForm.email}
                onChange={handleSignupChange}
                placeholder="john@example.com"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  signupErrors.email
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-white"
                }`}
              />
              {signupErrors.email && (
                <p className="text-red-600 text-xs mt-1">
                  {signupErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={signupForm.password}
                  onChange={handleSignupChange}
                  placeholder="Create a password"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-10 ${
                    signupErrors.password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {signupErrors.password && (
                <p className="text-red-600 text-xs mt-1">
                  {signupErrors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={signupForm.confirmPassword}
                  onChange={handleSignupChange}
                  placeholder="Confirm your password"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-10 ${
                    signupErrors.confirmPassword
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {signupErrors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">
                  {signupErrors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
