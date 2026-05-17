"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { FAB } from "../components/FAB";
import { StatusChip } from "../components/ui/StatusChip";
import { useOrders } from "../hooks/useOrders";
import { useDebounce } from "../hooks/useDebounce";
import { Search, Package, X } from "lucide-react";

export function OrderManagement() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Debounce — wait 400ms after typing before hitting the API
  const debouncedSearch = useDebounce(searchInput, 400);

  // Server-side filtering — no client-side array.filter()
  const { orders, isLoading, isFetching } = useOrders({
    role: "owner",
    search: debouncedSearch,
    status: statusFilter === "all" ? "" : statusFilter,
    limit: 20,
  });

  const statusFilters = [
    { value: "all", label: "All" },
    { value: "placed", label: "Placed" },
    { value: "in_progress", label: "Progress" },
    { value: "done", label: "Done" },
    { value: "shipped", label: "Shipped" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary text-primary-foreground px-4 py-5 sticky top-0 z-40 shadow-md">
          <div className="max-w-lg mx-auto">
            <div className="h-6 w-40 bg-primary-foreground/20 rounded mb-3" />
            <div className="h-10 w-full bg-primary-foreground/10 rounded-xl" />
          </div>
        </header>
        <div className="max-w-lg mx-auto px-4 py-3 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl h-24 animate-pulse"
            />
          ))}
        </div>
        <BottomNav />
        <FAB />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-5 pb-0 sticky top-0 z-40 shadow-md">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold mb-3">Order Management</h1>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-foreground/60"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by order ID, product or customer…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent border-0 text-sm"
            />
            {isFetching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              </div>
            )}
            {!isFetching && searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/50 hover:text-primary-foreground transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filter pills — inside header so they stick with it */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 pt-3 pb-3">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full font-semibold text-sm transition-all ${
                statusFilter === filter.value
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      {/* Order list */}
      <main className="max-w-lg mx-auto px-4 py-3 space-y-3">
        {/* Result hint */}
        {debouncedSearch && (
          <p className="text-xs text-muted-foreground px-1">
            Showing up to 20 results for &quot;{debouncedSearch}&quot;
          </p>
        )}

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package size={48} className="text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              {debouncedSearch
                ? `No orders found for "${debouncedSearch}"`
                : "No orders yet"}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <button
              key={order.id}
              onClick={() => router.push(`/orders/${order.id}`)}
              className="w-full text-left bg-card border border-border rounded-2xl p-3 flex gap-3 shadow-sm active:scale-[0.98] transition-transform"
            >
              <img
                src={order.productImage}
                alt={order.productName}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-secondary"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2 flex-1 min-w-0">
                    {order.productName}
                  </p>
                  <StatusChip
                    status={order.status}
                    className="text-xs px-2 py-0.5 shrink-0"
                  />
                </div>
                <p className="text-xs text-muted-foreground mb-1.5">
                  {order.id}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.height} × {order.width} {order.unit} &bull;{" "}
                  {order.quantity} pcs
                </p>
                <div className="flex items-center justify-between mt-1">
                  {order.customerName && (
                    <p className="text-xs text-muted-foreground truncate flex-1 min-w-0">
                      {order.customerName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground shrink-0 ml-2">
                    {new Date(order.createdAt!).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </main>

      <BottomNav />
      <FAB />
    </div>
  );
}
