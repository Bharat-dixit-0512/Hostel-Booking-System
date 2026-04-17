import React from "react";
import {
  Activity,
  ChevronRight,
  Hash,
  Mail,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminNavbar from "../components/AdminNavbar";
import AnimatedBorder from "../components/AnimatedBorder";
import ThemePreferenceCard from "../components/ThemePreferenceCard";
import { useAuth } from "../hooks/useAuth";

const AdminInfoTile = ({ icon, label, value, color = "text-white" }) => (
  <div className="p-4 rounded-2xl bg-[#0b1118]/40 border border-white/5 flex items-center gap-4 hover:border-emerald-500/40 hover:bg-[#0b1118]/60 transition-all group cursor-default">
    <div className="p-2.5 rounded-lg bg-white/5 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0">
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

const AdminActionBtn = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-white/5 border border-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 text-xs font-bold text-slate-400 hover:text-white transition-all group cursor-pointer"
  >
    <span>{label}</span>
    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-emerald-500" />
  </button>
);

function AdminProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const avatarSeed = encodeURIComponent(user?.name || "admin");

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200 font-sans pb-16 selection:bg-emerald-500/30">
      <AdminNavbar />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-125 h-125 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-100 h-100 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto pt-28 px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#15202b]/40 border border-white/5 rounded-4xl backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="h-32 bg-linear-to-r from-emerald-500/20 to-transparent border-b border-white/5" />

              <div className="px-8 pb-10">
                <div className="relative -mt-16 mb-8 flex flex-col md:flex-row md:items-end gap-6">
                  <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-[#101922] bg-[#15202b] shadow-2xl">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                      alt="Admin"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
                      {user?.name || "Administrator"}
                    </h2>
                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-[0.2em]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{user?.role || "admin"}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AdminInfoTile icon={<User />} label="Full Name" value={user?.name} />
                  <AdminInfoTile
                    icon={<Hash />}
                    label="Employee ID"
                    value={String(user?.employee_id || "")}
                    color="text-emerald-500"
                  />
                  <AdminInfoTile icon={<Mail />} label="Admin Email" value={user?.email} />
                  <AdminInfoTile
                    icon={<ShieldAlert />}
                    label="Role"
                    value={user?.role || "N/A"}
                  />
                  <AdminInfoTile
                    icon={<Activity />}
                    label="Login Type"
                    value={user?.login_type || "admin"}
                    color="text-emerald-400"
                  />
                  <AdminInfoTile
                    icon={<ShieldCheck />}
                    label="Permissions"
                    value={user?.role === "mainadmin" ? "Full Access" : "Operational Access"}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <AnimatedBorder>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-none">Management</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">
                      Live Routes
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <AdminActionBtn label="Open Inventory Config" onClick={() => navigate("/admin/manage-hostels")} />
                  <AdminActionBtn label="Open Booking Registry" onClick={() => navigate("/admin/confirmed-bookings")} />
                  <AdminActionBtn label="Open Manual Allotment" onClick={() => navigate("/admin/manual-booking")} />
                </div>
              </div>
            </AnimatedBorder>

            <ThemePreferenceCard
              accentTextClass="text-emerald-500"
              accentSurfaceClass="bg-emerald-500/10"
              accentBorderClass="border-emerald-500/20"
              accentGlowClass="shadow-[0_0_20px_rgba(16,185,129,0.16)]"
              accentLabel="Profile Switch"
            />

            <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl text-center backdrop-blur-md">
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.3em]">
                Administrative Console
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminProfile;
