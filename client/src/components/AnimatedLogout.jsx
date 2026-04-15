import React from 'react';

const AnimatedLogout = ({ children, className = "", duration = "3s" }) => {
  return (
    <div className={`relative p-px overflow-hidden rounded-xl group ${className}`}>
      {/* The Animated Gradient Layer */}
      <div 
        className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          animationDuration: duration,
          background: 'conic-gradient(from 90deg at 50% 50%, #ff0000 0%, #101922 25%, #ff0000 50%, #101922 75%, #ff0000 100%)'
        }}
      />
      {/* The Content Container */}
      <div className="relative bg-[#15202b] rounded-[11px] h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default AnimatedLogout;