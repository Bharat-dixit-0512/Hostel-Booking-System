import React, { useEffect, useState } from "react";
import {
  Bed,
  Building2,
  ChevronRight,
  DoorOpen,
  Hash,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import AnimatedBorder from "../components/AnimatedBorder";
import StudentNavbar from "../components/StudentNavbar";
import { useAuth } from "../hooks/useAuth";
import axiosInstance from "../lib/axios";
import { getErrorMessage } from "../lib/errors";

const InfoTile = ({ icon, label, value, color = "text-white" }) => (
  <div className="p-4 rounded-2xl bg-[#0b1118]/40 border border-white/5 flex items-center gap-4 hover:border-[#137fec]/40 hover:bg-[#0b1118]/60 transition-all group cursor-default">
    <div className="p-2.5 rounded-lg bg-white/5 text-slate-400 group-hover:text-[#137fec] transition-colors shrink-0">
      {React.cloneElement(icon, { size: 18, strokeWidth: 2.5 })}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-1 leading-none">
        {label}
      </p>
      <p className={`text-sm font-bold truncate ${color}`}>{value || "N/A"}</p>
    </div>
  </div>
);

const ActionBtn = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-white/5 border border-white/5 hover:bg-[#137fec]/10 hover:border-[#137fec]/20 text-xs font-bold text-slate-400 hover:text-white transition-all group cursor-pointer"
  >
    <span>{label}</span>
    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-[#137fec]" />
  </button>
);

const getHostelName = (hostels, hostelId) =>
  hostels.find((hostel) => hostel.hostel_id === hostelId)?.hostel_name || `Hostel #${hostelId}`;

function StudentProfile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [latestBooking, setLatestBooking] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProfileExtras = async () => {
      setIsRefreshing(true);

      try {
        const [bookingsResponse, hostelsResponse] = await Promise.all([
          axiosInstance.get("/bookings/me"),
          axiosInstance.get("/hostels"),
          refreshUser(),
        ]);

        if (!isMounted) {
          return;
        }

        setLatestBooking(bookingsResponse.data?.data?.bookings?.[0] || null);
        setHostels(hostelsResponse.data?.data?.hostels || []);
      } catch (error) {
        if (isMounted) {
          toast.error(getErrorMessage(error, "Unable to load profile"));
        }
      } finally {
        if (isMounted) {
          setIsRefreshing(false);
        }
      }
    };

    if (user?.roll_number) {
      loadProfileExtras();
    }

    return () => {
      isMounted = false;
    };
  }, [refreshUser, user?.roll_number]);

  const hostelId = latestBooking?.hostel_id ?? user?.hostel_id ?? null;
  const hostelName = hostelId ? getHostelName(hostels, hostelId) : "Not allocated";
  const roomNumber = latestBooking?.room_number ?? user?.room_number ?? "Not allocated";
  const bookingStatus = latestBooking?.status || (user?.room_allocated ? "CONFIRMED" : "NO BOOKING");
  const avatarSeed = encodeURIComponent(user?.name || "student");

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200 font-sans pb-16 selection:bg-[#137fec]/30">
      <StudentNavbar />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-125 h-125 bg-[#137fec]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-100 h-100 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto pt-28 px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#15202b]/40 border border-white/5 rounded-4xl backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="h-32 bg-linear-to-r from-[#137fec]/20 to-transparent border-b border-white/5" />

              <div className="px-8 pb-10">
                <div className="relative -mt-16 mb-8 flex flex-col md:flex-row md:items-end gap-6">
                  <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-[#101922] bg-[#15202b] shadow-2xl">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
                      {user?.name || "Student"}
                    </h2>
                    <div className="flex items-center gap-2 text-[#137fec] font-bold text-xs uppercase tracking-[0.2em]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isRefreshing ? "Refreshing profile" : "Authenticated Student Profile"}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        latestBooking?._id ? `/student/payment?bookingId=${latestBooking._id}` : "/student/booking"
                      )
                    }
                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                  >
                    <DoorOpen size={14} />
                    {latestBooking?.status === "PENDING" ? "Open Payment" : "Open Booking"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoTile icon={<User />} label="Full Name" value={user?.name} />
                  <InfoTile
                    icon={<Hash />}
                    label="Roll Number"
                    value={String(user?.roll_number || "")}
                    color="text-[#137fec]"
                  />
                  <InfoTile icon={<Mail />} label="Email ID" value={user?.email} />
                  <InfoTile icon={<Building2 />} label="Hostel" value={hostelName} />
                  <InfoTile icon={<Bed />} label="Room" value={roomNumber} />
                  <InfoTile
                    icon={<ShieldCheck />}
                    label="Booking Status"
                    value={bookingStatus}
                    color={bookingStatus === "CONFIRMED" ? "text-emerald-400" : "text-orange-400"}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <AnimatedBorder>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-xl bg-[#137fec]/10 border border-[#137fec]/20 text-[#137fec]">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-none">Quick Actions</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">
                      Live Backend
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <ActionBtn label="Browse Eligible Hostels" onClick={() => navigate("/student/booking")} />
                  <ActionBtn
                    label={latestBooking?.status === "PENDING" ? "Complete Pending Payment" : "Open Payment Center"}
                    onClick={() =>
                      navigate(
                        latestBooking?._id ? `/student/payment?bookingId=${latestBooking._id}` : "/student/payment"
                      )
                    }
                  />
                  <ActionBtn label="Refresh Profile Data" onClick={() => window.location.reload()} />
                </div>
              </div>
            </AnimatedBorder>

            <div className="bg-[#15202b]/40 border border-white/5 p-6 rounded-3xl text-center backdrop-blur-md">
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">
                Academic Year {user?.year || "N/A"} / {user?.gender || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentProfile;
