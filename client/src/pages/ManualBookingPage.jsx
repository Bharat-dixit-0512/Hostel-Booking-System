import React, { useState } from 'react';
import { Search, Building2, Bed, CheckCircle2, UserCircle2, Info, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminNavbar from '../components/AdminNavbar';
import { useClickMouse } from '../hooks/ClickMouse';

const ManualBookingPage = () => {
  const playClickSound = useClickMouse();
  const [formData, setFormData] = useState({
    rollNo: "",
    hostel: "Kailash Bhavan",
    roomNo: "",
    bedNo: "1",
    remarks: ""
  });

  const handleAssign = (e) => {
    e.preventDefault();
    playClickSound();
    const loadId = toast.loading("Processing forced allocation...");
    
    // Simulate real-world API latency
    setTimeout(() => {
      toast.success(`Allocated Room ${formData.roomNo} to ${formData.rollNo}`, { id: loadId });
      setFormData({ rollNo: "", hostel: "Kailash Bhavan", roomNo: "", bedNo: "1", remarks: "" });
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200 selection:bg-blue-500/30">
      <Toaster />
      <AdminNavbar />
      
      <main className="max-w-5xl mx-auto pt-32 px-6 pb-20">
        
        {/* PAGE HEADER */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <UserPlusIcon size={16} className="text-blue-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Overridden Access</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Manual Allocation</h1>
            <p className="text-slate-500 text-sm font-medium">Assign residential spaces directly to student profiles bypassing the standard window.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* MAIN FORM SECTION */}
          <div className="lg:col-span-8 bg-[#15202b]/40 border border-white/5 rounded-[40px] p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 text-white/5 pointer-events-none">
                <Building2 size={120} />
            </div>

            <form onSubmit={handleAssign} className="space-y-10 relative z-10">
              
              {/* SECTION 1: IDENTITY */}
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <UserCircle2 size={14} className="text-blue-500"/> Student Identification
                </h3>
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    required 
                    value={formData.rollNo} 
                    onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
                    placeholder="Enter University Roll Number (e.g. 211500...)"
                    className="w-full pl-14 pr-6 py-5 bg-black/30 border border-white/10 rounded-3xl text-sm text-white focus:border-blue-500 focus:bg-black/50 outline-none transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              {/* SECTION 2: ALLOTMENT LOGISTICS */}
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <Bed size={14} className="text-blue-500"/> Allocation Logistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* HOSTEL DROPDOWN */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Hostel</label>
                    <div className="relative">
                      <select 
                        value={formData.hostel}
                        onChange={(e) => setFormData({...formData, hostel: e.target.value})}
                        className="w-full px-6 py-5 bg-black/40 border border-white/10 rounded-[20px] text-sm text-white focus:border-blue-500 outline-none cursor-pointer appearance-none transition-all"
                      >
                        <option value="Kailash Bhavan" className="bg-[#15202b] text-white">Kailash Bhavan (Block A)</option>
                        <option value="Vindhyachal" className="bg-[#15202b] text-white">Vindhyachal Block B</option>
                        <option value="Nilgiri Tower" className="bg-[#15202b] text-white">Nilgiri Tower C</option>
                      </select>
                      <ArrowRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  {/* ROOM NUMBER */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Room Number</label>
                    <input 
                        type="text" 
                        required
                        placeholder="e.g. 302-B" 
                        value={formData.roomNo}
                        onChange={(e) => setFormData({...formData, roomNo: e.target.value})}
                        className="w-full px-6 py-5 bg-black/40 border border-white/10 rounded-[20px] text-sm text-white focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>

                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button 
                type="submit" 
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-2xl shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3"
              >
                <CheckCircle2 size={18} /> Confirm Manual Allocation
              </button>
            </form>
          </div>

          {/* SIDEBAR ADVISORY */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-4xl p-8 backdrop-blur-md">
                <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-6 text-blue-500">
                    <Info size={24} />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Admin Notice</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Manual allocations override the automated booking window and berth capacity checks. Use this only for special cases, emergencies, or VIP student assignments.
                </p>
                <ul className="mt-6 space-y-3">
                    <li className="flex items-start gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                        <CheckCircle2 size={12} className="text-emerald-500 mt-0.5" />
                        Inventory is updated instantly
                    </li>
                    <li className="flex items-start gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                        <CheckCircle2 size={12} className="text-emerald-500 mt-0.5" />
                        Bypasses application registry
                    </li>
                </ul>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
};

// Simple Icon for Header
const UserPlusIcon = ({size, className}) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>
    </svg>
);

export default ManualBookingPage;