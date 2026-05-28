"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { ArrowLeft, Phone, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !password) {
      toast.error("Please enter phone and password");
      return;
    }

    setIsLoading(true);
    try {
      const loggedInUser = await login(phone, password);

      if (loggedInUser) {
        toast.success("Welcome back! Login successful.");
        setTimeout(() => {
          router.push(
            loggedInUser.role === "owner" ? "/dashboard" : "/employee/dashboard",
          );
        }, 300);
      } else {
        toast.error("Invalid credentials. Please verify your phone and password.");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("An error occurred during authentication. Please try again.");
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen w-full flex font-sans select-none bg-[#FAF9F6] dark:bg-[#150F0D] overflow-hidden relative">
      
      {/* Dynamic shine button animation injected directly */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(250%) skewX(-12deg); }
        }
        .animate-shine {
          animation: shine 0.85s ease-in-out;
        }
      `}} />

      {/* Floating Back to Home glassmorphic pill */}
      <button
        onClick={() => router.push("/home")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 text-[10px] font-bold text-[#4E342E] dark:text-[#F5E6D3] uppercase tracking-widest transition-all hover:bg-[#FAF9F6]/20 active:scale-95 bg-white/70 dark:bg-[#2D1F1D]/50 backdrop-blur-md px-4 py-2.5 rounded-full border border-black/5 dark:border-white/10 shadow-md cursor-pointer"
      >
        <ArrowLeft size={12} className="text-accent" />
        Back to Home
      </button>

      {/* ── LEFT PANE: Premium Editorial Showcase (Wide Screen Only) ── */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-[#261715] flex-col justify-between p-12">
        {/* Luxury Wood Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay scale-105 transition-transform duration-10000" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=1200&fit=crop')" }} 
        />
        {/* Dynamic Warm Ambient Light Spotlights */}
        <div className="absolute top-[20%] left-[-10%] w-[380px] h-[380px] rounded-full bg-accent/20 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[380px] h-[380px] rounded-full bg-[#4E342E]/50 blur-[130px] pointer-events-none" />

        {/* Elegant geometric grid lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Brand Logo header */}
        <div className="z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center border border-accent/20">
            <svg viewBox="0 0 64 64" className="w-5 h-5 text-accent animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 56V8a2 2 0 0 1 2-2h32a2 2 0 0 1 2 2v48" stroke="#C89B3C" />
              <line x1="32" y1="6" x2="32" y2="56" stroke="#4E342E" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#FAF9F6]/90">Dwarik Door</span>
        </div>

        {/* Editorial middle copy */}
        <div className="z-10 space-y-4 max-w-md animate-[slideUp_0.6s_ease-out]">
          <span className="text-[10px] uppercase font-extrabold text-accent tracking-[0.3em] block">Bespoke Timbercraft</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight text-[#F5E6D3] tracking-tight">
            Crafting Outstanding First Impressions.
          </h2>
          <p className="text-xs text-[#FAF9F6]/60 leading-relaxed max-w-sm">
            Access your unified workspace to manage the premium door catalogue, track customer delivery schedules, and trace stock updates with absolute real-time accuracy.
          </p>
        </div>

        {/* Footer info */}
        <div className="z-10 text-[9px] uppercase tracking-widest text-[#FAF9F6]/40 font-bold">
          © 2026 Dwarik Door · Premium Door Manufacturing · Internal portal
        </div>
      </div>

      {/* ── RIGHT PANE: Editorial Minimalist Form Pane ── */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        
        {/* Soft mobile ambient spotlight */}
        <div className="absolute top-[10%] right-[10%] w-[250px] h-[250px] rounded-full bg-accent/5 blur-[90px] animate-pulse md:hidden" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[380px] z-10 space-y-8"
        >
          {/* Header block (Visible on mobile primarily) */}
          <div className="text-center md:text-left space-y-3 flex flex-col items-center md:items-start">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 dark:bg-accent/15 flex items-center justify-center border border-accent/20 md:hidden">
              <svg viewBox="0 0 64 64" className="w-8 h-8 text-accent" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 56V8a2 2 0 0 1 2-2h32a2 2 0 0 1 2 2v48" stroke="#C89B3C" />
                <line x1="32" y1="6" x2="32" y2="56" stroke="#4E342E" strokeWidth="1.5" />
              </svg>
            </div>
            
            <div className="md:space-y-1">
              <span className="text-xs uppercase tracking-[0.2em] text-accent font-black block">
                DWARIK WORKSPACE
              </span>
              <h1 className="text-3xl font-black tracking-tight text-[#4E342E] dark:text-[#F5EDE4]">
                Welcome Back
              </h1>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed text-center md:text-left">
              Sign in using your registered operator credentials.
            </p>
          </div>

          {/* Secure Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Phone Field */}
            <div className="relative group">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#4E342E]/70 dark:text-accent/80 mb-2 group-focus-within:text-accent transition-colors">
                Phone Number
              </label>
              <div className="relative flex items-center bg-white dark:bg-[#231917]/50 border border-black/10 dark:border-white/5 focus-within:border-accent/80 focus-within:ring-2 focus-within:ring-accent/10 rounded-xl transition-all duration-200 shadow-sm">
                <div className="pl-3.5 pr-2.5 text-muted-foreground group-focus-within:text-accent transition-colors">
                  <Phone size={16} />
                </div>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  disabled={isLoading}
                  className="w-full bg-transparent text-[#1E1E1E] dark:text-white placeholder-black/25 dark:placeholder-white/20 text-sm py-4 pr-4 outline-none border-none focus:ring-0 focus:outline-none font-semibold"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative group">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#4E342E]/70 dark:text-accent/80 mb-2 group-focus-within:text-accent transition-colors">
                Password
              </label>
              <div className="relative flex items-center bg-white dark:bg-[#231917]/50 border border-black/10 dark:border-white/5 focus-within:border-accent/80 focus-within:ring-2 focus-within:ring-accent/10 rounded-xl transition-all duration-200 shadow-sm">
                <div className="pl-3.5 pr-2.5 text-muted-foreground group-focus-within:text-accent transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="w-full bg-transparent text-[#1E1E1E] dark:text-white placeholder-black/25 dark:placeholder-white/20 text-sm py-4 pr-3 outline-none border-none focus:ring-0 focus:outline-none font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-3.5 text-muted-foreground hover:text-accent transition-colors outline-none shrink-0 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-accent to-[#DAB668] disabled:opacity-50 text-[#1A1210] font-black text-xs uppercase tracking-widest h-12 rounded-xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-accent/15 mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-[#1A1210]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying credentials...</span>
                </div>
              ) : (
                <>
                  <Sparkles size={14} className="text-[#1A1210] group-hover/btn:rotate-12 transition-transform" />
                  <span>Login</span>
                </>
              )}
              {/* Shine glow overlay */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover/btn:animate-shine pointer-events-none" />
            </button>
          </form>



        </motion.div>
      </div>

    </div>
  );
}
