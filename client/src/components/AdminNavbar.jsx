import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  LogOut,
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import AnimatedBorder from "./AnimatedBorder";
import { useClickMouse } from "../hooks/ClickMouse";
import AnimatedLogout from "./AnimatedLogout";

function AdminNavbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const playClickSound = useClickMouse();

  const handleAction = (path) => {
    playClickSound();
    setIsDropdownOpen(false);
    navigate(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#101922]/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/admin/dashboard"
          onClick={() => playClickSound()}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <div className="leading-none">
            <span className="text-white font-bold tracking-tight block">
              Admin Panel
            </span>
            <span className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em]">
              Hostel Portal
            </span>
          </div>
        </Link>

        <div className="relative">
          <button
            onClick={() => {
              playClickSound();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className="cursor-pointer"
          >
            <AnimatedBorder className="min-w-35" color="conic-gradient(from 90deg at 50% 50%, #00b050 0%, #101922 25%, #00b050 50%, #101922 75%, #00b050 100%)">
              <div className="px-3 py-1.5 flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-500">
                  AD
                </div>
                <span className="text-xs font-bold text-slate-200">
                  Administrator
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>
            </AnimatedBorder>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#15202b] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              <AnimatedBorder className="w-full" color="conic-gradient(from 90deg at 50% 50%, #00b050 0%, #101922 25%, #00b050 50%, #101922 75%, #00b050 100%)">
                <button
                  onClick={() => handleAction("/admin/profile")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-emerald-500/10 hover:text-white transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4" /> Admin Profile
                </button>
              </AnimatedBorder>
              <AnimatedLogout
                className="w-full">
                <button
                  onClick={() => handleAction("/login")}
                  className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </AnimatedLogout>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
