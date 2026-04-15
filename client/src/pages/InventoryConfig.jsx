import React, { useState, useMemo } from 'react';
import { 
  Plus, Settings2, Trash2, Home, Layers, 
  X, Wind, BedDouble, Search, AlertCircle 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminNavbar from '../components/AdminNavbar';

const InventoryConfigPage = () => {
  // --- STATE MANAGEMENT ---
  const [hostels, setHostels] = useState([
    {
      id: '1',
      name: 'Kailash Bhavan (Block A)',
      floors: [
        { 
          id: 'f1', 
          number: 1, 
          rooms: [
            { id: 'r1', number: '101', type: 'AC', beds: 2 },
            { id: 'r2', number: '102', type: 'Non-AC', beds: 3 }
          ] 
        }
      ]
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('hostel'); 
  const [activeHostel, setActiveHostel] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    roomNumber: '',
    roomType: 'Non-AC',
    bedCount: 1,
    floorNumber: 1
  });

  // --- SEARCH FILTER LOGIC ---
  const filteredHostels = useMemo(() => {
    return hostels.filter((hostel) =>
      hostel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [hostels, searchQuery]);

  // --- TOAST PERMISSION HANDLERS ---

  // Permission for deleting a Room from Inventory
  const requestDeleteRoom = (hostelId, floorId, roomId, roomNo) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-slate-200">
          Remove <span className="text-emerald-400 font-bold">Room {roomNo}</span> from inventory?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              executeDeleteRoom(hostelId, floorId, roomId);
              toast.dismiss(t.id);
            }}
            className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: { background: '#15202b', border: '1px solid rgba(255,255,255,0.1)', padding: '16px' },
    });
  };

  // Permission for deleting a Hostel Block from Inventory
  const requestDeleteHostel = (hostelId, hostelName) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle size={16} />
          <p className="text-sm font-bold">Critical Action</p>
        </div>
        <p className="text-xs text-slate-300">
          Delete <span className="text-white font-bold">{hostelName}</span> and all its room inventory?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setHostels(hostels.filter(h => h.id !== hostelId));
              toast.success(`${hostelName} removed from inventory`);
              toast.dismiss(t.id);
            }}
            className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-all cursor-pointer"
          >
            Yes, Remove Block
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-bold px-4 py-2 rounded-lg transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-center',
      style: { background: '#101922', border: '1px solid #ef4444', padding: '20px' },
    });
  };

  // --- LOGIC FUNCTIONS ---
  const handleSaveHostel = () => {
    if (!formData.name) return toast.error("Enter Hostel Name");
    const newHostel = { id: Date.now().toString(), name: formData.name, floors: [] };
    setHostels([...hostels, newHostel]);
    toast.success("Inventory Block Added");
    closeModal();
  };

  const handleSaveRoom = () => {
    if (!formData.roomNumber || !formData.floorNumber) return toast.error("Fill all fields");
    if (formData.bedCount > 3) return toast.error("Maximum 3 beds allowed");

    const updatedHostels = hostels.map(hostel => {
      if (hostel.id === activeHostel.id) {
        let floor = hostel.floors.find(f => f.number === parseInt(formData.floorNumber));
        const newRoom = { id: Date.now().toString(), number: formData.roomNumber, type: formData.roomType, beds: parseInt(formData.bedCount) };

        if (floor) { floor.rooms.push(newRoom); } 
        else {
          hostel.floors.push({ id: Date.now().toString() + 'f', number: parseInt(formData.floorNumber), rooms: [newRoom] });
        }
        hostel.floors.sort((a, b) => a.number - b.number);
      }
      return hostel;
    });

    setHostels(updatedHostels);
    toast.success(`Room ${formData.roomNumber} added to inventory`);
    closeModal();
  };

  const executeDeleteRoom = (hostelId, floorId, roomId) => {
    setHostels(hostels.map(h => {
      if (h.id === hostelId) {
        h.floors = h.floors.map(f => {
          if (f.id === floorId) { f.rooms = f.rooms.filter(r => r.id !== roomId); }
          return f;
        }).filter(f => f.rooms.length > 0);
      }
      return h;
    }));
    toast.success("Room removed from inventory");
  };

  const openModal = (type, hostel = null) => {
    setModalType(type);
    setActiveHostel(hostel);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', roomNumber: '', roomType: 'Non-AC', bedCount: 1, floorNumber: 1 });
  };

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200">
      <Toaster />
      <AdminNavbar />
      
      <main className="max-w-6xl mx-auto pt-28 px-6 pb-12 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Settings2 size={16} className="text-emerald-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">System Setup</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Inventory Configuration</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Manage hostel blocks, floor plans, and room capacities.</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Search inventory..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button 
              onClick={() => openModal('hostel')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
            >
              <Plus size={16} /> New Block
            </button>
          </div>
        </header>

        <div className="space-y-10">
          {filteredHostels.length > 0 ? (
            filteredHostels.map((hostel) => {
              const totalRooms = hostel.floors.reduce((acc, f) => acc + f.rooms.length, 0);
              const totalBeds = hostel.floors.reduce((acc, f) => acc + f.rooms.reduce((ra, r) => ra + r.beds, 0), 0);

              return (
                <section key={hostel.id} className="bg-[#15202b]/40 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-xl">
                  <div className="p-8 border-b border-white/5 bg-white/2 flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500"><Home size={28} /></div>
                      <div>
                        <h2 className="text-2xl font-black text-white">{hostel.name}</h2>
                        <div className="flex gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          <span className="bg-white/5 px-2 py-1 rounded">{totalRooms} Total Rooms</span> 
                          <span className="bg-white/5 px-2 py-1 rounded">{totalBeds} Total Berths</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => openModal('room', hostel)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold border border-white/10 transition-all cursor-pointer">Add Room</button>
                      <button onClick={() => requestDeleteHostel(hostel.id, hostel.name)} className="p-2.5 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-xl transition-all cursor-pointer">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {hostel.floors.map((floor) => (
                      <div key={floor.id} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] px-4 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/10">Floor {floor.number}</h4>
                          <div className="h-[1px] flex-1 bg-white/5"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {floor.rooms.map((room) => (
                            <div key={room.id} className="bg-black/20 border border-white/5 p-5 rounded-3xl group relative hover:border-emerald-500/30 transition-all">
                              <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${room.type === 'AC' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>{room.type}</span>
                                <button onClick={() => requestDeleteRoom(hostel.id, floor.id, room.id, room.number)} className="text-slate-600 hover:text-red-500 transition-colors cursor-pointer">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <h5 className="text-xl font-bold text-white mb-1">Room {room.number}</h5>
                              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold"><BedDouble size={14} /> {room.beds} Beds</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-[40px]">
                <p className="text-slate-500 text-sm font-medium">No results found for your search.</p>
            </div>
          )}
        </div>
      </main>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-[#15202b] border border-white/10 w-full max-w-md rounded-[40px] shadow-2xl p-10 space-y-6 text-left">
              <h2 className="text-2xl font-black text-white">{modalType === 'hostel' ? 'Add Inventory Block' : 'Add Room to Inventory'}</h2>
              <div className="space-y-5">
                {modalType === 'hostel' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Block Name</label>
                    <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500" placeholder="e.g. Kailash Bhavan" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Floor</label>
                        <input type="number" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500" placeholder="0" value={formData.floorNumber} onChange={(e) => setFormData({...formData, floorNumber: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Room No</label>
                        <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500" placeholder="101" value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Beds (Max 3)</label>
                        <input type="number" max="3" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500" placeholder="0" value={formData.bedCount} onChange={(e) => setFormData({...formData, bedCount: Math.min(3, e.target.value)})} />
                      </div>
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">AC Type</label>
                        <select className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white cursor-pointer focus:outline-none focus:border-emerald-500 appearance-none" value={formData.roomType} onChange={(e) => setFormData({...formData, roomType: e.target.value})}>
                          <option value="Non-AC">Non-AC</option><option value="AC">AC</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={closeModal} className="flex-1 py-4 bg-white/5 rounded-2xl text-xs font-black text-slate-400 cursor-pointer transition-all">Discard</button>
                <button onClick={modalType === 'hostel' ? handleSaveHostel : handleSaveRoom} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-xs font-black text-white transition-all cursor-pointer shadow-lg shadow-emerald-500/20">Save Inventory</button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryConfigPage;