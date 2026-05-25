"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { StatusChip } from "../components/ui/StatusChip";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../hooks/useOrders";
import { useDebounce } from "../hooks/useDebounce";
import { Search, Package, ClipboardList, X } from "lucide-react";

export function EmployeeOrderList() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Debounce — 400ms after typing stops before hitting the API
  const debouncedSearch = useDebounce(searchInput, 400);

  // Server-side filtering — no client-side array.filter()
  const {
    orders: myOrders,
    isLoading,
    isFetching,
  } = useOrders({
    role: "employee",
    search: debouncedSearch,
    status: statusFilter === "all" ? "" : statusFilter,
  });

  const statusFilters = [
    { value: "all", label: "All" },
    { value: "placed", label: "Placed" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Done" },
    { value: "shipped", label: "Shipped" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary text-primary-foreground sticky top-0 z-40 shadow-md px-4 pt-6 pb-6">
          <div className="max-w-lg mx-auto">
            <div className="h-5 w-32 bg-primary-foreground/20 rounded mb-2" />
            <div className="h-7 w-24 bg-primary-foreground/20 rounded" />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-40 shadow-md">
        <div className="max-w-lg mx-auto px-4 pt-6 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-primary-foreground/55 font-medium">
                {user?.name}
              </p>
              <h1 className="text-xl font-bold leading-tight">My Orders</h1>
            </div>
            <div className="flex items-center gap-1.5 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
              <ClipboardList size={13} className="text-primary-foreground/70" />
              <span className="text-xs font-bold text-primary-foreground/80">
                {myOrders.length} orders
              </span>
            </div>
          </div>

          {/* Search — stays mounted, no focus loss */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-foreground/50"
              size={16}
            />
            <input
              type="text"
              placeholder="Search orders…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent border-0 text-sm"
            />
            {/* Inline spinner — no page remount, no focus loss */}
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

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 pb-3">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === f.value
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary-foreground/10 text-primary-foreground/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* Order list */}
      <main className="max-w-lg mx-auto px-4 py-3 space-y-3">
        {myOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
              <Package size={32} className="text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground mb-1">
              {debouncedSearch
                ? `No results for "${debouncedSearch}"`
                : "No orders"}
            </p>
            <p className="text-sm text-muted-foreground">
              {debouncedSearch
                ? "Try a different search term"
                : "No active orders right now"}
            </p>
          </div>
        ) : (
          [...myOrders]
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .map((order) => {
              const isActionable =
                order.status === "placed" || order.status === "in_progress";

            return (
              <button
                key={order.id}
                onClick={() => router.push(`/employee/orders/${order.id}`)}
                className={`w-full text-left bg-card border rounded-2xl p-3 flex gap-3 shadow-sm active:scale-[0.98] transition-transform ${
                  isActionable ? "border-accent/30" : "border-border"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={order.productImage}
                    alt={order.productName}
                    className="w-20 h-20 rounded-xl object-cover bg-secondary"
                  />
                  {isActionable && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-card" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2 flex-1 min-w-0">
                      {order.productName}
                    </p>
                    <StatusChip status={order.status} className="shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    {order.id}
                  </p>
                  <p className="text-xs text-muted-foreground mb-1">
                    {order.height} × {order.width} {order.unit} &bull;{" "}
                    {order.quantity} pcs &bull; <span className="capitalize font-medium text-accent">{order.packaging || "plastic"}</span>
                  </p>
                  {isActionable && (
                    <p className="text-xs text-accent font-semibold mt-2.5">
                      {order.status === "placed"
                        ? "Tap to start work →"
                        : "Tap to update →"}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </main>

      <BottomNav />
    </div>
  );
}
