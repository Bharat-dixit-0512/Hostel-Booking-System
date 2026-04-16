import React from "react";
import { MoonStar, Palette, SunMedium } from "lucide-react";

import { useTheme } from "../hooks/useTheme";

function ThemePreferenceCard({
  accentTextClass = "text-emerald-500",
  accentSurfaceClass = "bg-emerald-500/10",
  accentBorderClass = "border-emerald-500/20",
  accentGlowClass = "shadow-[0_0_20px_rgba(16,185,129,0.14)]",
  accentLabel = "Whole System",
}) {
  const { theme, setTheme } = useTheme();

  const themeButtonClass = (mode) =>
    theme === mode
      ? `${accentSurfaceClass} ${accentBorderClass} ${accentTextClass} ${accentGlowClass}`
      : "border-transparent text-slate-400 hover:text-white hover:bg-white/5";

  return (
    <div className="bg-[#15202b]/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
      <div className="flex items-center gap-4 mb-5">
        <div className={`p-3 rounded-xl border ${accentSurfaceClass} ${accentBorderClass} ${accentTextClass}`}>
          <Palette size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white leading-none">Appearance</h3>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">
            {accentLabel}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-1.5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${themeButtonClass("dark")}`}
          aria-pressed={theme === "dark"}
        >
          <MoonStar size={14} />
          Dark
        </button>

        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${themeButtonClass("light")}`}
          aria-pressed={theme === "light"}
        >
          <SunMedium size={14} />
          Light
        </button>
      </div>

      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-4">
        Current mode: <span className="text-white font-bold capitalize">{theme}</span>. This preference
        updates the whole portal and stays saved on this browser.
      </p>
    </div>
  );
}

export default ThemePreferenceCard;
