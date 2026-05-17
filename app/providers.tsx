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

/** Blocks rendering until the initial /api/auth/me check completes */
function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return <>{children}</>;
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
