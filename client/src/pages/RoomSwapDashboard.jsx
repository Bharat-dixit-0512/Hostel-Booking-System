// Removed due to missing backend support
// import React from 'react';
// import StudentNavbar from '../components/StudentNavbar';
// import { Repeat, Search, Send, Info, ArrowRightLeft } from 'lucide-react';
// import toast from 'react-hot-toast';

const RoomSwapDashboard = () => {
  return <div>Room swap feature is not available.</div>;
}
    return (
        <div className="min-h-screen bg-[#101922] text-slate-200 font-sans selection:bg-[#137fec]/30">
            <StudentNavbar />
            <main className="relative z-10 max-w-6xl mx-auto pt-28 pb-12 px-6 lg:px-8 space-y-10">
                
                <header className="space-y-1 animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-[#137fec]/10 border border-[#137fec]/20">
                      <Repeat size={16} className="text-[#137fec]" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#137fec]">P2P Inventory Exchange</span>
                  </div>
                  <h1 className="text-white font-black text-4xl tracking-tight italic">Self-Swap Hub</h1>
                  <p className="text-slate-500 text-sm font-medium">Trade your confirmed berth with another student instantly.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Swap Form */}
                    <section className="lg:col-span-7 bg-[#15202b]/40 border border-white/5 p-10 rounded-[40px] backdrop-blur-md shadow-2xl space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Recipient Identity</label>
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#137fec] transition-colors" size={20} />
                                <input 
                                    placeholder="Enter Friend's Roll Number..."
                                    className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/10 rounded-3xl outline-none focus:border-[#137fec]/50 transition-all text-sm font-bold placeholder:text-slate-800"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-[#137fec]/5 border border-[#137fec]/10 rounded-3xl flex items-center gap-6">
                            <div className="text-center flex-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase">You Release</p>
                                <p className="text-lg font-bold text-white mt-1">Room 101-A</p>
                            </div>
                            <ArrowRightLeft className="text-[#137fec]" />
                            <div className="text-center flex-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase">You Claim</p>
                                <p className="text-lg font-bold text-white mt-1 italic tracking-widest">TARGET ROOM</p>
                            </div>
                        </div>

                        <button 
                            onClick={() => toast.loading("Broadcasting trade offer...")}
                            className="w-full py-5 bg-[#137fec] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl transition-all shadow-[0_15px_30px_rgba(19,127,236,0.15)] flex items-center justify-center gap-3 cursor-pointer"
                        >
                            <Send size={16} /> Broadcast Swap Request
                        </button>
                    </section>

                    {/* Policy Side */}
                    <aside className="lg:col-span-5 bg-[#15202b]/20 border border-white/5 rounded-[40px] p-8 space-y-8">
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl w-fit text-[#137fec]"><Info /></div>
                            <h4 className="font-bold text-xl text-white">System Protocol</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">Room swaps are only permitted within the same hostel block and course classification. Once confirmed by the recipient, the change is finalized in the master database.</p>
                        </div>
                        <ul className="space-y-4">
                            {["Instant ID re-generation", "One-time request limit", "Auto-revert on timeout"].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#137fec]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default RoomSwapDashboard;