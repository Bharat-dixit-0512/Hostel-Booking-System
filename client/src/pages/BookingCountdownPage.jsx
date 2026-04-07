import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert } from 'lucide-react';
import StudentNavbar from '../components/StudentNavbar';

const BookingCountdownPage = () => {
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 45, s: 12 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => ({ ...prev, s: prev.s > 0 ? prev.s - 1 : 59 }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const TimeUnit = ({ val, label }) => (
        <div className="flex flex-col items-center">
            <div className="text-6xl md:text-8xl font-black text-white tracking-tighter bg-[#15202b]/60 px-6 py-6 rounded-4xl border border-white/10 backdrop-blur-xl shadow-2xl">
                {val < 10 ? `0${val}` : val}
            </div>
            <span className="text-[10px] font-black text-[#137fec] uppercase mt-6 tracking-[0.4em]">{label}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#101922] text-slate-200 font-sans">
            <StudentNavbar />
            <div className="max-w-4xl mx-auto pt-40 pb-12 px-6 flex flex-col items-center text-center space-y-12">
                
                <div className="space-y-4 animate-in fade-in zoom-in duration-1000">
                    <div className="flex justify-center mb-6">
                        <div className="p-5 bg-[#137fec]/10 rounded-full text-[#137fec] animate-pulse border border-[#137fec]/20 shadow-[0_0_50px_rgba(19,127,236,0.1)]">
                            <Clock size={48} />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tight italic">System Opening</h1>
                    <p className="text-slate-500 max-w-sm mx-auto font-medium">The FCFS window will synchronize at 10:00 AM. Access is granted in millisecond batches.</p>
                </div>

                <div className="flex gap-4 md:gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <TimeUnit val={timeLeft.h} label="Hours" />
                    <TimeUnit val={timeLeft.m} label="Minutes" />
                    <TimeUnit val={timeLeft.s} label="Seconds" />
                </div>

                <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500">
                    <ShieldAlert size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Do not refresh browser. Auto-sync active.</span>
                </div>
            </div>
        </div>
    );
};

export default BookingCountdownPage;