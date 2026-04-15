import React, { useState, useMemo } from 'react';
import { Filter, Search, Check, X, AlertCircle, UserCheck, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminNavbar from '../components/AdminNavbar';

const ApplicationRegistryPage = () => {
  // --- STATE MANAGEMENT ---
  const [registry, setRegistry] = useState([
    { id: 1, name: "Rahul Verma", roll: "2115000121", hostel: "Kailash Bhavan", status: "Approved" },
    { id: 2, name: "Sneha Kapoor", roll: "2115000452", hostel: "N/A", status: "Pending" },
    { id: 3, name: "Amit Sharma", roll: "2115000889", hostel: "Nilgiri Tower", status: "Rejected" },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  // --- SEARCH LOGIC ---
  const filteredRegistry = useMemo(() => {
    return registry.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.roll.includes(searchQuery)
    );
  }, [registry, searchQuery]);

  // --- PERMISSION HANDLERS (TOASTS) ---

  // Permission for Approval
  const requestApprove = (id, name) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <UserCheck size={18} />
          <p className="text-sm font-bold">Confirm Approval</p>
        </div>
        <p className="text-xs text-slate-300">
          Approve residential application for <span className="text-white font-bold">{name}</span>?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              updateStatus(id, 'Approved');
              toast.dismiss(t.id);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black px-4 py-2 rounded-lg transition-all cursor-pointer"
          >
            Yes, Approve
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-black px-4 py-2 rounded-lg transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: { background: '#15202b', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px' },
    });
  };

  // Permission for Deletion/Rejection
  const requestDelete = (id, name) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle size={18} />
          <p className="text-sm font-bold">Confirm Deletion</p>
        </div>
        <p className="text-xs text-slate-300">
          Permanently remove <span className="text-white font-bold">{name}</span> from the registry?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              deleteEntry(id);
              toast.dismiss(t.id);
            }}
            className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-lg transition-all cursor-pointer"
          >
            Delete Entry
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-black px-4 py-2 rounded-lg transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: { background: '#101922', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px' },
    });
  };

  // --- ACTIONS ---
  const updateStatus = (id, newStatus) => {
    setRegistry(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    toast.success(`Application ${newStatus}`, { style: { background: '#15202b', color: '#fff', fontSize: '12px' } });
  };

  const deleteEntry = (id) => {
    setRegistry(prev => prev.filter(item => item.id !== id));
    toast.error(`Entry Removed`, { style: { background: '#15202b', color: '#fff', fontSize: '12px' } });
  };

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200 font-sans">
      <Toaster />
      <AdminNavbar />
      
      <main className="max-w-6xl mx-auto pt-28 px-6 pb-12 space-y-8">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Application Registry</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Review and manage residential applications.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search by name or roll..." 
                className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs outline-none focus:border-purple-500/50 w-64 transition-all" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
              <Filter size={18} />
            </button>
          </div>
        </header>

        {/* REGISTRY TABLE */}
        <div className="bg-[#15202b]/40 border border-white/5 rounded-4xl backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student Info</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Roll Number</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Allotted Hostel</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRegistry.length > 0 ? (
                  filteredRegistry.map((item) => (
                    <tr key={item.id} className="hover:bg-white/2 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-bold text-sm text-white">{item.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-tight mt-0.5">Regular Resident</p>
                      </td>
                      <td className="px-8 py-6 font-mono text-xs text-slate-400">{item.roll}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.hostel === 'N/A' ? 'bg-slate-600' : 'bg-purple-500'}`}></div>
                          <span className="text-sm text-slate-300">{item.hostel}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                          item.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                          item.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => requestApprove(item.id, item.name)}
                            className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg cursor-pointer transition-all"
                            title="Approve Application"
                          >
                            <Check size={18}/>
                          </button>
                          <button 
                            onClick={() => requestDelete(item.id, item.name)}
                            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition-all"
                            title="Delete Entry"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-500">
                      <p className="text-sm italic">No records found matching your search criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicationRegistryPage;