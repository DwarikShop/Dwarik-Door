"use client";

/**
 * useProducts
 *
 * Fetches the full product list from /api/products.
 * Falls back to mock data instantly if the fetch fails (no Atlas connection).
 * This means the UI always has data — no blank screens during development.
 *
 * Usage:
 *   const { products, isLoading, error, refetch } = useProducts()
 */

import { useState, useEffect, useCallback } from "react";
import { products as mockProducts } from "../data/mockData";
import type { TProduct } from "../models/types";

interface UseProductsResult {
  products: TProduct[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/products", { credentials: "include" });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: TProduct[] = await res.json();
      setProducts(data);
    } catch (err) {
      // API unreachable or returned an error — fall back to mock data
      console.warn("[useProducts] falling back to mock data:", err);
      setProducts(mockProducts as TProduct[]);
      setError(null); // don't surface the error — mock data is a valid fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}
