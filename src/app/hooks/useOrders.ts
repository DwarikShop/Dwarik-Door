"use client";

/**
 * useOrders
 *
 * Fetches ALL orders from /api/orders.
 * All employees and owners see all orders — no assignment filter.
 * Falls back to mock data when the API is unavailable.
 *
 * Usage:
 *   const { orders, isLoading, refetch } = useOrders()
 */

import { useState, useEffect, useCallback } from "react";
import { orders as mockOrders } from "../data/mockData";
import type { TOrder } from "../models/types";

interface UseOrdersResult {
  orders: TOrder[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Normalise dates — API returns ISO strings, mock data has Date objects
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

export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<TOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: TOrder[] = await res.json();
      setOrders(data.map(normaliseOrder));
    } catch {
      // Fall back to mock data
      setOrders(mockOrders as TOrder[]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, error, refetch: fetchOrders };
}
