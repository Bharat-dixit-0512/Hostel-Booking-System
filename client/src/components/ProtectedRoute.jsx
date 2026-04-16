import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const FullScreenLoader = () => (
  <div className="min-h-screen bg-[#101922] text-slate-200 flex items-center justify-center px-6">
    <div className="text-center space-y-3">
      <div className="mx-auto h-12 w-12 rounded-full border-4 border-[#137fec]/20 border-t-[#137fec] animate-spin" />
      <p className="text-sm font-semibold text-slate-300">Loading portal session...</p>
    </div>
  </div>
);

const getHomeRoute = (user) =>
  user?.login_type === "admin" ? "/admin/dashboard" : "/student/dashboard";

export const ProtectedRoute = ({ allowedLoginTypes, children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (
    Array.isArray(allowedLoginTypes) &&
    allowedLoginTypes.length > 0 &&
    !allowedLoginTypes.includes(user?.login_type)
  ) {
    return <Navigate to={getHomeRoute(user)} replace />;
  }

  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={getHomeRoute(user)} replace />;
  }

  return children;
};
