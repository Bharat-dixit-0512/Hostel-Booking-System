import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Hash, Search } from "lucide-react";
import toast from "react-hot-toast";

import AdminNavbar from "../components/AdminNavbar";
import axiosInstance from "../lib/axios";
import { getErrorMessage } from "../lib/errors";

const STATUS_STYLES = {
  CANCELLED: "bg-red-500/10 text-red-400",
  CONFIRMED: "bg-emerald-500/10 text-emerald-400",
  EXPIRED: "bg-slate-500/10 text-slate-400",
  PENDING: "bg-orange-500/10 text-orange-400",
};

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "N/A";

function ConfirmedBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true);

      try {
        const response = await axiosInstance.get("/admin/bookings");

        setBookings(response.data?.data?.bookings || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load booking registry"));
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const matchesSearch =
          String(booking.roll_number).includes(searchTerm) ||
          booking._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.hostel_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
      }),
    [bookings, searchTerm, statusFilter]
  );

  const availableStatuses = ["ALL", ...new Set(bookings.map((booking) => booking.status))];

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200">
      <AdminNavbar />

      <main className="max-w-6xl mx-auto pt-28 px-6 pb-12 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Booking Registry</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Live booking records from the admin API, including confirmed, pending, expired, and cancelled states.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-3">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search booking ID, roll, hostel..."
                className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs outline-none focus:border-blue-500/50 w-72 transition-all"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs outline-none focus:border-blue-500/50 transition-all"
            >
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="bg-[#15202b]/40 border border-white/5 rounded-4xl backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Booking
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Student
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Hostel / Room
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Source
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Timeline
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-16 text-center text-slate-500">
                      Loading bookings...
                    </td>
                  </tr>
                ) : filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-white/2 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Hash size={14} className="text-blue-500" />
                          <span className="text-xs font-mono font-bold text-white">
                            {booking._id}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-sm text-white">{booking.roll_number}</p>
                        <p className="text-[10px] text-slate-500 uppercase mt-0.5">
                          Payment Ref: {booking.payment_reference || "N/A"}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-xs text-slate-300 font-medium">
                          {booking.hostel_name || `Hostel #${booking.hostel_id}`}
                        </div>
                        <div className="text-[10px] text-blue-400 font-black mt-0.5 tracking-widest">
                          ROOM {booking.room_number}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                            STATUS_STYLES[booking.status] || "bg-white/10 text-slate-300"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-white uppercase">{booking.source}</p>
                        <p className="text-[10px] text-slate-500 uppercase mt-1">
                          Booked by {booking.booked_by_type}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1 text-xs text-slate-400">
                          <p className="flex items-center gap-2">
                            <CalendarDays size={12} className="text-slate-500" />
                            Created: {formatDateTime(booking.created_at)}
                          </p>
                          <p>Confirmed: {formatDateTime(booking.confirmed_at)}</p>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center text-slate-500">
                      <p className="text-sm italic">No booking records match your current filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ConfirmedBookingsPage;
