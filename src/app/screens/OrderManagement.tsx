"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { FAB } from "../components/FAB";
import { StatusChip } from "../components/ui/StatusChip";
import { useOrders } from "../hooks/useOrders";
import { Search, Package } from "lucide-react";

export function OrderManagement() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { orders, isLoading } = useOrders();

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
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
      <header className="bg-primary text-primary-foreground px-4 py-5 sticky top-0 z-40 shadow-md">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold mb-3">Order Management</h1>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-foreground/60"
              size={18}
            />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent border-0 text-sm"
            />
          </div>
        </div>
      </header>

      {/* Filter pills — no negative margin, just scroll within bounds */}
      <div className="max-w-lg mx-auto px-4 pt-3 pb-1">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full font-semibold text-sm transition-all ${
                statusFilter === filter.value
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Order list */}
      <main className="max-w-lg mx-auto px-4 py-3 space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package size={48} className="text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => router.push(`/orders/${order.id}`)}
              className="w-full text-left bg-card border border-border rounded-2xl p-3 flex gap-3 shadow-sm active:scale-[0.98] transition-transform"
            >
              {/* Product image */}
              <img
                src={order.productImage}
                alt={order.productName}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-secondary"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Name + status on same row */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2 flex-1 min-w-0">
                    {order.productName}
                  </p>
                  <StatusChip
                    status={order.status}
                    className="text-xs px-2 py-0.5 shrink-0"
                  />
                </div>

                {/* Order ID */}
                <p className="text-xs text-muted-foreground mb-1.5">
                  {order.id}
                </p>

                {/* Dimensions + qty */}
                <p className="text-xs text-muted-foreground">
                  {order.height} × {order.width} {order.unit} &bull;{" "}
                  {order.quantity} pcs
                </p>

                {/* Customer + date row */}
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
