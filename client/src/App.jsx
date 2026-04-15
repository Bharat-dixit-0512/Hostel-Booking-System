import React from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "./components/ProtectedRoute.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminProfile from "./pages/AdminProfile";
import ApplicationRegistryPage from "./pages/ApplicationRegistryPage.jsx";
import BookingCountdownPage from "./pages/BookingCountdownPage.jsx";
import BrowseHostelsPage from "./pages/BrowseHostelsPage.jsx";
import ConfirmedBookingsPage from "./pages/ConfirmedBookingsPage.jsx";
import FCFSAnalytics from "./pages/FCFSAnalytics.jsx";
import InventoryConfigPage from "./pages/InventoryConfig.jsx";
import LoginPage from "./pages/LoginPage";
import ManualBookingPage from "./pages/ManualBookingPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import RoomSwapDashboard from "./pages/RoomSwapDashboard.jsx";
import AdminSwapApprovalPage from "./pages/SwapApprovalPage.jsx";
import StudentDashboardPage from "./pages/StudentDashboardPage.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";

function App() {
  return (
    <div className="min-h-screen bg-[#101922] relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-125 h-125 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-100 h-100 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 min-h-screen">
        <Routes>
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedLoginTypes={["admin"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedLoginTypes={["admin"]}>
                <AdminProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manual-booking"
            element={
              <ProtectedRoute allowedLoginTypes={["admin"]}>
                <ManualBookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/application-registry"
            element={
              <ProtectedRoute allowedLoginTypes={["admin"]}>
                <ApplicationRegistryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-hostels"
            element={
              <ProtectedRoute allowedLoginTypes={["admin"]}>
                <InventoryConfigPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/confirmed-bookings"
            element={
              <ProtectedRoute allowedLoginTypes={["admin"]}>
                <ConfirmedBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fcfs-analytics"
            element={
              <ProtectedRoute allowedLoginTypes={["admin"]}>
                <FCFSAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/swap-approvals"
            element={
              <ProtectedRoute allowedLoginTypes={["admin"]}>
                <AdminSwapApprovalPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedLoginTypes={["student"]}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedLoginTypes={["student"]}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/booking-countdown"
            element={
              <ProtectedRoute allowedLoginTypes={["student"]}>
                <BookingCountdownPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/room-swap"
            element={
              <ProtectedRoute allowedLoginTypes={["student"]}>
                <RoomSwapDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/booking"
            element={
              <ProtectedRoute allowedLoginTypes={["student"]}>
                <BrowseHostelsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/payment"
            element={
              <ProtectedRoute allowedLoginTypes={["student"]}>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
        </Routes>

        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "#15202b",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
            },
          }}
        />
      </div>
    </div>
  );
}

export default App;
