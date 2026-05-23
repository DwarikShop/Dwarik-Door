"use client";

import { useState, useEffect } from "react";

/**
 * useDebounce
 * Delays updating the returned value until the input stops changing.
 * Used to avoid firing a search API call on every keystroke.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchInput, 400)
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
