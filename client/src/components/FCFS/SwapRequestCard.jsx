import React from 'react';
import { ArrowRightLeft, UserCircle2, Home, Check, X } from 'lucide-react';

const SwapRequestCard = ({ type = "incoming", sender, currentRoom, targetRoom, onAccept, onDecline }) => {
    const isIncoming = type === "incoming";

    return (
        <div className="bg-[#15202b] border border-white/5 rounded-4xl p-8 space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-4 -right-4 p-8 text-emerald-500/5 rotate-12">
                <ArrowRightLeft size={100} />
            </div>

            <div className="flex items-center gap-4 relative z-10">
                <div className={`p-3 rounded-2xl ${isIncoming ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                    <ArrowRightLeft size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-white">
                        {isIncoming ? "Incoming Swap Offer" : "Swap Request Sent"}
                    </h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Ref ID: SWP-{Math.floor(Math.random() * 9000) + 1000}
                    </p>
                </div>
            </div>

            {/* Comparison Logic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center relative z-10">
                <div className="p-5 bg-black/20 rounded-2xl border border-white/5 space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase">You Give Up</p>
                    <div className="flex items-center gap-3">
                        <Home size={16} className="text-red-500" />
                        <span className="text-sm font-bold text-white">{currentRoom}</span>
                    </div>
                </div>
                
                <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 space-y-2 border-dashed">
                    <p className="text-[10px] font-black text-emerald-500 uppercase">You Receive</p>
                    <div className="flex items-center gap-3">
                        <Home size={16} className="text-emerald-500" />
                        <span className="text-sm font-bold text-white">{targetRoom}</span>
                    </div>
                </div>
            </div>

            {isIncoming ? (
                <div className="flex gap-3 relative z-10">
                    <button 
                        onClick={onAccept}
                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                        <Check size={16} /> Accept Swap
                    </button>
                    <button 
                        onClick={onDecline}
                        className="p-4 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-2xl transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <div className="py-3 text-center border-t border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 animate-pulse">Waiting for {sender} to confirm...</p>
                </div>
            )}
        </div>
    );
};

export default SwapRequestCard;