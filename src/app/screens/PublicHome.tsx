"use client";

import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Download, Share2, LogIn, ShieldCheck, Sparkles, ChevronRight, Layers, Hammer, Trees, Key } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

// Public URL of the catalogue PDF
const CATALOGUE_URL = "/dwarik-catalogue-2024.pdf";
const CATALOGUE_FILENAME = "Dwarik-Door-Catalogue-2024.pdf";

export function PublicHome() {
  const router = useRouter();

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = CATALOGUE_URL;
    link.download = CATALOGUE_FILENAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloading catalogue…");
  };

  const handleWhatsApp = () => {
    const pdfUrl = `${window.location.origin}${CATALOGUE_URL}`;
    const message = encodeURIComponent(
      `Check out the Dwarik Door 2024 Catalogue! 🚪✨\n\nPremium quality doors for homes and commercial spaces.\n\nView / Download: ${pdfUrl}`,
    );
    window.open(
      `https://wa.me/?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const features = [
    {
      icon: Hammer,
      title: "Seasoned Hardwood Core",
      desc: "Vacuum-pressed seasoned timber core ensuring zero warping, swelling, or splitting for generations.",
    },
    {
      icon: Trees,
      title: "Bespoke Timber Veneers",
      desc: "Exquisite handpicked natural Teak, Walnut, and Rosewood veneers, finished with protective UV lacquers.",
    },
    {
      icon: Layers,
      title: "Custom Tailored Specs",
      desc: "Tailored to your exact size demands, available in free size format and pre-fit hardware preparation.",
    },
  ];


  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#150F0D] text-foreground font-sans select-none overflow-x-hidden">
      
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

      {/* Nav Header */}
      <header className="sticky top-0 z-50 bg-[#FAF9F6]/80 dark:bg-[#150F0D]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 py-3.5 px-4 shadow-sm transition-all duration-300">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center border border-accent/20">
              <svg viewBox="0 0 64 64" className="w-4.5 h-4.5 text-accent animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 56V8a2 2 0 0 1 2-2h32a2 2 0 0 1 2 2v48" stroke="#C89B3C" />
                <line x1="32" y1="6" x2="32" y2="56" stroke="#4E342E" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4E342E] dark:text-[#F5E6D3]">Dwarik Door</span>
          </div>
          
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-1.5 bg-[#4E342E] dark:bg-accent text-accent-foreground dark:text-[#1A1210] hover:bg-[#3E2924] px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-accent/10 cursor-pointer"
          >
            <LogIn size={13} />
            Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pb-16 max-w-lg mx-auto px-4 space-y-12">
        
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden shadow-xl border border-black/5 dark:border-white/5 bg-[#261715] h-[440px] flex flex-col justify-end p-6"
        >
          {/* Luxury Wood Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-35 scale-105 transition-transform duration-10000 pointer-events-none" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=1200&fit=crop')" }} 
          />
          {/* Spotlight overlay */}
          <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-accent/25 blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#150F0D] via-[#150F0D]/40 to-transparent pointer-events-none" />

          {/* Hero Copy Content */}
          <div className="z-10 space-y-5">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black tracking-[0.25em] text-accent block">
                Premium Door Manufacturing
              </span>
              <h2 className="text-3xl font-black tracking-tight leading-none text-[#F5E6D3] max-w-sm">
                Outstanding First Impressions
              </h2>
              <p className="text-xs text-[#FAF9F6]/75 leading-relaxed max-w-xs">
                Seasoned hardwood core, exquisite veneers, and architectural laminate doors tailored to your custom specifications.
              </p>
            </div>

            {/* Buttons with highly tactile mobile sizing */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleDownload}
                className="h-12 bg-gradient-to-r from-accent to-[#DAB668] hover:bg-accent/90 active:scale-[0.97] text-[#1A1210] font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-accent/15 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={14} className="text-[#1A1210]" />
                Catalogue
              </button>
              
              <button
                onClick={handleWhatsApp}
                className="h-12 bg-white/10 hover:bg-white/20 active:scale-[0.97] text-white border border-white/10 backdrop-blur-md font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Share2 size={14} className="text-accent" />
                Share Log
              </button>
            </div>
          </div>
        </motion.section>

        {/* Brand Excellence Section */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[9px] uppercase font-black tracking-[0.2em] text-accent">Our Timbercraft</span>
            <h3 className="text-xl font-black text-foreground">Built to Last Generations</h3>
          </div>

          <div className="space-y-3.5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  className="bg-card border border-border/40 hover:border-border/80 rounded-2xl p-4 flex gap-4 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-accent" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-black text-foreground">{f.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>



        {/* Secure Partner Portal Gateway Card */}
        <section className="bg-[#2A1D1A] dark:bg-[#1E1412] border border-[#4E342E]/30 rounded-3xl p-6 text-center space-y-6 relative overflow-hidden shadow-xl">
          {/* Warm background spot */}
          <div className="absolute -bottom-[20%] -left-[10%] w-[180px] h-[180px] rounded-full bg-accent/15 blur-[60px] pointer-events-none" />
          
          <div className="space-y-3 relative z-10">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto border border-accent/20 shrink-0">
              <Key size={22} className="text-accent animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-[0.2em] text-accent font-black block">Internal Workspace</span>
              <h3 className="text-xl font-black text-[#F5E6D3]">Partner Portal Access</h3>
            </div>
            
            <p className="text-xs text-[#FAF9F6]/60 leading-relaxed max-w-xs mx-auto">
              Authorized Dwarik Door operators, staff, and owners log in here to manage order specifications, view current jobs, and update stock counts.
            </p>
          </div>

          {/* Generous primary CTA button with high touch-target space */}
          <div className="pt-2 relative z-10 max-w-xs mx-auto">
            <button
              onClick={() => router.push("/login")}
              className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-accent to-[#DAB668] text-[#1A1210] font-black text-sm uppercase tracking-widest h-14 rounded-2xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-accent/10"
            >
              <LogIn size={16} className="text-[#1A1210] group-hover/btn:translate-x-0.5 transition-transform" />
              <span>Go to Dashboard Login</span>
              {/* Shine glow overlay */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover/btn:animate-shine pointer-events-none" />
            </button>
          </div>
        </section>

      </main>

      {/* Editorial Footer */}
      <footer className="bg-[#FAF9F6] dark:bg-[#150F0D] border-t border-black/5 dark:border-white/5 py-8 px-6 text-center space-y-2">
        <p className="text-[10px] uppercase font-black tracking-widest text-[#4E342E]/50 dark:text-accent/60">
          Dwarik Timbercraft
        </p>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-bold">
          © 2026 Dwarik Door · Internal manufacturing & inventory logs.
        </p>
      </footer>

    </div>
  );
}
