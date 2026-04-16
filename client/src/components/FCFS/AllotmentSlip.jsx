import React from 'react';
import { QrCode, Download, Printer } from 'lucide-react';

const AllotmentSlip = ({ studentData }) => {
    return (
        <div className="p-8 bg-white text-black rounded-4xl max-w-sm mx-auto space-y-6">
            <div className="text-center border-b pb-6 border-slate-100">
                <h3 className="font-black text-xl uppercase tracking-tighter">GLA University</h3>
                <p className="text-[10px] font-bold text-slate-400">Hostel Allotment Slip 2024-25</p>
            </div>
            
            <div className="flex justify-center py-4 bg-slate-50 rounded-2xl">
                <QrCode size={150} strokeWidth={1.5} />
            </div>

            <div className="space-y-3">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Resident</span>
                    <span className="font-bold">{studentData.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Room Allotted</span>
                    <span className="font-bold">{studentData.room} ({studentData.hostel})</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Status</span>
                    <span className="text-emerald-600 font-black uppercase italic">Confirmed</span>
                </div>
            </div>

            <button className="w-full py-3 bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer">
                <Download size={14} /> Save Digital Copy
            </button>
        </div>
    );
};

export default AllotmentSlip;
