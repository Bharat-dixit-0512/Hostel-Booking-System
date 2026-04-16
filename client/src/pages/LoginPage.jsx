import React, { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../lib/errors";

const getDefaultRoute = (loginType) =>
  loginType === "admin" ? "/admin/dashboard" : "/student/dashboard";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthActionPending } = useAuth();
  const [isStudent, setIsStudent] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const toastId = toast.loading("Authenticating...");

    try {
      const loginType = isStudent ? "student" : "admin";
      const user = await login({
        email: formData.email.trim(),
        password: formData.password,
        loginType,
      });
      const fallbackRoute = getDefaultRoute(user?.login_type);
      const requestedPath = location.state?.from?.pathname;
      const nextPath =
        requestedPath &&
        ((user?.login_type === "student" && requestedPath.startsWith("/student/")) ||
          (user?.login_type === "admin" && requestedPath.startsWith("/admin/")))
          ? requestedPath
          : fallbackRoute;

      toast.success(`Welcome back, ${user?.name || "User"}`, { id: toastId });
      navigate(nextPath, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to sign in"), { id: toastId });
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-slate-900 dark:text-white bg-[#101922] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          alt="University campus buildings at dusk"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnXKleNz5LerblYDkOheUbGHPZ9XQLFW3caEN32IE50czVqgCn7gCham6diXu4UFu0XhwYRxTbtWr7DtazHYO5dTNHgMpmNiM-eGvgIRPjcgaxtItsRAfivUmeN0un0_WqoMXCBQ6fKiNpMRdvMULv2YRJr6aji_9lF_ZwtSE-Edfvy3Tni1k9I5ZtL7P3MQH9zyM3FkJFpcqIdFHxyt1kn83Azj582Kot1D8fumKPoOGnnlOwtix6HkAv1TvHcwddb9rTyo0c4-Y"
        />
        <div className="absolute inset-0 bg-[#101922]/90 bg-blend-multiply" />
        <div className="absolute -top-[20%] -left-[10%] w-96 h-96 bg-[#137fec]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <main className="relative z-10 grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md animate-[fadeIn_0.5s_ease-out]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#137fec]/10 mb-4 border border-[#137fec]/20 shadow-[0_0_15px_rgba(19,127,236,0.3)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-[#137fec]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.24 50.552 50.552 0 00-2.658.813m-15.482 0A50.55 50.55 0 0112 13.489a50.551 50.551 0 0112-4.82 50.55 50.55 0 01-5.223 9.58m-13.553-.33c-.88 5.895 2.76 9.698 2.76 9.698"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              GLA University
            </h1>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">
              Hostel Allocation Portal
            </p>
          </div>

          <div
            className="rounded-xl shadow-2xl p-8 transition-all duration-300 backdrop-blur-md"
            style={{
              backgroundColor: "rgba(24, 36, 48, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-emerald-400">
                  Live Backend Auth
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">Session Cookies Enabled</span>
            </div>

            <div className="bg-[#101922]/50 p-1 rounded-lg flex mb-8 border border-white/5 relative">
              <button
                type="button"
                onClick={() => setIsStudent(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isStudent
                    ? "bg-[#137fec] text-white shadow-lg shadow-[#137fec]/25"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setIsStudent(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
                  !isStudent
                    ? "bg-[#137fec] text-white shadow-lg shadow-[#137fec]/25"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  className="block text-sm font-medium text-slate-300"
                  htmlFor="email"
                >
                  Email ID
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isAuthActionPending}
                  placeholder={isStudent ? "student@gla.ac.in" : "admin@gla.ac.in"}
                  className="block w-full px-4 py-2.5 bg-[#101922]/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] sm:text-sm transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="block text-sm font-medium text-slate-300"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isAuthActionPending}
                    placeholder="Enter your password"
                    className="block w-full px-4 py-2.5 pr-12 bg-[#101922]/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] sm:text-sm transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-white cursor-pointer"
                    onClick={() => setShowPassword((currentValue) => !currentValue)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthActionPending}
                className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#137fec] hover:bg-blue-600 focus:outline-none transition-all duration-200 cursor-pointer disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                {isAuthActionPending ? "Signing in..." : "Secure Login"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
