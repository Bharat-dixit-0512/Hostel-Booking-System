import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, Hotel, ChevronDown } from 'lucide-react';
import AnimatedBorder from './AnimatedBorder';
import AnimatedLogout from './AnimatedLogout';
import { useClickMouse } from '../hooks/ClickMouse';

function StudentNavbar() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const playClickSound = useClickMouse();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    playClickSound();
    setIsDropdownOpen(false);
    // Add logic to clear localStorage/session here if needed
    navigate('/login');
  }

  const handleProfile = () => {
    playClickSound();
    setIsDropdownOpen(false);
    navigate('/student/profile');
  }

  const toggleDropdown = () => {
    playClickSound();
    setIsDropdownOpen(!isDropdownOpen);
  }
  

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#101922]/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/student/dashboard" onClick={() => playClickSound()} className="flex items-center gap-3 active:scale-95 transition-transform">
          <div className="w-9 h-9 rounded-lg bg-[#137fec] flex items-center justify-center shadow-[0_0_15px_rgba(19,127,236,0.4)]">
            <Hotel className="text-white w-5 h-5" />
          </div>
          <div className="leading-none">
            <span className="text-white font-bold tracking-tight block">GLA Portal</span>
            <span className="text-[#137fec] text-[9px] font-black uppercase tracking-[0.2em]">University</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <Link 
            to="/student/booking" 
            className="text-slate-400 hover:text-[#137fec] text-sm font-semibold transition-colors hidden sm:block"
          >
            Browse Hostels
          </Link>

          {/* Profile Section */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={toggleDropdown} 
              className="cursor-pointer focus:outline-none"
            >
              <AnimatedBorder className="min-w-35">
                <div className="px-3 py-1.5 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#137fec]/20 flex items-center justify-center text-[10px] font-bold text-[#137fec]">
                    PS
                  </div>
                  <span className="text-xs font-bold text-slate-200">Prashant</span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </AnimatedBorder>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-[#15202b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* Profile Details Option */}
                <div className="p-1.5">
                  <AnimatedBorder className="w-full">
                    <button 
                      onClick={handleProfile} 
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer group"
                    >
                      <User className="w-4 h-4 text-[#137fec]" /> 
                      Profile Details
                    </button>
                  </AnimatedBorder>
                </div>

                {/* Sign Out Option */}
                <div className="p-1.5 pt-0">
                  <AnimatedLogout className="w-full">
                    <button 
                      onClick={handleSignOut} 
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> 
                      Sign Out
                    </button>
                  </AnimatedLogout>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default StudentNavbar;