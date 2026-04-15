import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  BedDouble,
  CircleUserRound,
  CreditCard,
  DoorOpen,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import StudentNavbar from "../components/StudentNavbar";
import { useAuth } from "../hooks/useAuth";
import axiosInstance from "../lib/axios";
import { getErrorMessage } from "../lib/errors";

const ACTIVE_BOOKING_STATUSES = new Set(["PENDING", "CONFIRMED"]);

const DashboardCard = ({ badge, colorClass, description, icon: Icon, onClick, title }) => (
  <button
    type="button"
    onClick={onClick}
    className="group text-left relative bg-[#15202b]/40 border border-white/5 p-8 rounded-4xl backdrop-blur-md hover:bg-[#15202b]/60 transition-all cursor-pointer shadow-xl overflow-hidden w-full"
  >
    <div className={`absolute -top-4 -right-4 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity ${colorClass}`}>
      <Icon size={120} />
    </div>

    <div className="relative z-10 space-y-6">
      <div className="flex justify-between items-start">
        <div className={`p-4 rounded-2xl bg-white/5 ${colorClass}`}>
          <Icon size={24} />
        </div>
        {badge ? (
          <span className="text-[9px] font-black uppercase tracking-widest bg-[#137fec]/10 text-[#137fec] px-2 py-1 rounded-full border border-[#137fec]/20">
            {badge}
          </span>
        ) : null}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white group-hover:text-[#137fec] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-[#137fec] opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2.5 group-hover:translate-x-0">
        Open <ArrowRight size={12} />
      </div>
    </div>
  </button>
);

const SummaryTile = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-5 p-6 bg-[#15202b]/40 border border-white/5 rounded-3xl backdrop-blur-md">
    <div className="p-3 bg-white/5 rounded-xl text-[#137fec]">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-lg font-bold text-white tracking-tight">{value}</p>
    </div>
  </div>
);

const formatStatusLabel = (status) =>
  status ? status.replaceAll("_", " ").toLowerCase().replace(/^\w/, (match) => match.toUpperCase()) : "None";

const getHostelName = (hostels, hostelId) =>
  hostels.find((hostel) => hostel.hostel_id === hostelId)?.hostel_name || `Hostel #${hostelId}`;

const getLatestActiveBooking = (bookings) =>
  bookings.find((booking) => ACTIVE_BOOKING_STATUSES.has(booking.status)) || null;

function StudentDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [bookingWindowOpen, setBookingWindowOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);

      try {
        const [bookingsResponse, hostelsResponse] = await Promise.all([
          axiosInstance.get("/bookings/me"),
          axiosInstance.get("/hostels"),
        ]);

        if (!isMounted) {
          return;
        }

        setBookings(bookingsResponse.data?.data?.bookings || []);
        setHostels(hostelsResponse.data?.data?.hostels || []);
        setBookingWindowOpen(Boolean(hostelsResponse.data?.data?.booking_window_open));
      } catch (error) {
        if (isMounted) {
          toast.error(getErrorMessage(error, "Unable to load dashboard"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (user?.roll_number) {
      loadDashboard();
    }

    return () => {
      isMounted = false;
    };
  }, [user?.roll_number]);

  const latestActiveBooking = getLatestActiveBooking(bookings);
  const pendingBooking = bookings.find((booking) => booking.status === "PENDING") || null;
  const confirmedBooking = bookings.find((booking) => booking.status === "CONFIRMED") || null;
  const activeHostelName = latestActiveBooking
    ? getHostelName(hostels, latestActiveBooking.hostel_id)
    : "No active booking";

  const handleBookingAction = () => {
    if (pendingBooking) {
      navigate(`/student/payment?bookingId=${pendingBooking._id}`);
      return;
    }

    navigate("/student/booking");
  };

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200 font-sans selection:bg-[#137fec]/30">
      <StudentNavbar />

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-125 h-125 bg-[#137fec]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-100 h-100 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto pt-28 pb-12 px-6 lg:px-8 space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-[#137fec]/10 border border-[#137fec]/20">
                <LayoutDashboard size={16} className="text-[#137fec]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#137fec]">
                Student Console
              </span>
            </div>
            <h1 className="text-white font-medium text-4xl tracking-tight leading-none">
              Welcome back,{" "}
              <span className="font-black italic">
                {user?.name?.split(" ")[0] || "Resident"}
              </span>
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-2">
              Track your live hostel booking, payment hold, and final room allocation.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#15202b]/40 border border-white/5 backdrop-blur-md">
            <ShieldCheck size={18} className="text-emerald-500" />
            <div className="text-left">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Booking Window
              </p>
              <p className="text-xs font-bold text-white uppercase">
                {bookingWindowOpen ? "Open" : "Closed"}
              </p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryTile icon={CircleUserRound} label="Roll Number" value={String(user?.roll_number || "--")} />
          <SummaryTile icon={DoorOpen} label="Current Status" value={formatStatusLabel(latestActiveBooking?.status)} />
          <SummaryTile icon={BedDouble} label="Active Hostel" value={activeHostelName} />
        </section>

        <section className="bg-[#15202b]/40 border border-white/5 rounded-[40px] p-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">
                Live Booking Snapshot
              </p>
              {isLoading ? (
                <p className="text-sm text-slate-400">Loading current booking state...</p>
              ) : latestActiveBooking ? (
                <>
                  <h2 className="text-2xl font-black text-white">
                    {activeHostelName} / Room {latestActiveBooking.room_number}
                  </h2>
                  <p className="text-sm text-slate-400 mt-2">
                    Status:{" "}
                    <span className="text-white font-bold">
                      {formatStatusLabel(latestActiveBooking.status)}
                    </span>
                    {pendingBooking ? " - complete payment before the hold expires." : ""}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-white">No active booking yet</h2>
                  <p className="text-sm text-slate-400 mt-2">
                    Browse eligible hostels and place a room on hold when the booking window is open.
                  </p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleBookingAction}
              className="px-6 py-3 bg-[#137fec] hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#137fec]/20 transition-all cursor-pointer"
            >
              {pendingBooking ? "Complete Payment" : confirmedBooking ? "View Booking" : "Browse Hostels"}
            </button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 ml-2">
            <ShieldCheck size={16} className="text-[#137fec]" />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
              Residential Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard
              title="Official Profile"
              description="View your authenticated student profile and current hostel allocation from the backend."
              icon={CircleUserRound}
              onClick={() => navigate("/student/profile")}
              colorClass="text-blue-500"
            />
            <DashboardCard
              title={pendingBooking ? "Complete Payment" : "Booking Portal"}
              description={
                pendingBooking
                  ? "You already have a pending room hold. Continue payment to confirm the allocation."
                  : "Browse eligible hostels, inspect rooms, and create a live booking hold."
              }
              icon={DoorOpen}
              onClick={handleBookingAction}
              colorClass="text-emerald-500"
              badge={pendingBooking ? "Pending Hold" : bookingWindowOpen ? "Window Open" : "Window Closed"}
            />
            <DashboardCard
              title="Payment Status"
              description="Review the payment session tied to your latest pending or confirmed booking."
              icon={CreditCard}
              onClick={() =>
                navigate(
                  pendingBooking
                    ? `/student/payment?bookingId=${pendingBooking._id}`
                    : "/student/payment"
                )
              }
              colorClass="text-purple-500"
              badge={confirmedBooking ? "Confirmed" : pendingBooking ? "Awaiting Payment" : null}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentDashboardPage;
