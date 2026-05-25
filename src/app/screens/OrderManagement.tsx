"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { FAB } from "../components/FAB";
import { StatusChip } from "../components/ui/StatusChip";
import { useOrders } from "../hooks/useOrders";
import { useDebounce } from "../hooks/useDebounce";
import { Search, Package, X, Layers, ChevronDown, ChevronUp, Clock, User, Calendar, ChevronRight } from "lucide-react";
import type { TOrder } from "../models/types";

export function OrderManagement() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Debounce search inputs
  const debouncedSearch = useDebounce(searchInput, 400);

  // Server-side filtering
  const { orders, isLoading, isFetching } = useOrders({
    role: "owner",
    search: debouncedSearch,
    status: statusFilter === "all" ? "" : statusFilter,
    limit: 20,
  });

  // Group orders by groupId
  type ListItem =
    | { type: "single"; order: TOrder }
    | { type: "group"; groupId: string; orders: TOrder[] };

  const listItems = useMemo<ListItem[]>(() => {
    const groups = new Map<string, TOrder[]>();
    const singles: TOrder[] = [];

    for (const order of orders) {
      if (order.orderType === "group" && order.groupId) {
        const g = groups.get(order.groupId) ?? [];
        g.push(order);
        groups.set(order.groupId, g);
      } else {
        singles.push(order);
      }
    }

    // Merge singles and groups, sorting by createdAt descending
    const items: ListItem[] = [
      ...singles.map((o) => ({ type: "single" as const, order: o })),
      ...Array.from(groups.entries()).map(([groupId, groupOrders]) => ({
        type: "group" as const,
        groupId,
        orders: groupOrders,
      })),
    ];

    items.sort((a, b) => {
      const aDate = a.type === "single" ? a.order.createdAt! : a.orders[0].createdAt!;
      const bDate = b.type === "single" ? b.order.createdAt! : b.orders[0].createdAt!;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

    return items;
  }, [orders]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (groupId: string) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(groupId) ? next.delete(groupId) : next.add(groupId);
      return next;
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
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-24 font-sans select-none animate-[fadeIn_0.25s_ease-out]">
        <header className="bg-primary text-primary-foreground sticky top-0 z-40 px-4 pt-4 pb-3">
          <div className="max-w-lg mx-auto">
            <div className="h-4 w-20 bg-primary-foreground/10 rounded mb-1 animate-pulse" />
            <div className="h-6 w-40 bg-primary-foreground/20 rounded animate-pulse" />
          </div>
        </header>
        <div className="max-w-lg mx-auto px-4 py-3.5 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-card border border-border/50 rounded-2xl h-16 animate-pulse"
            />
          ))}
        </div>
        <BottomNav />
        <FAB />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-24 font-sans select-none animate-[fadeIn_0.25s_ease-out]">
      
      {/* Dynamic Sticky Brand Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-40 shadow-md transition-all duration-300">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-primary-foreground/75 font-extrabold uppercase tracking-widest leading-none">
                Dwarik Door
              </p>
              <h1 className="text-2xl font-black tracking-tight text-primary-foreground mt-1">Orders</h1>
            </div>
            
            <div className="flex items-center bg-primary-foreground/10 px-3 py-1 rounded-full border border-primary-foreground/5 shrink-0">
              <Clock size={13} className="text-accent animate-pulse mr-1" />
              <span className="text-xs font-black uppercase tracking-wider">Live Log</span>
            </div>
          </div>

          {/* Search Box with focus highlighting */}
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-foreground/50 group-focus-within:text-primary-foreground transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by order ID, product or customer…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-10 pl-10 pr-9 rounded-xl bg-primary-foreground/10 border border-primary-foreground/5 text-primary-foreground placeholder:text-primary-foreground/45 focus:outline-none focus:border-accent focus:ring-1.5 focus:ring-accent/10 text-sm transition-all"
            />
            {isFetching && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              </div>
            )}
            {!isFetching && searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-primary-foreground/10 rounded-full text-primary-foreground/50 hover:text-primary-foreground transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Horizontal Filter pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none px-4 pb-2.5 max-w-lg mx-auto">
          {statusFilters.map((f) => {
            const isSelected = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? "bg-accent text-accent-foreground shadow-sm font-extrabold"
                    : "bg-primary-foreground/10 text-primary-foreground/75 hover:bg-primary-foreground/20 border border-transparent"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* High-density orders lists */}
      <main className="max-w-lg mx-auto px-4 pt-3.5 pb-6 space-y-2.5">
        {/* Results Metadata */}
        <div className="flex items-center justify-between px-1 mb-1">
          <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground/70">
            {listItems.length} Order{listItems.length !== 1 ? "s" : ""} active
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

        {listItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
            <div className="w-14 h-14 bg-secondary/80 rounded-xl flex items-center justify-center mb-3 text-muted-foreground">
              <Package size={26} />
            </div>
            <p className="font-extrabold text-foreground mb-1 text-sm">
              No orders found
            </p>
            <p className="text-xs text-muted-foreground max-w-[200px]">
              Try adjusting your query or filter tags.
            </p>
          </div>
        ) : (
          listItems.map((item) => {
            if (item.type === "single") {
              const order = item.order;
              return (
                <button
                  key={order.id}
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="w-full text-left bg-card border border-border/40 hover:border-border/80 rounded-xl overflow-hidden shadow-sm active:scale-[0.99] transition-all flex items-center gap-3 p-2.5 cursor-pointer relative"
                >
                  {/* Small product thumbnail */}
                  <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-border/40 bg-secondary/30 relative">
                    <img
                      src={order.productImage || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop"}
                      alt={order.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Order metadata info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2.5">
                      <span className="text-xs font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20 font-mono tracking-wide shrink-0">
                        #{order.id}
                      </span>
                      <StatusChip status={order.status} className="text-[9px] px-1.5 py-0.5 shrink-0" />
                    </div>

                    <h3 className="font-extrabold text-foreground text-sm leading-snug mt-1.5">
                      {order.productName}
                    </h3>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                      {order.customerName ? (
                        <span className="truncate mr-2">
                          Client: <span className="font-semibold text-foreground">{order.customerName}</span>
                        </span>
                      ) : (
                        <span></span>
                      )}
                      
                      {order.assignedTo && (
                        <span className="shrink-0 font-medium bg-secondary/80 border border-border/40 px-1 py-0.2 rounded text-[10px]">
                          Op: <span className="font-semibold text-foreground">{order.assignedTo}</span>
                        </span>
                      )}
                    </div>

                    {/* Specs inline row with smaller font */}
                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/10">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap">
                        <span className="font-medium bg-secondary/40 px-1 py-0.2 rounded text-[10px]">
                          {order.freeSize ? "Free Size" : `${order.height} × ${order.width} ${order.unit}`}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30 animate-pulse" />
                        <span className="font-bold text-accent">
                          Qty: {order.quantity} pcs
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30 animate-pulse" />
                        <span className="capitalize text-[10px]">
                          {order.packaging || "plastic"} pack
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 font-medium shrink-0">
                        <span>
                          {new Date(order.createdAt!).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                        <ChevronRight size={12} className="text-muted-foreground/45" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            }

            // ── Group Card Redesign ──────────────────────────────────────────
            const { groupId, orders: groupOrders } = item;
            const isExpanded = expandedGroups.has(groupId);
            const firstOrder = groupOrders[0];
            const allStatuses = [...new Set(groupOrders.map((o) => o.status))];
            const overallStatus = allStatuses.length === 1 ? allStatuses[0] : "in_progress";

            return (
              <div key={groupId} className="bg-card border border-border/40 rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                {/* Group Header block */}
                <button
                  onClick={() => toggleGroup(groupId)}
                  className="w-full text-left p-2.5 flex items-center gap-3 active:bg-secondary/40 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Layers size={18} className="text-accent" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2.5">
                      <span className="text-xs font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20 font-mono tracking-wide shrink-0">
                        #{groupId}
                      </span>
                      <StatusChip status={overallStatus} className="text-[9px] px-1.5 py-0.5 shrink-0" />
                    </div>

                    <h3 className="font-extrabold text-foreground text-sm leading-snug mt-1.5">
                      {firstOrder.customerName || "Group Order"}
                    </h3>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-accent bg-accent/5 border border-accent/15 px-1.5 py-0.2 rounded text-[10px]">{groupOrders.length} Doors</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span>
                          {new Date(firstOrder.createdAt!).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </div>
                      
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded inner items */}
                {isExpanded && (
                  <div className="border-t border-border/30 bg-secondary/15 divide-y divide-border/20">
                    {groupOrders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="w-full text-left p-2.5 pl-5 flex items-center gap-3 active:bg-secondary/40 transition-all cursor-pointer"
                      >
                        <img
                          src={order.productImage || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop"}
                          alt={order.productName}
                          className="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-secondary/40 border border-border/30"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2.5">
                            <span className="text-[10px] font-black text-accent bg-accent/10 px-1 py-0.2 rounded border border-accent/15 font-mono shrink-0">
                              #{order.id}
                            </span>
                            <StatusChip status={order.status} className="text-[8px] px-1 py-0.2 shrink-0" />
                          </div>
                          
                          <h3 className="font-extrabold text-foreground text-xs leading-snug mt-1.5">
                            {order.productName}
                          </h3>
                          
                          {/* Dimensions & Qty */}
                          <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-card border border-border/40 px-1 py-0.2 rounded text-[9px]">
                                {order.freeSize ? "Free Size" : `${order.height} × ${order.width} ${order.unit}`}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                              <span className="font-bold text-accent">Qty: {order.quantity}</span>
                            </div>
                            <ChevronRight size={11} className="text-muted-foreground/45" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>

      <BottomNav />
      <FAB />
    </div>
  );
}
