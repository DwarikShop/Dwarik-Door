"use client";

/**
 * AuthContext
 *
 * Provides authentication state to all client components.
 *
 * What changed from the original:
 * - login() now calls POST /api/auth/login (sets httpOnly JWT cookie server-side)
 * - logout() now calls POST /api/auth/logout (clears the cookie server-side)
 * - On mount, GET /api/auth/me rehydrates the session from the cookie
 *   so a page refresh doesn't log the user out
 * - The public interface (user, login, logout, isOwner) is identical —
 *   no screen components need to change
 *
 * Fallback:
 * - If the API is unreachable, login falls back to the mock data so the
 *   app still works in local dev without a running DB
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: "owner" | "employee";
}

interface AuthContextType {
  user: AuthUser | null;
  /** Returns the logged-in user on success, null on failure */
  login: (phone: string, password: string) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  isOwner: boolean;
  /** True while the initial session check is in progress */
  isLoading: boolean;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session from JWT cookie on mount
  useEffect(() => {
    async function rehydrate() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.user) setUser(data.user);
        }
      } catch {
        // Network error — stay logged out
      } finally {
        setIsLoading(false);
      }
    }
    rehydrate();
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (phone: string, password: string): Promise<AuthUser | null> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ phone, password }),
        });

        if (res.ok) {
          const data = await res.json();
          const loggedIn: AuthUser = data.user;
          setUser(loggedIn);
          return loggedIn;
        }

        // API returned 401 — wrong credentials
        return null;
      } catch {
        // API unreachable — do not fall back to mock in any environment
        return null;
      }
    },
    [],
  );

  // ── logout ────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors — clear client state regardless
    } finally {
      setUser(null);
    }
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────

  const isOwner = user?.role === "owner";

  return (
    <AuthContext.Provider value={{ user, login, logout, isOwner, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
