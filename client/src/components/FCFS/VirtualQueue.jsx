import React from 'react';
import { Users, Loader2 } from 'lucide-react';

const VirtualQueue = ({ position, estimatedTime }) => {
    return (
        <div className="fixed inset-0 bg-[#101922] z-200 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#15202b] border border-white/5 rounded-[40px] p-10 text-center space-y-8 shadow-2xl">
                <div className="relative inline-block">
                    <Loader2 size={80} className="text-emerald-500 animate-spin opacity-20" />
                    <Users size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white">You are in the Queue</h2>
                    <p className="text-slate-500 text-sm">To ensure fairness, we are letting students in batches. Please do not refresh.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase">Your Position</p>
                        <p className="text-2xl font-bold text-white">#{position}</p>
                    </div>
                    <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase">Est. Wait</p>
                        <p className="text-2xl font-bold text-white">{estimatedTime}m</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VirtualQueue;