import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Download,
  Lock,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import StudentNavbar from "../components/StudentNavbar";
import { useAuth } from "../hooks/useAuth";
import axiosInstance from "../lib/axios";
import { getErrorMessage } from "../lib/errors";

const getHostelName = (hostels, hostelId) =>
  hostels.find((hostel) => hostel.hostel_id === hostelId)?.hostel_name ||
  `Hostel #${hostelId}`;
const formatCurrency = (value) =>
  `Rs. ${Number(value ?? 0).toLocaleString("en-IN")}`;

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [hostels, setHostels] = useState([]);
  const [sessionData, setSessionData] = useState(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPaymentState = async () => {
      setIsLoading(true);

      try {
        const requestedBookingId = searchParams.get("bookingId");
        const [bookingsResponse, hostelsResponse] = await Promise.all([
          axiosInstance.get("/bookings/me"),
          axiosInstance.get("/hostels"),
        ]);
        const allBookings = bookingsResponse.data?.data?.bookings || [];
        const resolvedBooking =
          allBookings.find((item) => item._id === requestedBookingId) ||
          allBookings.find((item) => item.status === "PENDING") ||
          allBookings.find((item) => item.status === "CONFIRMED") ||
          null;

        if (!isMounted) {
          return;
        }

        setBooking(resolvedBooking);
        setHostels(hostelsResponse.data?.data?.hostels || []);

        if (resolvedBooking?.status === "PENDING") {
          const sessionResponse = await axiosInstance.post(
            "/payments/create-session",
            {
              booking_id: resolvedBooking._id,
            },
          );

          if (!isMounted) {
            return;
          }

          setSessionData(sessionResponse.data?.data || null);
        } else {
          setSessionData(null);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(getErrorMessage(error, "Unable to load payment status"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPaymentState();

    return () => {
      isMounted = false;
    };
  }, [location.state?.booking, searchParams]);

  const handleConfirmPayment = async () => {
    if (!booking?._id) {
      toast.error("No active booking found");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Confirming payment...");

    try {
      const response = await axiosInstance.post("/payments/confirm", {
        booking_id: booking._id,
        payment_reference: paymentReference.trim(),
      });

      setBooking(response.data?.data?.booking || booking);
      setSessionData(null);
      await refreshUser();
      toast.success("Booking confirmed successfully", { id: toastId });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to confirm payment"), {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking?._id) {
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Cancelling booking hold...");

    try {
      await axiosInstance.put(`/bookings/${booking._id}/cancel`);
      toast.success("Booking hold cancelled", { id: toastId });
      navigate("/student/booking", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to cancel booking"), {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hostelName = booking
    ? getHostelName(hostels, booking.hostel_id)
    : "No active booking";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#101922] text-slate-200">
        <StudentNavbar />
        <main className="max-w-4xl mx-auto pt-32 px-6 pb-20 text-center text-slate-400">
          Loading payment session...
        </main>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#101922] text-slate-200">
        <StudentNavbar />
        <main className="max-w-4xl mx-auto pt-32 px-6 pb-20">
          <div className="bg-[#15202b]/40 border border-white/5 rounded-[40px] p-10 text-center space-y-5">
            <XCircle size={40} className="mx-auto text-red-500" />
            <h1 className="text-2xl font-black text-white">
              No active booking found
            </h1>
            <p className="text-slate-400 text-sm">
              Start a booking from the hostel browser before opening the payment
              page.
            </p>
            <button
              type="button"
              onClick={() => navigate("/student/booking")}
              className="px-6 py-3 bg-[#137fec] hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer"
            >
              Browse Hostels
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (booking.status === "CONFIRMED") {
    return (
      <div className="min-h-screen bg-[#101922] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#15202b] border border-emerald-500/20 rounded-[40px] p-10 text-center space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-white italic">
            Booking Confirmed
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your room in{" "}
            <span className="text-white font-bold">{hostelName}</span> has been
            officially allocated.
          </p>
          <div className="bg-black/20 border border-white/5 rounded-3xl p-5 text-left space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Allocation
            </p>
            <p className="text-white font-bold">Room {booking.room_number}</p>
            <p className="text-xs text-slate-400">Booking ID: {booking._id}</p>
            <p className="text-xs text-slate-400">
              Payment Ref: {booking.payment_reference || "Not provided"}
            </p>
            <p className="text-xs text-slate-400">
              Amount: {formatCurrency(booking.price)}
            </p>
          </div>
          <div className="pt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("/student/dashboard")}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer"
            >
              Return to Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate("/student/profile")}
              className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Download size={14} />
              View Profile Allocation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200">
      <StudentNavbar />
      <main className="max-w-4xl mx-auto pt-32 px-6 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <header>
            <h1 className="text-3xl font-black text-white italic">
              Payment Confirmation
            </h1>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2 flex items-center gap-2">
              <Lock size={12} className="text-emerald-500" /> Backend
              placeholder gateway session
            </p>
          </header>

          <div className="bg-[#15202b]/40 border border-white/5 rounded-[40px] p-10 space-y-8 backdrop-blur-md">
            <div className="flex gap-4">
              <div className="flex-1 p-4 bg-[#137fec]/10 border border-[#137fec]/20 rounded-2xl flex items-center gap-3">
                <CreditCard className="text-[#137fec]" />
                <span className="text-xs font-bold text-white">
                  Confirm Held Booking
                </span>
              </div>
              <div className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="text-slate-400" />
                <span className="text-xs font-bold text-slate-300">
                  Session {sessionData?.session_id}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl bg-black/20 border border-white/5 p-5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">
                  Gateway Notes
                </p>
                <p className="text-sm text-slate-300">
                  The current backend exposes a placeholder payment gateway.
                  Confirming this step will finalize the room allocation in the
                  server.
                </p>
              </div>

              <input
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                placeholder="Optional payment reference / transaction ID"
                className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-[#137fec]/50 text-sm"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isSubmitting}
                className="flex-1 py-5 bg-[#137fec] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl transition-all shadow-xl shadow-[#137fec]/20 flex items-center justify-center gap-3 cursor-pointer disabled:bg-slate-700"
              >
                {isSubmitting
                  ? "Processing..."
                  : "Confirm Payment & Allocate Room"}
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={isSubmitting}
                className="px-6 py-5 bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 font-black text-xs uppercase tracking-widest rounded-3xl transition-all border border-white/10 cursor-pointer disabled:opacity-60"
              >
                Cancel Hold
              </button>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="bg-[#137fec]/5 border border-[#137fec]/10 rounded-[40px] p-8 space-y-6 sticky top-32">
            <h3 className="text-lg font-bold text-white">Booking Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Selected Hostel
                </span>
                <span className="text-white font-bold">{hostelName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Room</span>
                <span className="text-white font-bold">
                  {booking.room_number}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="text-orange-400 font-bold">
                  {booking.status}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Amount</span>
                <span className="text-white font-bold">
                  {formatCurrency(sessionData?.amount ?? booking.price)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Expires At</span>
                <span className="text-white font-bold">
                  {sessionData?.expires_at
                    ? new Date(sessionData.expires_at).toLocaleString()
                    : "Not available"}
                </span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-[#137fec]">
                  Session ID
                </span>
                <span className="text-sm font-black text-white">
                  {sessionData?.session_id}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default PaymentPage;
