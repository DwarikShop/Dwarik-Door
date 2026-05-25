"use client";

/**
 * LoadingScreen
 *
 * Shown while AuthContext is rehydrating the session from the JWT cookie.
 * Designed with a high-fidelity light-luxury cinematic look matching Dwarik Door brand.
 */

export function LoadingScreen() {
  return (
    <div className="h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#1C0F0D] via-[#2D1A16] to-[#140807] flex flex-col items-center justify-center p-6 font-sans select-none">
      
      {/* Luxury sliding loader animation style injected */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loaderMove {
          0% { left: -35%; }
          100% { left: 100%; }
        }
        .animate-loader {
          animation: loaderMove 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}} />

      {/* Cinematic pulsing warm backdrop glows */}
      <div className="absolute w-[260px] h-[260px] rounded-full bg-accent/10 blur-[90px] animate-pulse pointer-events-none duration-[4000ms]" />
      <div className="absolute w-[320px] h-[320px] rounded-full bg-primary/10 blur-[120px] animate-pulse pointer-events-none duration-[6000ms]" />

      {/* Elegant geometric grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Rotating Brand Logo Ring Container */}
      <div className="relative mb-6 flex items-center justify-center">
        
        {/* Pulsing Outer ambient ring */}
        <div className="absolute -inset-4 border border-accent/20 rounded-[36px] animate-[pulse_3s_infinite] pointer-events-none" />
        
        {/* Slowly Spinning Gold Star Accent Ring */}
        <div className="absolute -inset-2 border border-dashed border-accent/30 rounded-[32px] animate-[spin_10s_linear_infinite] pointer-events-none" />
        
        {/* Core Double-Door Logo */}
        <div className="w-20 h-20 bg-gradient-to-tr from-[#3A2421] to-[#5C3A35] rounded-3xl border border-accent/30 flex items-center justify-center shadow-xl relative z-10">
          <svg
            viewBox="0 0 64 64"
            className="w-10 h-10 text-accent animate-pulse"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 56V8a2 2 0 0 1 2-2h32a2 2 0 0 1 2 2v48" stroke="#C89B3C" strokeWidth="2.5" />
            <line x1="32" y1="6" x2="32" y2="56" stroke="#1E1311" strokeWidth="1.5" />
            <line x1="28" y1="26" x2="28" y2="34" stroke="#C89B3C" strokeWidth="3" />
            <circle cx="28" cy="30" r="1.5" fill="#C89B3C" />
            <rect x="19" y="11" width="7" height="12" rx="1" stroke="#C89B3C" strokeWidth="1" strokeOpacity="0.4" />
            <rect x="38" y="11" width="7" height="12" rx="1" stroke="#C89B3C" strokeWidth="1" strokeOpacity="0.4" />
            <rect x="19" y="37" width="7" height="12" rx="1" stroke="#C89B3C" strokeWidth="1" strokeOpacity="0.4" />
            <rect x="38" y="37" width="7" height="12" rx="1" stroke="#C89B3C" strokeWidth="1" strokeOpacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Elegant Serif Branding typography */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black tracking-[0.25em] text-[#F5E6D3] uppercase">
          Dwarik Door
        </h2>
        <p className="text-[9px] uppercase tracking-[0.3em] text-accent font-extrabold opacity-90">
          Premium Door Manufacturing
        </p>
      </div>

      {/* Luxury progressive loading bar */}
      <div className="w-36 h-1 bg-white/5 rounded-full overflow-hidden relative mt-8 border border-white/5 shadow-inner">
        <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-accent to-[#DAB668] rounded-full animate-loader pointer-events-none" />
      </div>
      
      {/* Secure Connection Label */}
      <span className="text-[8px] uppercase tracking-[0.2em] text-[#FAF9F6]/30 font-bold mt-3 animate-pulse">
        Initializing Secure Connection...
      </span>

    </div>
  );
}
