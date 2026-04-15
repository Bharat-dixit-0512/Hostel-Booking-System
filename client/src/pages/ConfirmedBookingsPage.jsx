import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, XCircle, CreditCard, Calendar, Hash } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminNavbar from '../components/AdminNavbar';

const ConfirmedBookingsPage = () => {
  // --- BOOKING DATABASE ---
  const [bookings, setBookings] = useState([
    { id: "BK-8801", name: "Rahul Verma", roll: "2115000121", room: "101-A", hostel: "Kailash Bhavan", date: "24 Oct 2023", amount: "₹45,000", payment: "Paid" },
    { id: "BK-8802", name: "Sneha Kapoor", roll: "2115000452", room: "204-B", hostel: "Vindhyachal", date: "25 Oct 2023", amount: "₹45,000", payment: "Paid" },
    { id: "BK-8805", name: "Amit Sharma", roll: "2115000889", room: "305-C", hostel: "Nilgiri Tower", date: "26 Oct 2023", amount: "₹38,000", payment: "Pending" },
    { id: "BK-8810", name: "Priya Das", roll: "2115000331", room: "108-B", hostel: "Kailash Bhavan", date: "27 Oct 2023", amount: "₹45,000", payment: "Paid" },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // --- SEARCH FILTERING ---
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.roll.includes(searchTerm) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bookings, searchTerm]);

  // --- CANCEL BOOKING PERMISSION ---
  const requestCancelBooking = (id, name) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-red-500">Cancel Booking?</p>
        <p className="text-xs text-slate-300">Kya aap <span className="text-white font-bold">{name}</span> ki booking cancel karke room khali karna chahte hain?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setBookings(prev => prev.filter(b => b.id !== id));
              toast.dismiss(t.id);
              toast.error(`Booking ${id} Cancelled.`);
            }}
            className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-lg transition-all cursor-pointer"
          >
            Yes, Cancel
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-white/5 text-slate-400 text-[10px] font-black px-4 py-2 rounded-lg cursor-pointer">Close</button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center', style: { background: '#101922', border: '1px solid rgba(239, 68, 68, 0.2)' } });
  };

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200">
      <Toaster />
      <AdminNavbar />
      
      <main className="max-w-6xl mx-auto pt-28 px-6 pb-12 space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Confirmed Bookings</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              List of students who have successfully booked and allotted rooms.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search Booking ID, Name..." 
                className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs outline-none focus:border-blue-500/50 w-72 transition-all" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 cursor-pointer transition-all text-slate-400">
              <Download size={18} />
            </button>
          </div>
        </header>

        {/* BOOKINGS TABLE */}
        <div className="bg-[#15202b]/40 border border-white/5 rounded-4xl backdrop-blur-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Booking ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Room Allotted</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Hash size={14} className="text-blue-500" />
                      <span className="text-xs font-mono font-bold text-white">{booking.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-sm text-white">{booking.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase mt-0.5">{booking.roll}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs text-slate-300 font-medium">{booking.hostel}</div>
                    <div className="text-[10px] text-blue-400 font-black mt-0.5 tracking-widest">ROOM {booking.room}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-black uppercase ${booking.payment === 'Paid' ? 'text-emerald-500' : 'text-orange-500'}`}>
                        {booking.payment}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">{booking.amount}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => requestCancelBooking(booking.id, booking.name)}
                      className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition-all"
                      title="Cancel Booking"
                    >
                      <XCircle size={20}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ConfirmedBookingsPage;