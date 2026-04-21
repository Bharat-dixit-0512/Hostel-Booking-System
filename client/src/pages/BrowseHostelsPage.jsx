import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BedDouble,
  Building2,
  ChevronLeft,
  DoorOpen,
  Layers,
  Snowflake,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import StudentNavbar from "../components/StudentNavbar";
import { useRealtimeRefresh } from "../hooks/useRealtimeRefresh";
import axiosInstance from "../lib/axios";
import { getErrorMessage } from "../lib/errors";
import { REALTIME_EVENTS } from "../lib/realtimeEvents";

const ACTIVE_BOOKING_STATUSES = new Set(["PENDING", "CONFIRMED"]);
const formatCurrency = (value) =>
  `Rs. ${Number(value ?? 0).toLocaleString("en-IN")}`;
const BROWSE_HOSTELS_EVENTS = [
  REALTIME_EVENTS.BOOKING_CHANGED,
  REALTIME_EVENTS.INVENTORY_CHANGED,
  REALTIME_EVENTS.BOOKING_WINDOW_UPDATED,
  REALTIME_EVENTS.SESSION_RESET,
];

const HostelSummaryCard = ({ hostel, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(hostel)}
    className="group text-left bg-[#15202b]/40 border border-white/5 p-8 rounded-[40px] backdrop-blur-md hover:bg-[#15202b]/60 transition-all cursor-pointer relative overflow-hidden w-full"
  >
    <div className="relative z-10 space-y-6">
      <div className="p-4 rounded-2xl bg-white/5 text-[#137fec] w-fit">
        <Building2 size={24} />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white group-hover:text-[#137fec] transition-colors">
          {hostel.hostel_name}
        </h3>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
          {hostel.available_beds} beds free / {hostel.total_capacity} total
          capacity
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs text-slate-400">
        <div className="rounded-2xl bg-black/20 px-4 py-3 border border-white/5">
          <p className="text-[10px] font-black uppercase text-slate-500">
            Rooms
          </p>
          <p className="font-bold text-white mt-1">{hostel.total_rooms}</p>
        </div>
        <div className="rounded-2xl bg-black/20 px-4 py-3 border border-white/5">
          <p className="text-[10px] font-black uppercase text-slate-500">
            Floors
          </p>
          <p className="font-bold text-white mt-1">{hostel.floors ?? 1}</p>
        </div>
        <div className="rounded-2xl bg-black/20 px-4 py-3 border border-white/5">
          <p className="text-[10px] font-black uppercase text-slate-500">
            Availability
          </p>
          <p className="font-bold text-white mt-1">
            {hostel.can_book ? "Open" : "Full"}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {hostel.can_book ? "Available for booking" : "No vacancies"}
        </span>
        <ArrowRight
          size={18}
          className="text-[#137fec] group-hover:translate-x-2 transition-transform"
        />
      </div>
    </div>
  </button>
);

const RoomCard = ({ room, isSelected, onSelect }) => (
  <button
    type="button"
    disabled={room.available_beds <= 0}
    onClick={() => onSelect(room)}
    className={`text-left p-6 rounded-4xl border transition-all ${
      room.available_beds <= 0
        ? "bg-red-500/5 border-red-500/10 opacity-50 cursor-not-allowed"
        : isSelected
          ? "bg-[#137fec]/10 border-[#137fec]/40"
          : "bg-white/5 border-white/5 hover:border-[#137fec]/30 cursor-pointer"
    }`}
  >
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/5 text-slate-400">
          <DoorOpen size={18} />
        </div>
        <div>
          <h4 className="text-lg font-bold text-white tracking-tight">
            Room {room.room_number}
          </h4>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
            {room.ac_type ? "AC" : "Non-AC"}
          </p>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1 inline-flex items-center gap-1">
            <Layers size={12} /> Floor {room.floor ?? 0}
          </p>
        </div>
      </div>
      {room.ac_type ? <Snowflake size={18} className="text-blue-400" /> : null}
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-black/30 px-4 py-3 border border-white/5">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Capacity
        </p>
        <p className="text-white font-bold mt-1 flex items-center gap-2">
          <Users size={14} className="text-slate-400" />
          {room.capacity}
        </p>
      </div>
      <div className="rounded-2xl bg-black/30 px-4 py-3 border border-white/5">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Available
        </p>
        <p className="text-white font-bold mt-1 flex items-center gap-2">
          <BedDouble size={14} className="text-emerald-400" />
          {room.available_beds}
        </p>
      </div>
      <div className="rounded-2xl bg-black/30 px-4 py-3 border border-white/5 col-span-2">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Price
        </p>
        <p className="text-white font-bold mt-1">
          {formatCurrency(room.price)}
        </p>
      </div>
    </div>
  </button>
);

function BrowseHostelsPage() {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isLoadingHostels, setIsLoadingHostels] = useState(true);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingWindowOpen, setBookingWindowOpen] = useState(false);
  const [bookings, setBookings] = useState([]);

  const loadInitialData = useCallback(
    async ({
      selectedHostelId = null,
      showLoading = true,
      showErrors = true,
    } = {}) => {
      if (showLoading) {
        setIsLoadingHostels(true);
      }

      try {
        const [hostelsResponse, bookingsResponse] = await Promise.all([
          axiosInstance.get("/hostels"),
          axiosInstance.get("/bookings/me"),
        ]);
        const fetchedHostels = hostelsResponse.data?.data?.hostels || [];
        const resolvedSelectedHostelId = Number(selectedHostelId);

        setHostels(fetchedHostels);
        setBookingWindowOpen(
          Boolean(hostelsResponse.data?.data?.booking_window_open),
        );
        setBookings(bookingsResponse.data?.data?.bookings || []);

        if (
          Number.isInteger(resolvedSelectedHostelId) &&
          resolvedSelectedHostelId > 0
        ) {
          const refreshedSelectedHostel =
            fetchedHostels.find(
              (hostel) => Number(hostel.hostel_id) === resolvedSelectedHostelId,
            ) || null;

          setSelectedHostel(refreshedSelectedHostel);

          if (!refreshedSelectedHostel) {
            setRooms([]);
            setSelectedRoom(null);
            return;
          }

          const roomsResponse = await axiosInstance.get(
            `/hostels/${resolvedSelectedHostelId}/rooms`,
          );
          const refreshedRooms = roomsResponse.data?.data?.rooms || [];

          setRooms(refreshedRooms);
          setSelectedRoom((currentValue) =>
            currentValue
              ? refreshedRooms.find(
                  (room) => room.room_number === currentValue.room_number,
                ) || null
              : null,
          );
        }
      } catch (error) {
        if (showErrors) {
          toast.error(getErrorMessage(error, "Unable to load hostels"));
        }
      } finally {
        if (showLoading) {
          setIsLoadingHostels(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const pendingBooking =
    bookings.find((booking) => booking.status === "PENDING") || null;
  const confirmedBooking =
    bookings.find((booking) => booking.status === "CONFIRMED") || null;
  const activeBooking =
    bookings.find((booking) => ACTIVE_BOOKING_STATUSES.has(booking.status)) ||
    null;

  const refreshRealtimeData = useCallback(() => {
    loadInitialData({
      selectedHostelId: selectedHostel?.hostel_id ?? null,
      showLoading: false,
      showErrors: false,
    });
  }, [loadInitialData, selectedHostel?.hostel_id]);

  useRealtimeRefresh({
    events: BROWSE_HOSTELS_EVENTS,
    onRefresh: refreshRealtimeData,
  });

  const handleHostelSelect = async (hostel) => {
    setSelectedHostel(hostel);
    setSelectedRoom(null);
    setIsLoadingRooms(true);

    try {
      const response = await axiosInstance.get(
        `/hostels/${hostel.hostel_id}/rooms`,
      );

      setRooms(response.data?.data?.rooms || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load rooms"));
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (confirmedBooking) {
      toast.error("You already have a confirmed room allocation");
      return;
    }

    if (pendingBooking) {
      navigate(`/student/payment?bookingId=${pendingBooking._id}`);
      return;
    }

    if (!selectedHostel || !selectedRoom) {
      toast.error("Select a room to continue");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating your booking hold...");

    try {
      const response = await axiosInstance.post("/bookings", {
        hostel_id: selectedHostel.hostel_id,
        room_number: selectedRoom.room_number,
      });
      const booking = response.data?.data?.booking;

      toast.success("Room hold created successfully", { id: toastId });
      navigate(`/student/payment?bookingId=${booking?._id}`, {
        state: {
          booking,
          hostel: selectedHostel,
          room: selectedRoom,
        },
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create booking"), {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200 font-sans">
      <StudentNavbar />

      <main className="max-w-6xl mx-auto pt-32 px-6 pb-32 space-y-10">
        {activeBooking ? (
          <section className="bg-[#15202b]/60 border border-[#137fec]/20 rounded-[32px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black text-[#137fec] uppercase tracking-[0.3em] mb-2">
                Active Booking Detected
              </p>
              <h2 className="text-xl font-black text-white">
                Room {activeBooking.room_number} / Hostel #
                {activeBooking.hostel_id}
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Status:{" "}
                <span className="text-white font-bold">
                  {activeBooking.status}
                </span>
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Amount:{" "}
                <span className="text-white font-bold">
                  {formatCurrency(activeBooking.price)}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate(
                  activeBooking.status === "PENDING"
                    ? `/student/payment?bookingId=${activeBooking._id}`
                    : "/student/profile",
                )
              }
              className="px-6 py-3 bg-[#137fec] hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              {activeBooking.status === "PENDING"
                ? "Continue Payment"
                : "View Allocation"}
            </button>
          </section>
        ) : null}

        <header className="space-y-3">
          <h1 className="text-4xl font-black text-white italic tracking-tight">
            Eligible Hostels
          </h1>
          <p className="text-slate-500 text-sm">
            Browse live availability pulled from the backend. The current API
            books a room hold, not an individual bed selection.
          </p>
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
              bookingWindowOpen
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
                : "bg-red-500/10 border border-red-500/20 text-red-500"
            }`}
          >
            <span>
              {bookingWindowOpen
                ? "Booking window open"
                : "Booking window closed"}
            </span>
          </div>
        </header>

        {!selectedHostel ? (
          <section>
            {isLoadingHostels ? (
              <div className="py-20 text-center text-slate-400">
                Loading eligible hostels...
              </div>
            ) : hostels.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-[40px] text-slate-500">
                No eligible hostels are available for your profile right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostels.map((hostel) => (
                  <HostelSummaryCard
                    key={hostel.hostel_id}
                    hostel={hostel}
                    onSelect={handleHostelSelect}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="space-y-8">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedHostel(null);
                  setRooms([]);
                  setSelectedRoom(null);
                }}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                <ChevronLeft size={16} /> Back to Hostels
              </button>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  Selected Hostel
                </p>
                <h2 className="text-xl font-black text-white">
                  {selectedHostel.hostel_name}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-6">
                {isLoadingRooms ? (
                  <div className="py-16 text-center text-slate-400">
                    Loading hostel rooms...
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-white/10 rounded-[40px] text-slate-500">
                    No rooms are configured for this hostel yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rooms.map((room) => (
                      <RoomCard
                        key={room._id || room.room_number}
                        room={room}
                        isSelected={
                          selectedRoom?.room_number === room.room_number
                        }
                        onSelect={setSelectedRoom}
                      />
                    ))}
                  </div>
                )}
              </div>

              <aside className="lg:col-span-4">
                <div className="bg-[#15202b] border border-white/5 rounded-[40px] p-8 space-y-8 sticky top-32 shadow-2xl">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      Summary
                    </p>
                    <h3 className="text-xl font-bold text-white">
                      {selectedHostel.hostel_name}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Room</span>
                      <span className="font-bold text-slate-300">
                        {selectedRoom
                          ? `Room ${selectedRoom.room_number}`
                          : "Not Selected"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">
                        Capacity
                      </span>
                      <span className="font-bold text-slate-300">
                        {selectedRoom?.capacity ?? "--"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Floor</span>
                      <span className="font-bold text-slate-300">
                        {selectedRoom?.floor ?? "--"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">
                        Available Beds
                      </span>
                      <span className="font-bold text-emerald-500">
                        {selectedRoom?.available_beds ?? "--"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Price</span>
                      <span className="font-bold text-slate-300">
                        {selectedRoom
                          ? formatCurrency(selectedRoom.price)
                          : "--"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      disabled={
                        isSubmitting || !bookingWindowOpen || isLoadingRooms
                      }
                      className="w-full py-5 bg-[#137fec] hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest rounded-3xl transition-all shadow-xl shadow-[#137fec]/20 flex items-center justify-center gap-3 cursor-pointer active:scale-95"
                    >
                      {pendingBooking
                        ? "Continue Payment"
                        : "Hold Room & Continue"}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default BrowseHostelsPage;
