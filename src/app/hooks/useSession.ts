"use client";

/**
 * useSession
 *
 * Convenience hook that wraps useAuth and exposes a clean session API.
 * Screens that only need to read the current user can use this instead
 * of importing useAuth directly.
 *
 * Usage:
 *   const { user, isOwner, isLoading, isAuthenticated } = useSession()
 */

import { useAuth } from "../context/AuthContext";

export function useSession() {
  const { user, isOwner, isLoading, login, logout } = useAuth();

  return {
    /** The currently authenticated user, or null if not logged in */
    user,
    /** True if the user is an owner */
    isOwner,
    /** True if the user is an employee */
    isEmployee: user?.role === "employee",
    /** True while the initial session check is running */
    isLoading,
    /** True once loading is done and a user is present */
    isAuthenticated: !isLoading && user !== null,
    /** Login function — returns user on success, null on failure */
    login,
    /** Logout function — clears cookie and client state */
    logout,
  };
}
