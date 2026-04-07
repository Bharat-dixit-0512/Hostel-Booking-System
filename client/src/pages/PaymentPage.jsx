import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Lock, ArrowRight, CheckCircle2, Download } from 'lucide-react';
import StudentNavbar from '../components/StudentNavbar';
import toast, { Toaster } from 'react-hot-toast';

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const hostel = state?.hostel || { name: "Not Selected", fee: "₹0" };

  const handlePay = () => {
    setIsProcessing(true);
    const loadId = toast.loading("Connecting to secure gateway...");
    
    setTimeout(() => {
      toast.success("Payment successful!", { id: loadId });
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#101922] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#15202b] border border-emerald-500/20 rounded-[40px] p-10 text-center space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
           <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 size={40} />
           </div>
           <h2 className="text-3xl font-black text-white italic">Booking Confirmed</h2>
           <p className="text-slate-500 text-sm leading-relaxed">Your berth in <span className="text-white font-bold">{hostel.name}</span> has been locked and officially allotted.</p>
           <div className="pt-6 flex flex-col gap-3">
              <button onClick={() => navigate('/student/dashboard')} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer">
                Return to Dashboard
              </button>
              <button className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                <Download size={14} /> Download Allotment Slip
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200">
      <StudentNavbar />
      <Toaster />
      <main className="max-w-4xl mx-auto pt-32 px-6 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Payment Form */}
        <div className="lg:col-span-7 space-y-8">
           <header>
              <h1 className="text-3xl font-black text-white italic">Secure Checkout</h1>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                <Lock size={12} className="text-emerald-500" /> 256-bit SSL Encryption
              </p>
           </header>

           <div className="bg-[#15202b]/40 border border-white/5 rounded-[40px] p-10 space-y-8 backdrop-blur-md">
              <div className="flex gap-4">
                 <div className="flex-1 p-4 bg-[#137fec]/10 border border-[#137fec]/20 rounded-2xl flex items-center gap-3">
                    <CreditCard className="text-[#137fec]" />
                    <span className="text-xs font-bold text-white">Card Payment</span>
                 </div>
                 <div className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 grayscale opacity-40">
                    <ShieldCheck className="text-slate-400" />
                    <span className="text-xs font-bold">UPI / NetBanking</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <input placeholder="Cardholder Name" className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-[#137fec]/50 text-sm" />
                 <input placeholder="Card Number" className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-[#137fec]/50 text-sm" />
                 <div className="flex gap-4">
                    <input placeholder="MM/YY" className="flex-1 px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-[#137fec]/50 text-sm" />
                    <input placeholder="CVV" className="flex-1 px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-[#137fec]/50 text-sm" />
                 </div>
              </div>

              <button 
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-5 bg-[#137fec] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl transition-all shadow-xl shadow-[#137fec]/20 flex items-center justify-center gap-3 cursor-pointer"
              >
                {isProcessing ? "Processing Transaction..." : `Pay ${hostel.fee} Now`}
              </button>
           </div>
        </div>

        {/* Right: Order Summary */}
        <aside className="lg:col-span-5">
           <div className="bg-[#137fec]/5 border border-[#137fec]/10 rounded-[40px] p-8 space-y-6 sticky top-32">
              <h3 className="text-lg font-bold text-white">Booking Summary</h3>
              <div className="space-y-4">
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Selected Hostel</span>
                    <span className="text-white font-bold">{hostel.name}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Room Type</span>
                    <span className="text-white font-bold">Standard Shared</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Academic Session</span>
                    <span className="text-white font-bold">2024 - 2025</span>
                 </div>
                 <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-[#137fec]">Total Payable</span>
                    <span className="text-2xl font-black text-white">{hostel.fee}</span>
                 </div>
              </div>
           </div>
        </aside>

      </main>
    </div>
  );
};

export default PaymentPage;