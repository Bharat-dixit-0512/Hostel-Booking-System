import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, ArrowRight, DoorOpen, 
  Bed as BedIcon, ChevronLeft, Timer
} from 'lucide-react';
import StudentNavbar from '../components/StudentNavbar';
import toast from 'react-hot-toast';

const MOCK_INVENTORY = [
  {
    id: "H-101", name: "Kailash Bhavan", gender: "Male", fee: "₹45,000",
    floors: [
      { 
        level: 1, 
        rooms: [
          { no: "101", beds: [{ id: "101-A", status: "available" }, { id: "101-B", status: "occupied" }, { id: "101-C", status: "available" }] },
          { no: "102", beds: [{ id: "102-A", status: "occupied" }, { id: "102-B", status: "occupied" }, { id: "102-C", status: "available" }] },
          { no: "103", beds: [{ id: "103-A", status: "available" }, { id: "103-B", status: "available" }, { id: "103-C", status: "available" }] },
        ]
      },
      { level: 2, rooms: [{ no: "201", beds: [{ id: "201-A", status: "available" }] }] }
    ]
  },
  { id: "H-302", name: "Sahyadri Hostel", gender: "Female", fee: "₹45,000", floors: [] }
];

const BrowseHostelsPage = () => {
  const navigate = useNavigate();
  const userGender = "Male"; 

  const [step, setStep] = useState(1); 
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [activeFloor, setActiveFloor] = useState(1);
  const [selection, setSelection] = useState({ room: null, bed: null });

  const handleHostelSelect = (hostel) => {
    if (hostel.gender !== userGender) return toast.error("Gender Mismatch: Access Denied.");
    setSelectedHostel(hostel);
    setStep(2);
    toast.success(`${hostel.name} selected.`);
  };

  const handleBedSelect = (roomNo, bedId, status) => {
    if (status === "occupied") return toast.error("Berth already booked.");
    setSelection({ room: roomNo, bed: bedId });
    toast.success(`Berth ${bedId} selected!`, { icon: '🎯' });
  };

  const handleProceedToPayment = () => {
    if (!selection.bed) return toast.error("Please select a specific bed.");
    
    const loadId = toast.loading("Locking your choice...");
    setTimeout(() => {
      toast.dismiss(loadId);
      navigate('/student/payment', { 
        state: { 
          hostel: selectedHostel,
          room: selection.room,
          bed: selection.bed
        } 
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200 font-sans">
      <StudentNavbar />

      <main className="max-w-6xl mx-auto pt-32 px-6 pb-32">
        
        {/* STEP 1: HOSTEL CARDS */}
        {step === 1 && (
          <div className="space-y-10">
            <header>
              <h1 className="text-4xl font-black text-white italic tracking-tight">Available Blocks</h1>
              <p className="text-slate-500 text-sm mt-2">Pick a hostel to view live room availability.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_INVENTORY.map((h) => (
                <div 
                  key={h.id}
                  onClick={() => handleHostelSelect(h)}
                  className={`group bg-[#15202b]/40 border border-white/5 p-8 rounded-[40px] backdrop-blur-md hover:bg-[#15202b]/60 transition-all cursor-pointer relative overflow-hidden ${h.gender !== userGender ? 'opacity-40 grayscale cursor-not-allowed!' : ''}`}
                >
                  <div className="relative z-10 space-y-6">
                    <div className="p-4 rounded-2xl bg-white/5 text-[#137fec] w-fit">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-[#137fec] transition-colors">{h.name}</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{h.gender} Block</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-sm font-bold text-white">{h.fee}</span>
                      <ArrowRight size={18} className="text-[#137fec] group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: FLOOR & BED SELECTION */}
        {step === 2 && (
          <div className="space-y-10 animate-in fade-in zoom-in duration-500">
            <header className="flex items-center justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer">
                <ChevronLeft size={16} /> Back to Blocks
              </button>
              <div className="flex items-center gap-3 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-500">
                 <Timer size={14} className="animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest">FCFS Window Active</span>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              <div className="lg:col-span-8 space-y-8">
                {/* Floor Navigation */}
                <div className="flex gap-4">
                  {selectedHostel.floors.map(f => (
                    <button 
                      key={f.level}
                      onClick={() => setActiveFloor(f.level)}
                      className={`px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all cursor-pointer ${activeFloor === f.level ? 'bg-[#137fec] text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                    >
                      Floor 0{f.level}
                    </button>
                  ))}
                </div>

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedHostel.floors.find(f => f.level === activeFloor)?.rooms.map(room => (
                    <div key={room.no} className={`p-6 rounded-4xl border transition-all ${selection.room === room.no ? 'bg-[#137fec]/10 border-[#137fec]/40' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-white/5 text-slate-400"><DoorOpen size={18} /></div>
                        <h4 className="text-lg font-bold text-white tracking-tight">Room {room.no}</h4>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {room.beds.map(bed => (
                          <button
                            key={bed.id}
                            disabled={bed.status === 'occupied'}
                            onClick={() => handleBedSelect(room.no, bed.id, bed.status)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all
                              ${bed.status === 'occupied' ? 'bg-red-500/10 border-transparent opacity-20 cursor-not-allowed' : 
                                selection.bed === bed.id ? 'bg-[#137fec] border-transparent text-white scale-105 shadow-lg cursor-pointer' : 'bg-black/40 border-white/5 hover:border-[#137fec]/50 cursor-pointer'}
                            `}
                          >
                            <BedIcon size={16} />
                            <span className="text-[10px] font-black uppercase">{bed.id.split('-')[1]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selection Sidebar */}
              <aside className="lg:col-span-4">
                <div className="bg-[#15202b] border border-white/5 rounded-[40px] p-8 space-y-8 sticky top-32 shadow-2xl">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Summary</p>
                      <h3 className="text-xl font-bold text-white">{selectedHostel.name}</h3>
                   </div>

                   <div className="space-y-4">
                      <SelectionItem label="Floor" value={`Floor 0${activeFloor}`} />
                      <SelectionItem label="Room" value={selection.room ? `Room ${selection.room}` : "Not Selected"} />
                      <SelectionItem label="Specific Berth" value={selection.bed || "Not Selected"} highlight={!!selection.bed} />
                   </div>

                   <div className="pt-6 border-t border-white/5 space-y-4">
                      <button 
                        onClick={handleProceedToPayment}
                        className="w-full py-5 bg-[#137fec] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl transition-all shadow-xl shadow-[#137fec]/20 flex items-center justify-center gap-3 cursor-pointer active:scale-95"
                      >
                        Secure This Berth <ArrowRight size={16} />
                      </button>
                   </div>
                </div>
              </aside>

            </div>
          </div>
        )}
      </main>

      {/* Legend Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b1118]/80 backdrop-blur-xl border-t border-white/5 p-4 flex justify-center">
          <div className="flex items-center gap-8">
            <Legend item="Available" color="bg-white/10" />
            <Legend item="Occupied" color="bg-red-500/20" />
            <Legend item="Selected" color="bg-[#137fec]" />
          </div>
      </footer>
    </div>
  );
};

// UI Helpers
const SelectionItem = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center text-xs">
    <span className="text-slate-500 font-medium">{label}</span>
    <span className={`font-bold ${highlight ? 'text-emerald-500' : 'text-slate-300'}`}>{value}</span>
  </div>
);

const Legend = ({ item, color }) => (
  <div className="flex items-center gap-2 cursor-default">
    <div className={`w-3 h-3 rounded-sm ${color}`} />
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item}</span>
  </div>
);

export default BrowseHostelsPage;