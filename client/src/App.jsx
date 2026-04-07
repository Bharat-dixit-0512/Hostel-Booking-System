import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

// --- AUTH PAGES ---
import LoginPage from './pages/LoginPage';

// --- ADMIN PAGES ---
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProfile from './pages/AdminProfile';
import ManualBookingPage from './pages/ManualBookingPage';
import ApplicationRegistryPage from './pages/ApplicationRegistryPage';
import ConfirmedBookingsPage from './pages/ConfirmedBookingsPage';
import InventoryConfigPage from './pages/InventoryConfig.jsx'; // Screenshot ke mutabiq
import FCFSAnalytics from './pages/FCFSAnalytics';

// --- STUDENT PAGES ---
import StudentDashboardPage from './pages/StudentDashboardPage';
import StudentProfile from './pages/StudentProfile';
import BookingCountdownPage from './pages/BookingCountdownPage';
import RoomSwapDashboard from './pages/RoomSwapDashboard';
import AdminSwapApprovalPage from './pages/SwapApprovalPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import BrowseHostelsPage from './pages/BrowseHostelsPage.jsx';

function App() {
  return (
    <div className="min-h-screen bg-[#101922] relative overflow-hidden">
      {/* Background Decor (Optional) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 min-h-screen">
        <Routes>
          {/* Public / Auth Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* --- ADMIN ROUTES --- */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/manual-booking" element={<ManualBookingPage />} />
          <Route path="/admin/application-registry" element={<ApplicationRegistryPage />} />
          <Route path="/admin/manage-hostels" element={<InventoryConfigPage />} />
          <Route path="/admin/confirmed-bookings" element={<ConfirmedBookingsPage />} />
          <Route path="/admin/fcfs-analytics" element={<FCFSAnalytics />} />
          <Route path="/admin/swap-approvals" element={<AdminSwapApprovalPage />} />

          {/* --- STUDENT ROUTES --- */}
          <Route path="/student/dashboard" element={<StudentDashboardPage />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          
          {/* FCFS Logic Specific Student Routes */}
          <Route path="/student/booking-countdown" element={<BookingCountdownPage />} />
          <Route path="/student/room-swap" element={<RoomSwapDashboard />} />

          <Route path="/student/booking" element={<BrowseHostelsPage />} />
          <Route path="/student/payment" element={<PaymentPage />} />
          
        </Routes>
        
        <Toaster 
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#15202b',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
            },
          }}
        />
      </div>
    </div>
  );
}

export default App;