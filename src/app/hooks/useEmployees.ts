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
import { employees as mockEmployees } from "../data/mockData";
import type { TEmployee, UserRole } from "../models/types";

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
  refetch: () => void;
}

export function useEmployees(): UseEmployeesResult {
  const [employees, setEmployees] = useState<SafeEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/employees", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SafeEmployee[] = await res.json();
      setEmployees(data);
    } catch {
      // Fall back to mock data (without passwords)
      setEmployees(mockEmployees.map(({ password: _pw, ...e }) => e));
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    [],
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
    [],
  );

  // ── Delete ────────────────────────────────────────────────────────────────

  const deleteEmployee = useCallback(async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

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
  }, []);

  return {
    employees,
    isLoading,
    isSubmitting,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees,
  };
}
