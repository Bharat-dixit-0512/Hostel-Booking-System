import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Hash,
  Search,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import StudentNavbar from "../components/StudentNavbar";
import axiosInstance from "../lib/axios";
import { getErrorMessage } from "../lib/errors";

const STATUS_STYLES = {
  CANCELLED: "bg-red-500/10 text-red-400",
  CONFIRMED: "bg-emerald-500/10 text-emerald-400",
  EXPIRED: "bg-orange-500/10 text-orange-400",
  PENDING: "bg-blue-500/10 text-blue-400",
};

const STATUS_ICONS = {
  CANCELLED: XCircle,
  CONFIRMED: CheckCircle,
  EXPIRED: Clock,
  PENDING: AlertCircle,
};

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "N/A";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "N/A";
const formatCurrency = (value) => `Rs. ${Number(value ?? 0).toLocaleString("en-IN")}`;

function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true);

      try {
        const response = await axiosInstance.get("/bookings/me");
        setBookings(response.data?.data?.bookings || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load booking history"));
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
          booking._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.room_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.hostel_id?.toString().includes(searchTerm);
        const matchesStatus =
          statusFilter === "ALL" || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
      }),
    [bookings, searchTerm, statusFilter],
  );

  const sortedBookings = useMemo(
    () =>
      [...filteredBookings].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      ),
    [filteredBookings],
  );

  const availableStatuses = [
    "ALL",
    ...new Set(bookings.map((booking) => booking.status)),
  ];

  const statusCounts = useMemo(() => {
    const counts = { ALL: bookings.length };
    bookings.forEach((booking) => {
      counts[booking.status] = (counts[booking.status] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200">
      <StudentNavbar />

      <main className="max-w-6xl mx-auto pt-28 px-6 pb-12 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Booking History
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              View all your hostel booking records including confirmed, pending,
              expired, and cancelled bookings.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:min-w-[28rem]">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search booking ID, room, hostel..."
                className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs outline-none focus:border-blue-500/50 w-72 transition-all"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {availableStatuses.map((status) => {
                const isActive = statusFilter === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#137fec] text-white border-[#137fec] shadow-lg shadow-[#137fec]/20"
                        : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {status} ({statusCounts[status] || 0})
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="inline-block p-3 bg-white/5 rounded-full">
                <Calendar className="animate-spin text-blue-500" size={24} />
              </div>
              <p className="text-slate-400 font-medium">
                Loading your booking history...
              </p>
            </div>
          </div>
        ) : sortedBookings.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="inline-block p-3 bg-white/5 rounded-full">
                <Calendar className="text-slate-500" size={24} />
              </div>
              <p className="text-slate-400 font-medium">
                {bookings.length === 0
                  ? "No bookings yet"
                  : "No bookings match your filters"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedBookings.map((booking) => {
              const StatusIcon = STATUS_ICONS[booking.status] || AlertCircle;
              return (
                <div
                  key={booking._id}
                  className="bg-[#15202b]/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md hover:border-white/10 hover:bg-[#15202b]/60 transition-all"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-5 flex-1">
                      <div
                        className={`p-3 rounded-xl ${STATUS_STYLES[booking.status]} flex-shrink-0`}
                      >
                        <StatusIcon size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="font-bold text-white text-lg truncate">
                            Hostel #{booking.hostel_id}
                          </h3>
                          <span
                            className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${STATUS_STYLES[booking.status]}`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-400 mb-3">
                          <div className="flex items-center gap-2">
                            <Hash size={14} className="text-slate-600" />
                            <span>
                              Room:{" "}
                              <span className="text-slate-200 font-medium">
                                {booking.room_number}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>
                              Amount:{" "}
                              <span className="text-slate-200 font-medium">
                                {formatCurrency(booking.price)}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-600" />
                            <span>
                              Booked:{" "}
                              <span className="text-slate-200 font-medium">
                                {formatDate(booking.created_at)}
                              </span>
                            </span>
                          </div>
                          {booking.confirmed_at && (
                            <div className="flex items-center gap-2">
                              <CheckCircle
                                size={14}
                                className="text-emerald-600"
                              />
                              <span>
                                Confirmed:{" "}
                                <span className="text-slate-200 font-medium">
                                  {formatDate(booking.confirmed_at)}
                                </span>
                              </span>
                            </div>
                          )}
                          {booking.expires_at && (
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-orange-600" />
                              <span>
                                Expires:{" "}
                                <span className="text-slate-200 font-medium">
                                  {formatDate(booking.expires_at)}
                                </span>
                              </span>
                            </div>
                          )}
                          {booking.cancelled_at && (
                            <div className="flex items-center gap-2">
                              <XCircle size={14} className="text-red-600" />
                              <span>
                                Cancelled:{" "}
                                <span className="text-slate-200 font-medium">
                                  {formatDate(booking.cancelled_at)}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 font-mono">
                          ID: {booking._id}
                        </div>
                      </div>
                    </div>
                  </div>

                  {booking.payment_reference && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs text-slate-500">
                        Payment Reference:{" "}
                        <span className="text-slate-300 font-medium">
                          {booking.payment_reference}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default BookingHistoryPage;
