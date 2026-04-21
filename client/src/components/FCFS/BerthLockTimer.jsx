import React, { useState, useEffect } from "react";
import { Timer, AlertCircle } from "lucide-react";

const BerthLockTimer = ({ initialMinutes = 15, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-500">
      <Timer size={16} className="animate-pulse" />
      <span className="text-xs font-black tracking-widest">
        SESSION LOCK: {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default BerthLockTimer;
