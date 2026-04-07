import React, { useState } from 'react';
import { Power, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useClickMouse } from '../hooks/ClickMouse';

const BookingWindowToggle = ({ isOpen, setOpen }) => {
  const [showModal, setShowModal] = useState(false);
  const playClickSound = useClickMouse();

  // Function to trigger after admin confirms in modal
  const handleConfirmToggle = () => {
    playClickSound();
    const newState = !isOpen;
    setOpen(newState);
    setShowModal(false);

    toast.success(`Booking window ${newState ? 'Opened' : 'Closed'} successfully`, {
      icon: newState ? '🔓' : '🔒',
      style: { 
        background: '#15202b', 
        color: '#fff', 
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '14px',
        fontWeight: 'bold'
      }
    });
  };

  const handleToggleClick = () => {
    playClickSound();
    setShowModal(true);
  };

  return (
    <>
      {/* Main Toggle Card */}
      <div className="bg-[#15202b]/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md flex items-center justify-between shadow-2xl transition-all hover:border-white/10">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl transition-all duration-500 ${isOpen ? 'bg-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]'}`}>
            <Power size={24} className={isOpen ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">Portal Access Control</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {isOpen ? 'Booking is currently ACTIVE for all students' : 'Booking is currently LOCKED for all students'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleToggleClick}
          className={`relative w-16 h-8 rounded-full transition-all duration-300 cursor-pointer p-1 ${isOpen ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-700'}`}
        >
          <div className={`w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md transform ${isOpen ? 'translate-x-8' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setShowModal(false)} 
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-[#15202b] border border-white/10 rounded-4xl p-8 shadow-3xl animate-in zoom-in-95 fade-in duration-200">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className={`p-4 rounded-3xl mb-6 ${isOpen ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {isOpen ? <AlertTriangle size={40} /> : <ShieldCheck size={40} />}
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                Confirm {isOpen ? 'Close' : 'Open'} Portal?
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                {isOpen 
                  ? "Are you sure you want to lock the booking window? Students will no longer be able to submit new applications." 
                  : "Are you sure you want to open the portal? This will allow all eligible students to start booking rooms immediately."}
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={handleConfirmToggle}
                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 cursor-pointer ${
                    isOpen 
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_10px_20px_rgba(239,68,68,0.2)]' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_10px_20px_rgba(16,185,129,0.2)]'
                  }`}
                >
                  Confirm & Update Status
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-4 rounded-2xl font-bold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingWindowToggle;