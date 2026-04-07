import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HandHelping, History, Settings2, CheckCircle2, 
  LayoutDashboard, DownloadCloud, ArrowRightLeft, 
  Flame, ShieldCheck 
} from 'lucide-react';
import AdminNavbar from '../components/AdminNavbar';
import BookingWindowToggle from '../components/BookingWindowToggle';
import ResetSystemAction from '../components/ResetSystemAction';
import AnimatedBorder from '../components/AnimatedBorder';
import { useClickMouse } from '../hooks/ClickMouse';

// --- Sub-Component: StatMini ---
const StatMini = ({ label, value, trend }) => (
    <div className="px-6 py-4 rounded-2xl bg-[#15202b]/60 border border-white/5 text-right backdrop-blur-md">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-bold text-emerald-500 tracking-tighter">{value}</p>
        {trend && <p className="text-[9px] text-orange-500 font-black mt-1 uppercase tracking-tighter">{trend}</p>}
    </div>
);

// --- Sub-Component: ActionCard ---
const ActionCard = ({ title, desc, icon, color, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-[#15202b]/40 border border-white/5 p-8 rounded-4xl backdrop-blur-md hover:bg-[#15202b]/60 transition-all group cursor-pointer hover:-translate-y-1 shadow-xl"
    >
        <div className={`p-4 rounded-2xl bg-white/5 w-fit mb-8 group-hover:scale-110 transition-transform ${color}`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
);

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const playClickSound = useClickMouse();
  const [isWindowOpen, setIsWindowOpen] = useState(false);

  const adminName = "Dr. Alok Kumar";

  const navigateTo = (path) => {
    playClickSound();
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200 font-sans selection:bg-emerald-500/30">
      <AdminNavbar />

      {/* Decorative Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-150 h-150 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-125 h-125 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto pt-28 pb-12 px-6 lg:px-8 space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <LayoutDashboard size={16} className="text-emerald-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">System Administrator</span>
            </div>
            <h1 className="text-white font-medium text-4xl tracking-tight leading-none">
              Welcome back, <span className="font-black italic text-emerald-50">{adminName}</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-2">Managing real-time inventory and FCFS residential operations.</p>
          </div>
          
          <div className="flex gap-4">
             <StatMini label="Confirmed Bookings" value="1,048" />
             <StatMini label="Race Conflicts" value="12" trend="Bypassed by system" />
             <StatMini label="Available Berths" value="284" />
          </div>
        </header>

        {/* Access Toggle */}
        <BookingWindowToggle isOpen={isWindowOpen} setOpen={setIsWindowOpen} />

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard 
            title="Inventory Config" 
            desc="Configure hostel blocks, room types (AC/Non-AC), and bed capacities." 
            icon={<Settings2 size={24}/>} 
            color="text-emerald-400"
            onClick={() => navigateTo('/admin/manage-hostels')}
          />
          <ActionCard 
            title="Manual Allotment" 
            desc="Force assign residential spaces to specific student roll numbers." 
            icon={<HandHelping size={24}/>} 
            color="text-blue-400"
            onClick={() => navigateTo('/admin/manual-booking')}
          />
          <ActionCard 
            title="Registry Review" 
            desc="Monitor processing requests and verify incoming student applications." 
            icon={<History size={24}/>} 
            color="text-purple-400"
            onClick={() => navigateTo('/admin/application-registry')}
          />
          <ActionCard 
            title="Swap Approvals" 
            desc="Review and finalize P2P room exchange requests between students." 
            icon={<ArrowRightLeft size={24}/>} 
            color="text-orange-400"
            onClick={() => navigateTo('/admin/swap-approvals')}
          />
          <ActionCard 
            title="FCFS Analytics" 
            desc="Monitor race conditions, booking velocity, and inventory heatmaps." 
            icon={<Flame size={24}/>} 
            color="text-red-400"
            onClick={() => navigateTo('/admin/fcfs-analytics')}
          />
          <ActionCard 
            title="System Audit" 
            desc="Access high-precision logs to verify fairness and race winners." 
            icon={<ShieldCheck size={24}/>} 
            color="text-indigo-400"
            onClick={() => navigateTo('/admin/fcfs-analytics')}
          />
        </div>

        {/* Allotted Students Master Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           <div className="lg:col-span-8">
              <AnimatedBorder color="conic-gradient(from 90deg at 50% 50%, #00b050 0%, #101922 25%, #00b050 50%, #101922 75%, #00b050 100%)">
                <div className="p-8 flex items-center justify-between h-full bg-[#15202b]/40 backdrop-blur-md">
                  <div className="flex items-center gap-6">
                      <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 size={32} />
                      </div>
                      <div>
                          <h4 className="font-bold text-xl text-white tracking-tight">Booking Allotment Master</h4>
                          <p className="text-xs text-slate-500 mt-1">Master database of residents with finalized rooms and payments.</p>
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => navigateTo('/admin/confirmed-bookings')} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                        Open List
                      </button>
                      <button className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition-all border border-white/10">
                        <DownloadCloud size={18} />
                      </button>
                  </div>
                </div>
              </AnimatedBorder>
           </div>

           <div className="lg:col-span-4">
              <ResetSystemAction />
           </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboardPage;