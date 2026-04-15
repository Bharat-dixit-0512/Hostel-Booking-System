import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { Download, ChevronLeft, Printer, Share2 } from 'lucide-react';
import AllotmentSlip from '../components/FCFS/AllotmentSlip';
import StudentNavbar from '../components/StudentNavbar';
import toast from 'react-hot-toast';

const DownloadSlipPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mock data agar direct access ho, warna Payment page se data aayega
  const bookingData = location.state?.bookingData || {
    name: "Prashant Singh",
    roll: "2115000888",
    hostel: "Kailash Bhavan",
    floor: 1,
    room: "101",
    bed: "101-A",
    bookingId: "GLA-HSTL-882109"
  };

  const handleDownload = () => {
    const element = document.getElementById('allotment-slip');
    const opt = {
      margin: 0,
      filename: `Allotment_Slip_${bookingData.roll}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    toast.loading("Generating Official PDF...");
    html2pdf().set(opt).from(element).save().then(() => {
        toast.dismiss();
        toast.success("Slip Downloaded Successfully!");
    });
  };

  return (
    <div className="min-h-screen bg-[#0b1118] text-slate-200 pb-20">
      <StudentNavbar />
      
      <main className="max-w-6xl mx-auto pt-32 px-6 space-y-10">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest cursor-pointer"
          >
            <ChevronLeft size={16} /> Dashboard
          </button>

          <div className="flex gap-3">
             <button onClick={() => window.print()} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all cursor-pointer border border-white/5">
                <Printer size={20} />
             </button>
             <button 
                onClick={handleDownload}
                className="flex items-center gap-3 px-8 py-4 bg-[#137fec] hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
             >
                <Download size={18} /> Download Allotment PDF
             </button>
          </div>
        </div>

        {/* Slip Preview Scale down for mobile view */}
        <div className="flex justify-center overflow-x-auto pb-10">
           <div className="origin-top scale-[0.6] md:scale-[0.8] lg:scale-100">
              <AllotmentSlip data={bookingData} />
           </div>
        </div>

      </main>
    </div>
  );
};

export default DownloadSlipPage;