import React from 'react';
import { Copy, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const RoommateCode = ({ code, isOwner = true }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        toast.success("Code copied! Share with your friend.");
    };

    return (
        <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-purple-400">
                <Users size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Group Booking</span>
            </div>
            {isOwner ? (
                <div className="space-y-2">
                    <p className="text-xs text-slate-400">Share this code with your friend to book the same room:</p>
                    <div className="flex gap-2">
                        <code className="flex-1 px-4 py-3 bg-black/40 rounded-xl text-white font-mono font-bold text-center tracking-[0.5em]">
                            {code}
                        </code>
                        <button onClick={copyToClipboard} className="p-3 bg-purple-600 rounded-xl text-white hover:bg-purple-500 transition-all cursor-pointer">
                            <Copy size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <input 
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-center focus:border-purple-500 outline-none"
                        placeholder="Enter Friend's Code"
                    />
                    <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold text-xs cursor-pointer">JOIN ROOM</button>
                </div>
            )}
        </div>
    );
};

export default RoommateCode;
