import React, { useCallback, useEffect, useState } from "react";
import {
  BedDouble,
  CalendarClock,
  CheckCircle2,
  LayoutDashboard,
  ListChecks,
  Settings2,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import AdminNavbar from "../components/AdminNavbar";
import AnimatedBorder from "../components/AnimatedBorder";
import BookingWindowToggle from "../components/BookingWindowToggle";
import ResetSystemAction from "../components/ResetSystemAction";
import { useAuth } from "../hooks/useAuth";
import { useRealtimeRefresh } from "../hooks/useRealtimeRefresh";
import { useClickMouse } from "../hooks/ClickMouse";
import axiosInstance from "../lib/axios";
import { getErrorMessage } from "../lib/errors";
import { REALTIME_EVENTS } from "../lib/realtimeEvents";
import AnimatedLogout from "../components/AnimatedLogout";

const StatMini = ({ label, value, tone = "text-emerald-500" }) => (
  <div className="px-6 py-4 rounded-2xl bg-[#15202b]/60 border border-white/5 text-right backdrop-blur-md">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className={`text-2xl font-bold tracking-tighter ${tone}`}>{value}</p>
  </div>
);

const ActionCard = ({
  colorClass,
  description,
  icon: Icon,
  onClick,
  title,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="text-left bg-[#15202b]/40 border border-white/5 p-8 rounded-4xl backdrop-blur-md hover:bg-[#15202b]/60 transition-all group cursor-pointer hover:-translate-y-1 shadow-xl"
  >
    <div
      className={`p-4 rounded-2xl bg-white/5 w-fit mb-8 group-hover:scale-110 transition-transform ${colorClass}`}
    >
      {React.createElement(Icon, { size: 24 })}
    </div>
    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
      {title}
    </h3>
    <p className="text-xs text-slate-500 font-medium leading-relaxed">
      {description}
    </p>
  </button>
);

const countByStatus = (bookings, status) =>
  bookings.filter((booking) => booking.status === status).length;

const ADMIN_DASHBOARD_EVENTS = [
  REALTIME_EVENTS.BOOKING_CHANGED,
  REALTIME_EVENTS.INVENTORY_CHANGED,
  REALTIME_EVENTS.BOOKING_WINDOW_UPDATED,
  REALTIME_EVENTS.SESSION_RESET,
];

function AdminDashboardPage() {
  const navigate = useNavigate();
  const playClickSound = useClickMouse();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingWindow, setIsUpdatingWindow] = useState(false);
  const [bookingWindowOpen, setBookingWindowOpen] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [eligibleStudentsCount, setEligibleStudentsCount] = useState(0);

  const isMainAdmin = user?.role === "mainadmin";

  const loadDashboard = useCallback(
    async ({ showLoading = true, showErrors = true } = {}) => {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const [
          hostelsResponse,
          bookingsResponse,
          bookingWindowResponse,
          eligibleStudentsResponse,
        ] = await Promise.all([
          axiosInstance.get("/admin/hostels"),
          axiosInstance.get("/admin/bookings"),
          axiosInstance.get("/admin/booking-window"),
          axiosInstance.get("/admin/eligible-students"),
        ]);

        setHostels(hostelsResponse.data?.data?.hostels || []);
        setBookings(bookingsResponse.data?.data?.bookings || []);
        setBookingWindowOpen(
          Boolean(bookingWindowResponse.data?.data?.booking_window_open),
        );
        setEligibleStudentsCount(
          Number(eligibleStudentsResponse.data?.data?.count) ||
            (eligibleStudentsResponse.data?.data?.students || []).length,
        );
      } catch (error) {
        if (showErrors) {
          toast.error(getErrorMessage(error, "Unable to load admin dashboard"));
        }
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (user?.employee_id) {
      loadDashboard();
    }
  }, [loadDashboard, user?.employee_id]);

  useRealtimeRefresh({
    enabled: Boolean(user?.employee_id),
    events: ADMIN_DASHBOARD_EVENTS,
    onRefresh: () =>
      loadDashboard({ showLoading: false, showErrors: false }),
  });

  const navigateTo = (path) => {
    playClickSound();
    navigate(path);
  };

  const handleToggleBookingWindow = async (nextState) => {
    setIsUpdatingWindow(true);
    const toastId = toast.loading(
      `Turning booking window ${nextState ? "on" : "off"}...`,
    );

    try {
      const response = await axiosInstance.patch("/admin/booking-window", {
        is_open: nextState,
      });

      setBookingWindowOpen(Boolean(response.data?.data?.booking_window_open));
      toast.success(
        `Booking window ${nextState ? "opened" : "closed"} successfully`,
        {
          id: toastId,
        },
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update booking window"), {
        id: toastId,
      });
    } finally {
      setIsUpdatingWindow(false);
    }
  };

  const confirmedBookings = countByStatus(bookings, "CONFIRMED");
  const pendingBookings = countByStatus(bookings, "PENDING");
  const availableBeds = hostels.reduce(
    (totalBeds, hostel) => totalBeds + (hostel.available_beds || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200 font-sans selection:bg-emerald-500/30">
      <AdminNavbar />

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-150 h-150 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-125 h-125 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto pt-28 pb-12 px-6 lg:px-8 space-y-10">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <LayoutDashboard size={16} className="text-emerald-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                System Administrator
              </span>
            </div>
            <h1 className="text-white font-medium text-4xl tracking-tight leading-none">
              Welcome back,{" "}
              <span className="font-black italic text-emerald-50">
                {user?.name || "Administrator"}
              </span>
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-2">
              Live hostel inventory, booking flow, and room allocation controls.
            </p>
          </div>

          <div className="flex gap-4 flex-wrap">
            <StatMini
              label="Confirmed Bookings"
              value={isLoading ? "..." : confirmedBookings}
            />
            <StatMini
              label="Pending Holds"
              value={isLoading ? "..." : pendingBookings}
              tone="text-orange-400"
            />
            <StatMini
              label="Available Beds"
              value={isLoading ? "..." : availableBeds}
              tone="text-blue-400"
            />
          </div>
        </header>

        <BookingWindowToggle
          disabled={!isMainAdmin}
          isOpen={bookingWindowOpen}
          isUpdating={isUpdatingWindow}
          onToggle={handleToggleBookingWindow}
        />

        {!isMainAdmin ? (
          <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 px-6 py-4 text-sm text-orange-200">
            Your current role is <span className="font-bold">{user?.role}</span>
            . Only the main admin can change booking window state or reset the
            system.
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ActionCard
            title="Inventory Config"
            description="Create hostels, manage rooms, and remove inventory using the live admin API."
            icon={Settings2}
            colorClass="text-emerald-400"
            onClick={() => navigateTo("/admin/manage-hostels")}
          />
          <ActionCard
            title="Manual Allotment"
            description="Create offline confirmed bookings for eligible students."
            icon={UserPlus}
            colorClass="text-blue-400"
            onClick={() => navigateTo("/admin/manual-booking")}
          />
          <ActionCard
            title="Booking Registry"
            description="Inspect current and historical bookings with live hostel linkage."
            icon={ListChecks}
            colorClass="text-purple-400"
            onClick={() => navigateTo("/admin/confirmed-bookings")}
          />
          <ActionCard
            title="Admin Profile"
            description="Review the currently authenticated admin account and role."
            icon={CalendarClock}
            colorClass="text-orange-400"
            onClick={() => navigateTo("/admin/profile")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <AnimatedBorder color="conic-gradient(from 90deg at 50% 50%, #00b050 0%, #101922 25%, #00b050 50%, #101922 75%, #00b050 100%)">
              <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 h-full bg-[#15202b]/40 backdrop-blur-md">
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-white tracking-tight">
                      Eligible Hostel Students
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {isLoading
                        ? "Loading eligible students..."
                        : `${eligibleStudentsCount} hostler students currently eligible in the system.`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo("/admin/application-registry")}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  Open Student List
                </button>
              </div>
            </AnimatedBorder>
          </div>
          <div className="lg:col-span-4">
            <AnimatedLogout>
              <ResetSystemAction
                disabled={!isMainAdmin}
                onSuccess={() =>
                  loadDashboard({ showLoading: false, showErrors: true })
                }
              />
            </AnimatedLogout>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#15202b]/40 border border-white/5 rounded-3xl p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Total Hostels
            </p>
            <p className="text-3xl font-black text-white mt-3">
              {isLoading ? "..." : hostels.length}
            </p>
          </div>
          <div className="bg-[#15202b]/40 border border-white/5 rounded-3xl p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Booking Window
            </p>
            <p
              className={`text-3xl font-black mt-3 ${bookingWindowOpen ? "text-emerald-400" : "text-red-400"}`}
            >
              {bookingWindowOpen ? "Open" : "Closed"}
            </p>
          </div>
          <div className="bg-[#15202b]/40 border border-white/5 rounded-3xl p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Free Capacity
            </p>
            <p className="text-3xl font-black text-white mt-3 flex items-center gap-2">
              <BedDouble size={22} className="text-blue-400" />
              {isLoading ? "..." : availableBeds}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboardPage;
