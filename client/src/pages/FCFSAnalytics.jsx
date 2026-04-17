import React from 'react';
import { ShieldCheck, Flame, History, Activity, TrendingUp, Clock, Users } from 'lucide-react';
import AdminNavbar from '../components/AdminNavbar';

// --- Sub-Component: Analytics Stat ---
const AnalyticsStat = ({ label, value, subtext, icon: Icon, color }) => (
    <div className="bg-[#15202b]/40 border border-white/5 p-6 rounded-[32px] backdrop-blur-md">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-white/5 ${color}`}>
                <Icon size={20} />
            </div>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-widest">Live</span>
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
        <h2 className="text-3xl font-black text-white tracking-tighter mt-1">{value}</h2>
        <p className="text-[10px] text-slate-500 font-medium mt-2">{subtext}</p>
    </div>
);

const FCFSAnalytics = () => {
    // High-precision logs (Millisecond tracking for FCFS fairness)
    const logs = [
        { id: 1, user: "Rahul Verma", time: "10:00:00.045", action: "Room 101 Locked", status: "success" },
        { id: 2, user: "Sneha Kapoor", time: "10:00:00.089", action: "Room 101 Locked (Rejected)", status: "conflict" },
        { id: 3, user: "Amit Sharma", time: "10:00:01.120", action: "Payment Receipt Uploaded", status: "info" },
        { id: 4, user: "Priya Das", time: "10:00:02.005", action: "Room 204 Secured", status: "success" },
    ];

    return (
        <div className="min-h-screen bg-[#101922] text-slate-200 font-sans">
            <AdminNavbar />

            <main className="max-w-7xl mx-auto pt-28 px-6 pb-12 space-y-8">
                
                {/* Header Area */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                <Activity size={16} className="text-orange-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Real-time Velocity</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Booking Analytics</h1>
                        <p className="text-slate-500 text-sm font-medium">Monitoring First-Come-First-Serve traffic and race conditions.</p>
                    </div>
                </header>

                {/* Top KPI Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnalyticsStat 
                        label="Booking Velocity" 
                        value="4.2 r/s" 
                        subtext="Average rooms booked per second" 
                        icon={TrendingUp} 
                        color="text-emerald-500"
                    />
                    <AnalyticsStat 
                        label="Concurrent Users" 
                        value="1,842" 
                        subtext="Students active in booking window" 
                        icon={Users} 
                        color="text-blue-500"
                    />
                    <AnalyticsStat 
                        label="Avg. Decision Time" 
                        value="45.8s" 
                        subtext="Time from selection to checkout" 
                        icon={Clock} 
                        color="text-purple-500"
                    />
                    <AnalyticsStat 
                        label="Race Conflicts" 
                        value="12" 
                        subtext="Collisions blocked by Berth Lock" 
                        icon={ShieldCheck} 
                        color="text-orange-500"
                    />
                </div>

                {/* Main Visualization Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT: Floor-wise Heatmap */}
                    <div className="lg:col-span-7 bg-[#15202b]/40 border border-white/5 rounded-[40px] p-10 backdrop-blur-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Flame size={20} className="text-orange-500" /> Inventory Heatmap
                                </h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Kailash Bhavan - All Blocks</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-lg text-[9px] font-black text-red-500 border border-red-500/20">HOT</div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg text-[9px] font-black text-emerald-500 border border-emerald-500/20">FREE</div>
                            </div>
                        </div>

                        {/* Visual Floor Grid */}
                        <div className="space-y-8">
                            {[1, 2, 3].map((floor) => (
                                <div key={floor} className="space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Floor 0{floor}</h4>
                                    <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                                        {[...Array(10)].map((_, i) => {
                                            const roomNo = floor * 100 + (i + 1);
                                            const isHot = roomNo < 105 || roomNo === 204 || roomNo === 301;
                                            return (
                                                <div 
                                                    key={i} 
                                                    className={`aspect-square rounded-xl flex flex-col items-center justify-center border transition-all cursor-help
                                                        ${isHot 
                                                            ? 'bg-red-500/20 border-red-500/40 text-red-200' 
                                                            : 'bg-emerald-500/5 border-white/5 text-slate-600 hover:border-emerald-500/30'}
                                                    `}
                                                >
                                                    <span className="text-[8px] font-black">{roomNo}</span>
                                                    {isHot && <div className="w-1 h-1 rounded-full bg-red-500 mt-1 animate-pulse" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Audit Logs (The Justice Record) */}
                    <div className="lg:col-span-5 bg-[#15202b]/40 border border-white/5 rounded-[40px] p-10 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <ShieldCheck size={20} className="text-blue-500" /> Fairness Audit
                                </h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Immutable Transaction Logs</p>
                            </div>
                            <button className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                                <History size={16} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="group flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-1.5 h-8 rounded-full 
                                            ${log.status === 'success' ? 'bg-emerald-500' : 
                                              log.status === 'conflict' ? 'bg-red-500' : 'bg-blue-500'}
                                        `} />
                                        <div>
                                            <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{log.user}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{log.action}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <code className="text-[10px] font-mono text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-lg">
                                            {log.time}
                                        </code>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl">
                            <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
                                * Logs are generated with millisecond precision to resolve FCFS race condition disputes. High-velocity collisions are automatically prioritized by the system core timestamp.
                            </p>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default FCFSAnalytics;
