import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "../components/StudentNavbar";
import { useClickMouse } from "../hooks/ClickMouse";
import { 
  ArrowRight, LayoutDashboard, Zap, 
  UserCircle2, Clock, Repeat, FileText, 
  ShieldCheck, HelpCircle 
} from "lucide-react";

const MOCK_USER = { name: "Prashant Singh", roll_number: "2115000888", year: "3rd Year", gender: "Male" };

const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const playClickSound = useClickMouse();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(MOCK_USER);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const navigateTo = (path) => {
    playClickSound();
    navigate(path);
  };

  // --- Sub-Component for Action Cards ---
  const ActionCard = ({ title, desc, icon: Icon, path, color, badge }) => (
    <div 
      onClick={() => navigateTo(path)}
      className="group relative bg-[#15202b]/40 border border-white/5 p-8 rounded-4xl backdrop-blur-md hover:bg-[#15202b]/60 transition-all cursor-pointer shadow-xl overflow-hidden"
    >
      <div className={`absolute -top-4 -right-4 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity ${color}`}>
        <Icon size={120} />
      </div>
      
      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start">
          <div className={`p-4 rounded-2xl bg-white/5 ${color}`}>
            <Icon size={24} />
          </div>
          {badge && (
            <span className="text-[9px] font-black uppercase tracking-widest bg-[#137fec]/10 text-[#137fec] px-2 py-1 rounded-full border border-[#137fec]/20">
              {badge}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-[#137fec] transition-colors">{title}</h3>
          <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">{desc}</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-[#137fec] opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2.5 group-hover:translate-x-0">
          Access Portal <ArrowRight size={12} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200 font-sans selection:bg-[#137fec]/30">
      <StudentNavbar />
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-125 h-125 bg-[#137fec]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-100 h-100 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto pt-28 pb-12 px-6 lg:px-8 space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-[#137fec]/10 border border-[#137fec]/20">
                <LayoutDashboard size={16} className="text-[#137fec]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#137fec]">Student Console</span>
            </div>
            <h1 className="text-white font-medium text-4xl tracking-tight leading-none">
              Welcome back, <span className="font-black italic">{user?.name.split(' ')[0] || 'Resident'}</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-2">Manage your hostel booking and residential services.</p>
          </div>
          
          <div className="hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#15202b]/40 border border-white/5 backdrop-blur-md">
            <ShieldCheck size={18} className="text-emerald-500" />
            <div className="text-left">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Account Status</p>
               <p className="text-xs font-bold text-white uppercase">Verified Profile</p>
            </div>
          </div>
        </header>

        {/* Profile Summary Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Identity", value: user?.roll_number, icon: FileText },
            { label: "Classification", value: user?.year, icon: Zap },
            { label: "Gender Profile", value: user?.gender, icon: UserCircle2 }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-5 p-6 bg-[#15202b]/40 border border-white/5 rounded-3xl backdrop-blur-md">
               <div className="p-3 bg-white/5 rounded-xl text-[#137fec]"><item.icon size={20}/></div>
               <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                  <p className="text-lg font-bold text-white tracking-tight">{isLoading ? '...' : item.value}</p>
               </div>
            </div>
          ))}
        </section>

        {/* --- MAIN ACTION GRID --- */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 ml-2">
             <Zap size={16} className="text-[#137fec] fill-[#137fec]/20" />
             <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Residential Services</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard 
              title="Official Profile"
              desc="View and update your university records, contact info, and academic classification."
              icon={UserCircle2}
              path="/student/profile"
              color="text-blue-500"
            />
            <ActionCard 
              title="Booking Portal"
              desc="Access the real-time FCFS room allotment system for the current academic session."
              icon={Clock}
              path="/student/booking-countdown"
              color="text-emerald-500"
              badge="Live Countdown"
            />
            <ActionCard 
              title="Room Swap Hub"
              desc="Trade your confirmed room allotment with another resident instantly via P2P exchange."
              icon={Repeat}
              path="/student/room-swap"
              color="text-purple-500"
            />
          </div>
        </section>

        {/* Support Section */}
        <section className="bg-linear-to-r from-[#137fec]/10 to-transparent border border-[#137fec]/10 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
           <div className="flex items-center gap-6">
              <div className="p-5 bg-[#137fec] text-white rounded-3xl shadow-lg shadow-[#137fec]/20">
                <HelpCircle size={32} />
              </div>
              <div className="space-y-1">
                 <h3 className="text-xl font-bold text-white">Need Assistance?</h3>
                 <p className="text-sm text-slate-400 font-medium">Contact the warden or university helpdesk for allotment issues.</p>
              </div>
           </div>
           <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all cursor-pointer">
              Raise Ticket
           </button>
        </section>
        
        <footer className="text-center pt-8 opacity-40">
           <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em]">GLA University Allotment Protocol v2.4.0</p>
        </footer>
      </main>
    </div>
  );
};

export default StudentDashboardPage;