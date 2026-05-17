"use client";

/**
 * useProduct
 *
 * Fetches a single product by ID from /api/products/[id].
 * Falls back to mock data if the API is unavailable.
 *
 * Usage:
 *   const { product, isLoading, error } = useProduct('DW-001')
 */

import { useState, useEffect } from "react";
import { products as mockProducts } from "../data/mockData";
import type { TProduct } from "../models/types";

interface UseProductResult {
  product: TProduct | null;
  isLoading: boolean;
  error: string | null;
}

export function useProduct(id: string | undefined): UseProductResult {
  const [product, setProduct] = useState<TProduct | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(`/api/products/${id}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: TProduct = await res.json();
        setProduct(data);
      })
      .catch(() => {
        // Fall back to mock data
        const mock = mockProducts.find((p) => p.id === id);
        if (mock) {
          setProduct(mock as TProduct);
        } else {
          setError("Product not found");
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  return { product, isLoading, error };
}
