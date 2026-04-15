import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Bed,
  Building2,
  CheckCircle2,
  Info,
  Search,
  UserCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

import AdminNavbar from "../components/AdminNavbar";
import axiosInstance from "../lib/axios";
import { getErrorMessage } from "../lib/errors";
import { useClickMouse } from "../hooks/ClickMouse";

const UserPlusIcon = ({ className, size }) => (
  <svg
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="22" x2="16" y1="11" y2="11" />
  </svg>
);

function ManualBookingPage() {
  const playClickSound = useClickMouse();
  const [students, setStudents] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    roll_number: "",
    hostel_id: "",
    room_number: "",
  });

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);

      try {
        const [studentsResponse, hostelsResponse] = await Promise.all([
          axiosInstance.get("/admin/eligible-students"),
          axiosInstance.get("/admin/hostels"),
        ]);

        setStudents(studentsResponse.data?.data?.students || []);
        setHostels(hostelsResponse.data?.data?.hostels || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load manual booking data"));
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadRooms = async () => {
      if (!formData.hostel_id) {
        setRooms([]);
        return;
      }

      try {
        const response = await axiosInstance.get(`/admin/hostels/${formData.hostel_id}/rooms`);

        setRooms(response.data?.data?.rooms || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load hostel rooms"));
      }
    };

    loadRooms();
  }, [formData.hostel_id]);

  const availableRooms = rooms.filter((room) => room.available_beds > 0);

  const handleAssign = async (event) => {
    event.preventDefault();
    playClickSound();
    setIsSubmitting(true);
    const toastId = toast.loading("Processing manual allocation...");

    try {
      await axiosInstance.post("/admin/offline-bookings", {
        roll_number: Number(formData.roll_number),
        hostel_id: Number(formData.hostel_id),
        room_number: formData.room_number,
      });

      toast.success(
        `Allocated room ${formData.room_number} to ${formData.roll_number}`,
        { id: toastId }
      );
      setFormData({
        roll_number: "",
        hostel_id: "",
        room_number: "",
      });
      setRooms([]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create offline booking"), {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200 selection:bg-blue-500/30">
      <AdminNavbar />

      <main className="max-w-5xl mx-auto pt-32 px-6 pb-20">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <UserPlusIcon size={16} className="text-blue-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
                Offline Allocation
              </span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Manual Allocation</h1>
            <p className="text-slate-500 text-sm font-medium">
              Create a confirmed room booking directly from the backend admin API.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-[#15202b]/40 border border-white/5 rounded-[40px] p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 text-white/5 pointer-events-none">
              <Building2 size={120} />
            </div>

            <form onSubmit={handleAssign} className="space-y-10 relative z-10">
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <UserCircle2 size={14} className="text-blue-500" />
                  Student Identification
                </h3>
                <div className="relative group">
                  <Search
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                    size={20}
                  />
                  <input
                    list="eligible-students"
                    type="text"
                    required
                    value={formData.roll_number}
                    onChange={(event) =>
                      setFormData((currentValue) => ({
                        ...currentValue,
                        roll_number: event.target.value,
                      }))
                    }
                    placeholder={isLoading ? "Loading students..." : "Enter eligible student roll number"}
                    className="w-full pl-14 pr-6 py-5 bg-black/30 border border-white/10 rounded-3xl text-sm text-white focus:border-blue-500 focus:bg-black/50 outline-none transition-all placeholder:text-slate-700"
                  />
                  <datalist id="eligible-students">
                    {students.map((student) => (
                      <option
                        key={student.roll_number}
                        value={student.roll_number}
                        label={`${student.name} / ${student.year} / ${student.gender}`}
                      />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <Bed size={14} className="text-blue-500" />
                  Allocation Logistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Target Hostel
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formData.hostel_id}
                        onChange={(event) =>
                          setFormData((currentValue) => ({
                            ...currentValue,
                            hostel_id: event.target.value,
                            room_number: "",
                          }))
                        }
                        className="w-full px-6 py-5 bg-black/40 border border-white/10 rounded-[20px] text-sm text-white focus:border-blue-500 outline-none cursor-pointer appearance-none transition-all"
                      >
                        <option value="">Select hostel</option>
                        {hostels.map((hostel) => (
                          <option key={hostel.hostel_id} value={hostel.hostel_id}>
                            {hostel.hostel_name}
                          </option>
                        ))}
                      </select>
                      <ArrowRight
                        size={14}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Room Number
                    </label>
                    <select
                      required
                      value={formData.room_number}
                      onChange={(event) =>
                        setFormData((currentValue) => ({
                          ...currentValue,
                          room_number: event.target.value,
                        }))
                      }
                      disabled={!formData.hostel_id}
                      className="w-full px-6 py-5 bg-black/40 border border-white/10 rounded-[20px] text-sm text-white focus:border-blue-500 outline-none cursor-pointer appearance-none transition-all disabled:opacity-60"
                    >
                      <option value="">
                        {!formData.hostel_id ? "Select hostel first" : "Select room"}
                      </option>
                      {availableRooms.map((room) => (
                        <option key={room._id || room.room_number} value={room.room_number}>
                          {room.room_number} ({room.available_beds} beds free)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-2xl shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3 disabled:opacity-60"
              >
                <CheckCircle2 size={18} />
                {isSubmitting ? "Creating Allocation..." : "Confirm Manual Allocation"}
              </button>
            </form>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-4xl p-8 backdrop-blur-md">
              <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-6 text-blue-500">
                <Info size={24} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Admin Notice</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Offline bookings are saved as confirmed allocations immediately, so choose a room
                with available capacity and verify the student roll number carefully.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  <CheckCircle2 size={12} className="text-emerald-500 mt-0.5" />
                  Uses eligible students from AuthDB
                </li>
                <li className="flex items-start gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  <CheckCircle2 size={12} className="text-emerald-500 mt-0.5" />
                  Writes directly to confirmed hostel bookings
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ManualBookingPage;
