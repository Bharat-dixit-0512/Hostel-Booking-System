import React from 'react';

const LiveTicker = ({ hostelName, total, available }) => {
    const percentage = (available / total) * 100;
    const isLow = available < 10;

    return (
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
            <div className="flex justify-between items-end">
                <h4 className="text-sm font-bold text-white">{hostelName}</h4>
                <span className={`text-xs font-black ${isLow ? 'text-red-500 animate-bounce' : 'text-emerald-500'}`}>
                    {available} Berths Left
                </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-1000 ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default LiveTicker;