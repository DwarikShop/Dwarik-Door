"use client";

/**
 * useEmployees
 *
 * Fetches the employee list and provides CRUD actions.
 * Falls back to mock data when the API is unavailable.
 *
 * Usage:
 *   const { employees, isLoading, addEmployee, updateEmployee, deleteEmployee } = useEmployees()
 */

import { useState, useEffect, useCallback } from "react";
import type { TEmployee, UserRole } from "../models/types";
import { useAuth } from "../context/AuthContext";

// Safe employee type — never includes password
export type SafeEmployee = Omit<TEmployee, "password">;

interface AddEmployeeInput {
  name: string;
  phone: string;
  password: string;
  role: UserRole;
}

interface UpdateEmployeeInput {
  name?: string;
  phone?: string;
  role?: UserRole;
}

interface ChangePasswordInput {
  currentPassword?: string; // required for self-change, omit for owner reset
  newPassword: string;
}

interface UseEmployeesResult {
  employees: SafeEmployee[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  addEmployee: (input: AddEmployeeInput) => Promise<SafeEmployee | null>;
  updateEmployee: (
    id: string,
    input: UpdateEmployeeInput,
  ) => Promise<SafeEmployee | null>;
  deleteEmployee: (id: string) => Promise<boolean>;
  changePassword: (id: string, input: ChangePasswordInput) => Promise<boolean>;
  refetch: () => void;
}

export function useEmployees(): UseEmployeesResult {
  const [employees, setEmployees] = useState<SafeEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/employees", { credentials: "include" });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SafeEmployee[] = await res.json();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ── Add ───────────────────────────────────────────────────────────────────

  const addEmployee = useCallback(
    async (input: AddEmployeeInput): Promise<SafeEmployee | null> => {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(input),
        });

        if (res.status === 401) {
          logout();
          throw new Error("Session expired. Please log in again.");
        }

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to add employee");
        }

        const created: SafeEmployee = await res.json();
        setEmployees((prev) => [...prev, created]);
        return created;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to add employee";
        setError(msg);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [logout],
  );

  // ── Update ────────────────────────────────────────────────────────────────

  const updateEmployee = useCallback(
    async (
      id: string,
      input: UpdateEmployeeInput,
    ): Promise<SafeEmployee | null> => {
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/employees/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(input),
        });

        if (res.status === 401) {
          logout();
          throw new Error("Session expired. Please log in again.");
        }

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update employee");
        }

        const updated: SafeEmployee = await res.json();
        setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)));
        return updated;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to update employee";
        setError(msg);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [logout],
  );

  // ── Change password ───────────────────────────────────────────────────────

  const changePassword = useCallback(
    async (id: string, input: ChangePasswordInput): Promise<boolean> => {
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/employees/${id}/change-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(input),
        });

        if (res.status === 401) {
          logout();
          throw new Error("Session expired. Please log in again.");
        }

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to change password");
        }
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to change password";
        setError(msg);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [logout],
  );

  // ── Delete ────────────────────────────────────────────────────────────────

  const deleteEmployee = useCallback(async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401) {
        logout();
        throw new Error("Session expired. Please log in again.");
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete employee");
      }

      setEmployees((prev) => prev.filter((e) => e.id !== id));
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete employee";
      setError(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [logout]);

  return {
    employees,
    isLoading,
    isSubmitting,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    changePassword,
    refetch: fetchEmployees,
  };
}
