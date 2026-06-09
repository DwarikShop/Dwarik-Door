"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { StatusChip } from "../components/ui/StatusChip";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../hooks/useOrders";
import { useDebounce } from "../hooks/useDebounce";
import { useDragScroll } from "../hooks/useDragScroll";
import { Search, Package, ClipboardList, X, ChevronRight, Clock } from "lucide-react";
import { formatDimension } from "../utils/format";

export function EmployeeOrderList() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const filterScrollRef = useDragScroll<HTMLDivElement>();

  // Debounce search typing
  const debouncedSearch = useDebounce(searchInput, 400);

  // Server-side filtering
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
    { value: "backordered", label: "Backordered" },
    { value: "in_progress", label: "Progress" },
    { value: "done", label: "Done" },
    { value: "shipped", label: "Shipped" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-24 font-sans select-none animate-[fadeIn_0.2s_ease-out]">
        <header className="bg-[#4E342E] dark:bg-[#2A1510] border-b border-[#DAB668]/40 text-white px-4 pt-6 pb-5 sticky top-0 z-40 shadow-[0_4px_25px_rgba(78,52,46,0.25)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300">
          <div className="max-w-lg mx-auto">
            <div className="h-4 w-20 bg-white/10 rounded mb-1.5 animate-pulse" />
            <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
          </div>
        </header>
        <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-card border border-border/50 rounded-2xl h-16 animate-pulse"
            />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-24 font-sans select-none animate-[fadeIn_0.25s_ease-out]">
      
      {/* Brand Header consistent with other pages */}
      <header className="bg-[#4E342E] dark:bg-[#2A1510] border-b border-[#DAB668]/40 text-white sticky top-0 z-40 shadow-[0_4px_25px_rgba(78,52,46,0.25)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] text-neutral-400/80 font-extrabold uppercase tracking-widest leading-none">
                Operator Portal
              </p>
              <h1 className="text-2xl font-black tracking-tight mt-1.5 text-white">My Work log</h1>
            </div>
            
            <div className="flex items-center gap-1.5 bg-[#DAB668]/15 dark:bg-[#DAB668]/15 px-3 py-1 rounded-xl border border-[#DAB668]/35 shrink-0">
              <ClipboardList size={13} className="text-accent animate-pulse mr-1" />
              <span className="text-xs font-black uppercase tracking-wider text-accent">
                {myOrders.length} Jobs
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-accent transition-colors"
              size={15}
            />
            <input
              type="text"
              placeholder="Search assigned orders ID, name or specifications…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-10 pl-10 pr-9 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 focus:bg-white/15 text-sm transition-all"
            />
            {isFetching && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
              </div>
            )}
            {!isFetching && searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Filter Pills inside header */}
        <div
          ref={filterScrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-none px-4 pb-3 max-w-lg mx-auto touch-pan-x cursor-grab active:cursor-grabbing"
        >
          {statusFilters.map((f) => {
            const isSelected = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 border ${
                  isSelected
                    ? "bg-accent text-accent-foreground border-accent shadow-sm font-extrabold"
                    : "bg-white/10 text-neutral-300 hover:text-white border-white/15 hover:bg-white/15"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main High-Density Work log Feed */}
      <main className="max-w-lg mx-auto px-4 pt-3.5 pb-6 space-y-2.5">
        {/* Results Metadata */}
        <div className="flex items-center justify-between px-1 mb-1">
          <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground/70">
            {myOrders.length} Active job{myOrders.length !== 1 ? "s" : ""} assigned
            {debouncedSearch && ` for "${debouncedSearch}"`}
          </p>
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="text-xs text-accent font-black uppercase tracking-wider cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {myOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
            <div className="w-14 h-14 bg-secondary/80 rounded-xl flex items-center justify-center mb-3 text-muted-foreground">
              <Package size={26} />
            </div>
            <p className="font-extrabold text-foreground mb-1 text-sm">
              No orders found
            </p>
            <p className="text-xs text-muted-foreground max-w-[200px]">
              {debouncedSearch
                ? "No active orders matching your query. Try a different search."
                : "All updates clear! No orders assigned right now."}
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
                  className={`w-full text-left bg-card border rounded-xl overflow-hidden shadow-sm active:scale-[0.99] transition-all flex flex-col gap-0 cursor-pointer ${
                    isActionable ? "border-accent/40 shadow-accent/5" : "border-border/40"
                  }`}
                >
                  <div className="flex items-center gap-3 p-2.5">
                    {/* Smaller product thumbnail */}
                    <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-border/40 bg-secondary/30 relative">
                      <img
                        src={order.productImage || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop"}
                        alt={order.productName}
                        className="w-full h-full object-cover"
                      />
                      {isActionable && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border border-card animate-pulse" />
                      )}
                    </div>

                    {/* Order Information Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2.5">
                        <span className="text-xs font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20 font-mono tracking-wide shrink-0">
                          #{order.id}
                        </span>
                        <StatusChip status={order.status} className="text-[9px] px-1.5 py-0.5 shrink-0" />
                      </div>

                      <h3 className="font-extrabold text-foreground text-[15px] leading-snug mt-1.5">
                        {order.productName}
                      </h3>

                      <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                        {order.customerName ? (
                          <span className="truncate mr-2">
                            Customer: <span className="font-semibold text-foreground">{order.customerName}</span>
                          </span>
                        ) : (
                          <span></span>
                        )}
                      </div>

                      {/* Specs inline row with smaller font */}
                      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/10">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap">
                          <span className="font-medium bg-secondary/40 px-1.5 py-0.2 rounded text-[11px]">
                            {order.freeSize ? "Free Size" : `${formatDimension(order.height, order.unit)} × ${formatDimension(order.width, order.unit)} ${order.unit}`}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                          <span className="font-bold text-accent text-xs">
                            Qty: {order.quantity}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                          <span className="capitalize text-[11px]">
                            {order.packaging || "plastic"} pack
                          </span>
                        </div>

                        <ChevronRight size={12} className="text-muted-foreground/45 shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Compact Bottom Action Strips for operators */}
                  {isActionable && (
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 border-t text-[9px] font-black uppercase tracking-wider ${
                        order.status === "placed"
                          ? "bg-accent/5 border-accent/20 text-accent animate-pulse"
                          : "bg-info/5 border-info/20 text-info"
                      }`}
                    >
                      <Clock size={10} className="shrink-0 mr-0.5" />
                      <span>
                        {order.status === "placed"
                          ? "Pending Start: Tap to initialize"
                          : "In Progress: Tap to complete"}
                      </span>
                    </div>
                  )}
                </button>
              );
            })
        )}
      </main>

      <BottomNav />
    </div>
  );
}
