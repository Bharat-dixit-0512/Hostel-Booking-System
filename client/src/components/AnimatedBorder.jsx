import React from 'react';

const AnimatedBorder = ({ children, className = "", duration = "3s" ,color}) => {
  return (
    <div className={`relative p-px overflow-hidden rounded-xl group ${className}`}>
      {/* The Animated Gradient Layer */}
      <div 
        className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          animationDuration: duration,
          background: `${
            color
              ? color
              : "conic-gradient(from 90deg at 50% 50%, #137fec 0%, var(--theme-border-base) 25%, #137fec 50%, var(--theme-border-base) 75%, #137fec 100%)"
          }`
        }}
      />
      {/* The Content Container */}
      <div className="relative bg-[#15202b] rounded-[11px] h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBorder;
