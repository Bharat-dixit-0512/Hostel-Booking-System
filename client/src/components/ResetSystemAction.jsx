import React, { useState } from "react";
import { Lock, RefreshCcw, ShieldAlert, X } from "lucide-react";
import toast from "react-hot-toast";

import axiosInstance from "../lib/axios";
import { useClickMouse } from "../hooks/ClickMouse";
import { getErrorMessage } from "../lib/errors";

const ResetSystemAction = ({ disabled = false, onSuccess }) => {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const playClickSound = useClickMouse();

  const handleResetInitiate = () => {
    if (disabled) {
      return;
    }

    playClickSound();
    setShowModal(true);
  };

  const handleFinalReset = async (event) => {
    event.preventDefault();
    playClickSound();
    setIsSubmitting(true);
    const toastId = toast.loading("Initializing global system reset...");

    try {
      await axiosInstance.post("/admin/session/reset", {
        password,
      });
      toast.success("All residential records have been cleared.", { id: toastId });
      setShowModal(false);
      setPassword("");
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to reset system"), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="h-full bg-red-500/5 border border-red-500/10 p-8 rounded-4xl backdrop-blur-md flex flex-col justify-between group hover:border-red-500/20 transition-all">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
            <RefreshCcw size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-none">System Initialization</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
              Clear all residential data
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={handleResetInitiate}
          className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer border border-red-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Reset All Data
        </button>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />

          <div className="relative w-full max-w-lg bg-[#15202b] border border-white/10 rounded-[40px] p-10 shadow-3xl animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-8 right-8 text-slate-500 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-red-500/20 text-red-500">
                  <ShieldAlert size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight leading-none">
                    Global Reset
                  </h2>
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">
                    High-Privilege Operation
                  </p>
                </div>
              </div>

              <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                  You are about to re-initialize the portal for a new session. This will:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                    <span>Delete all booking records from the hostel session database.</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                    <span>Reset every room&apos;s available beds back to full capacity.</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                    <span className="text-red-400 font-bold uppercase">This action cannot be undone.</span>
                  </li>
                </ul>
              </div>

              <form onSubmit={handleFinalReset} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Admin Verification
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter profile password"
                      className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl text-sm text-white focus:border-red-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98] cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? "Authorizing..." : "Authorize Reset"}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ResetSystemAction;
