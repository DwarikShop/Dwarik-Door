"use client";

import { useState, useEffect, useCallback } from "react";
import { products as mockProducts } from "../data/mockData";
import type { TProduct } from "../models/types";

export interface AddProductInput {
  id?: string;
  name: string;
  category: string;
  image: string;
  price: number;
  stock: number;
  damaged: number;
}

export interface UpdateProductInput {
  id?: string;
  name?: string;
  category?: string;
  image?: string;
  price?: number;
  stock?: number;
  damaged?: number;
}

interface UseProductsResult {
  products: TProduct[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  addProduct: (
    input: AddProductInput,
  ) => Promise<{ product: TProduct | null; error?: string }>;
  updateProduct: (
    currentId: string,
    input: UpdateProductInput,
  ) => Promise<{ product: TProduct | null; error?: string }>;
  deleteProduct: (id: string) => Promise<boolean>;
  checkIdExists: (id: string, excludeId?: string) => Promise<boolean>;
  refetch: () => void;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products", { credentials: "include" });
      if (!res.ok) throw new Error();
      setProducts(await res.json());
    } catch {
      setProducts(mockProducts as TProduct[]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Check ID uniqueness ───────────────────────────────────────────────────
  const checkIdExists = useCallback(
    async (id: string, excludeId?: string): Promise<boolean> => {
      try {
        const params = new URLSearchParams({ id });
        if (excludeId) params.set("excludeId", excludeId);
        const res = await fetch(`/api/products/check-id?${params}`, {
          credentials: "include",
        });
        if (!res.ok) return false;
        const data = await res.json();
        return data.exists as boolean;
      } catch {
        // Fallback: check local list
        return products.some(
          (p) => p.id.toUpperCase() === id.toUpperCase() && p.id !== excludeId,
        );
      }
    },
    [products],
  );

  // ── Add ───────────────────────────────────────────────────────────────────
  const addProduct = useCallback(async (input: AddProductInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok)
        return { product: null, error: data.error || "Failed to add product" };
      setProducts((prev) => [...prev, data]);
      return { product: data as TProduct };
    } catch {
      return { product: null, error: "Failed to add product" };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // ── Update ────────────────────────────────────────────────────────────────
  const updateProduct = useCallback(
    async (currentId: string, input: UpdateProductInput) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${currentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(input),
        });
        const data = await res.json();
        if (!res.ok)
          return {
            product: null,
            error: data.error || "Failed to update product",
          };
        const updated = data as TProduct;
        // If ID changed, replace by old ID; otherwise replace by new ID
        setProducts((prev) =>
          prev.map((p) => (p.id === currentId ? updated : p)),
        );
        return { product: updated };
      } catch {
        return { product: null, error: "Failed to update product" };
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) return false;
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    products,
    isLoading,
    isSubmitting,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    checkIdExists,
    refetch: fetchProducts,
  };
}
