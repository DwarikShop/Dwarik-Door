"use client";

/**
 * Client-side providers wrapper.
 *
 * Wrapped providers (in order):
 * - ThemeProvider   — dark/light mode via CSS class on <html>
 * - AuthProvider    — JWT-backed auth state, rehydrates from cookie on mount
 * - AuthGate        — shows LoadingScreen while session check is in progress
 * - Toaster         — sonner toast notifications
 */

import { ThemeProvider } from "@/app/context/ThemeContext";
import { AuthProvider, useAuth } from "@/app/context/AuthContext";
import { LoadingScreen } from "@/app/components/ui/LoadingScreen";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Blocks rendering until the initial /api/auth/me check completes and guards protected routes */
function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const isPublicRoute =
    pathname === "/" || pathname === "/login" || pathname === "/home";

  useEffect(() => {
    if (!isLoading && !user && !isPublicRoute) {
      router.replace("/login");
    }
  }, [isLoading, user, isPublicRoute, router]);

  if (isLoading) return <LoadingScreen />;

  // Show loading screen while redirecting unauthenticated users away from protected routes
  if (!user && !isPublicRoute) {
    return <LoadingScreen />;
  }

  return (
    <>
      {isOffline && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-11/12 max-w-md bg-amber-950/85 backdrop-blur-md border border-amber-800/40 rounded-2xl p-3.5 shadow-xl shadow-amber-950/30 text-amber-100 flex items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <div className="flex flex-col">
              <p className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                Offline Mode
              </p>
              <p className="text-[10px] text-amber-100/80 leading-snug">
                Displaying cached local logs. Sync paused.
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 bg-amber-800 hover:bg-amber-700 active:scale-95 text-amber-50 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border border-amber-700/50"
          >
            Retry Sync
          </button>
        </div>
      )}
      {children}
    </>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate>{children}</AuthGate>
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}
