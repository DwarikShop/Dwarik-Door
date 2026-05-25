"use client";

/**
 * useOrder
 *
 * Fetches a single order by ID and provides a status-update action.
 * Falls back to mock data when the API is unavailable.
 *
 * Usage:
 *   const { order, isLoading, updateStatus } = useOrder('ORD-001')
 */

import { useState, useEffect, useCallback } from "react";
import { orders as mockOrders } from "../data/mockData";
import type { TOrder, OrderStatus } from "../models/types";
import { useAuth } from "../context/AuthContext";

interface UpdateStatusOptions {
  toStatus: OrderStatus;
  changedBy: string;
  note?: string;
  rejectReason?: "damaged" | "other";
}

interface UseOrderResult {
  order: TOrder | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  updateStatus: (opts: UpdateStatusOptions) => Promise<boolean>;
}

function normaliseOrder(
  o: TOrder & { createdAt?: unknown; updatedAt?: unknown },
): TOrder {
  return {
    ...o,
    createdAt: new Date(
      (o.createdAt as unknown as string | number | Date) ?? new Date(),
    ),
    updatedAt: new Date(
      (o.updatedAt as unknown as string | number | Date) ?? new Date(),
    ),
  };
}

export function useOrder(id: string | undefined): UseOrderResult {
  const [order, setOrder] = useState<TOrder | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  // ── Fetch ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch(`/api/orders/${id}`, { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) {
          logout();
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: TOrder = await res.json();
        setOrder(normaliseOrder(data));
      })
      .catch(() => {
        const mock = mockOrders.find((o) => o.id === id);
        if (mock) setOrder(mock as TOrder);
        else setError("Order not found");
      })
      .finally(() => setIsLoading(false));
  }, [id, logout]);

  // ── Status update ─────────────────────────────────────────────────────────

  const updateStatus = useCallback(
    async ({
      toStatus,
      changedBy,
      note,
      rejectReason,
    }: UpdateStatusOptions): Promise<boolean> => {
      if (!id || !order) return false;
      setIsUpdating(true);

      const previousOrder = order;

      // Optimistic update status locally
      setOrder((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: toStatus,
          updatedAt: new Date(),
        };
      });

      try {
        const res = await fetch(`/api/orders/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ toStatus, changedBy, note, rejectReason }),
        });

        if (res.status === 401) {
          logout();
          setOrder(previousOrder);
          return false;
        }

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update status");
        }

        const updated: TOrder = await res.json();
        setOrder(normaliseOrder(updated));
        return true;
      } catch (err) {
        console.error("[useOrder] updateStatus failed, rolling back:", err);
        setOrder(previousOrder);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [id, order, logout],
  );

  return { order, isLoading, isUpdating, error, updateStatus };
}
