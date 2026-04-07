import React, { useState } from 'react';
import { ArrowRightLeft, CheckCircle2, XCircle, ShieldAlert, Search, Info, History } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminNavbar from '../components/AdminNavbar';

const AdminSwapApprovalPage = () => {
  const [requests, setRequests] = useState([
    { 
      id: "SWP-9901", 
      studentA: { name: "Rahul Verma", roll: "2115000121", room: "101-A (Kailash)" },
      studentB: { name: "Amit Sharma", roll: "2115000889", room: "305-C (Nilgiri)" },
      status: "Pending Review",
      autoVerified: true // System checked gender/year match
    },
    { 
      id: "SWP-9905", 
      studentA: { name: "Sneha Kapoor", roll: "2115000452", room: "204-B (Vindhyachal)" },
      studentB: { name: "Priya Das", roll: "2115000331", room: "108-B (Kailash)" },
      status: "Pending Review",
      autoVerified: true
    }
  ]);

  const handleFinalize = (id, action, studentAName) => {
    const loadId = toast.loading(`Processing swap ${id}...`);
    
    setTimeout(() => {
      if (action === 'approve') {
        setRequests(requests.filter(r => r.id !== id));
        toast.success(`Swap Approved. Allotment slips re-generated for ${studentAName} & partner.`, { id: loadId });
      } else {
        setRequests(requests.filter(r => r.id !== id));
        toast.error(`Swap request ${id} has been rejected.`, { id: loadId });
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200 font-sans">
      <Toaster />
      <AdminNavbar />

      <main className="max-w-6xl mx-auto pt-28 px-6 pb-12 space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <ArrowRightLeft size={16} className="text-purple-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500">Inventory Management</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Swap Approvals</h1>
            <p className="text-slate-500 text-sm font-medium">Reviewing P2P room exchange requests between confirmed residents.</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-4">
              <div className="text-right border-r border-white/10 pr-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pending</p>
                  <p className="text-xl font-bold text-white">{requests.length}</p>
              </div>
              <History size={20} className="text-slate-600 cursor-pointer hover:text-white transition-colors" />
          </div>
        </header>

        {/* Request Cards */}
        <div className="grid grid-cols-1 gap-6">
          {requests.length > 0 ? requests.map((req) => (
            <div key={req.id} className="bg-[#15202b]/40 border border-white/5 rounded-[40px] p-8 backdrop-blur-xl relative overflow-hidden group">
              
              {/* Background ID */}
              <div className="absolute -top-6 -left-4 text-white/5 text-6xl font-black pointer-events-none group-hover:text-purple-500/5 transition-colors">
                {req.id}
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                
                {/* Student A Side */}
                <div className="flex-1 space-y-4 text-center lg:text-left">
                   <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Origin Resident</p>
                      <h4 className="text-lg font-bold text-white">{req.studentA.name}</h4>
                      <p className="text-xs text-purple-400 font-mono">{req.studentA.roll}</p>
                      <div className="mt-4 flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-400">
                          <span className="bg-white/5 px-2 py-1 rounded text-red-400 font-bold">Giving Up: {req.studentA.room}</span>
                      </div>
                   </div>
                </div>

                {/* The Swap Icon */}
                <div className="flex flex-col items-center gap-2">
                    <div className="p-4 rounded-full bg-purple-500/10 text-purple-500 animate-pulse border border-purple-500/20">
                        <ArrowRightLeft size={32} />
                    </div>
                    {req.autoVerified && (
                      <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-2 py-1 rounded-full">
                        <CheckCircle2 size={10} /> Policy Verified
                      </div>
                    )}
                </div>

                {/* Student B Side */}
                <div className="flex-1 space-y-4 text-center lg:text-right">
                   <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Target Resident</p>
                      <h4 className="text-lg font-bold text-white">{req.studentB.name}</h4>
                      <p className="text-xs text-purple-400 font-mono">{req.studentB.roll}</p>
                      <div className="mt-4 flex items-center justify-center lg:justify-end gap-2 text-xs text-slate-400">
                          <span className="bg-emerald-500/10 px-2 py-1 rounded text-emerald-500 font-bold">Giving Up: {req.studentB.room}</span>
                      </div>
                   </div>
                </div>

                {/* Admin Actions */}
                <div className="flex lg:flex-col gap-3">
                   <button 
                    onClick={() => handleFinalize(req.id, 'approve', req.studentA.name)}
                    className="p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
                   >
                     <CheckCircle2 size={24} />
                   </button>
                   <button 
                    onClick={() => handleFinalize(req.id, 'reject', req.studentA.name)}
                    className="p-4 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-2xl transition-all active:scale-95 border border-white/5"
                   >
                     <XCircle size={24} />
                   </button>
                </div>

              </div>
            </div>
          )) : (
            <div className="py-20 text-center bg-white/2 border border-dashed border-white/10 rounded-[40px] space-y-4">
               <ShieldAlert className="mx-auto text-slate-600" size={48} />
               <p className="text-slate-500 font-medium">All swap requests have been processed.</p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="bg-blue-600/5 border border-blue-500/10 rounded-3xl p-6 flex items-start gap-4">
            <Info className="text-blue-500 shrink-0" size={20} />
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>Note for Admin:</strong> Approval will trigger an automatic database transaction that swaps the Room IDs for both students. New allotment slips with updated QR codes will be sent to their registered emails instantly. This action is audited in the <strong>FCFS Analytics Logs</strong>.
            </p>
        </div>

      </main>
    </div>
  );
};

export default AdminSwapApprovalPage;