"use client";

/**
 * useOrders
 *
 * isLoading  — true only on the FIRST load (shows skeleton, hides UI)
 * isFetching — true on every fetch including search re-fetches
 *              (shows a subtle spinner, keeps UI mounted so input keeps focus)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { orders as mockOrders } from "../data/mockData";
import type { TOrder } from "../models/types";

export interface UseOrdersOptions {
  role?: "owner" | "employee";
  search?: string;
  status?: string;
  limit?: number;
}

interface UseOrdersResult {
  orders: TOrder[];
  isLoading: boolean; // first load only — use to show skeleton
  isFetching: boolean; // every fetch — use to show inline spinner
  error: string | null;
  refetch: () => void;
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

function applyEmployeeFilter(orders: TOrder[]): TOrder[] {
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  return orders.filter((o) => {
    if (["placed", "in_progress", "done"].includes(o.status)) return true;
    if (o.status === "shipped") return new Date(o.updatedAt!) >= tenDaysAgo;
    return false;
  });
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersResult {
  const { role = "owner", search = "", status = "", limit = 20 } = options;
  const [orders, setOrders] = useState<TOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true); // skeleton — first load only
  const [isFetching, setIsFetching] = useState(false); // spinner — every fetch
  const [error, setError] = useState<string | null>(null);
  const isFirstLoad = useRef(true);

  const fetchOrders = useCallback(async () => {
    // First load → show skeleton. Subsequent fetches → show inline spinner only
    if (isFirstLoad.current) {
      setIsLoading(true);
    } else {
      setIsFetching(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams({ role, limit: String(limit) });
      if (search) params.set("search", search);
      if (status) params.set("status", status);

      const res = await fetch(`/api/orders?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: TOrder[] = await res.json();
      setOrders(data.map(normaliseOrder));
    } catch {
      const filtered =
        role === "employee"
          ? applyEmployeeFilter(mockOrders as TOrder[])
          : (mockOrders as TOrder[]).slice(0, limit);
      setOrders(filtered);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      isFirstLoad.current = false;
    }
  }, [role, search, status, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, isFetching, error, refetch: fetchOrders };
}
