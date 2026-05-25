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
              <p className="text-[9px] text-primary-foreground/60 font-extrabold uppercase tracking-widest leading-none">
                Dwarik Door
              </p>
              <h1 className="text-lg font-black tracking-tight text-primary-foreground mt-0.5">Orders</h1>
            </div>
            
            <div className="flex items-center bg-primary-foreground/10 px-2.5 py-1 rounded-full border border-primary-foreground/5 shrink-0">
              <Clock size={11} className="text-accent animate-pulse mr-1" />
              <span className="text-[9px] font-black uppercase tracking-wider">Live Log</span>
            </div>
          </div>

          {/* Search Box with focus highlighting */}
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-foreground/50 group-focus-within:text-primary-foreground transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder="Search by order ID, product or customer…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-8.5 pl-9 pr-9 rounded-xl bg-primary-foreground/10 border border-primary-foreground/5 text-primary-foreground placeholder:text-primary-foreground/45 focus:outline-none focus:border-accent focus:ring-1.5 focus:ring-accent/10 text-xs transition-all"
            />
            {isFetching && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 border border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              </div>
            )}
            {!isFetching && searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-primary-foreground/10 rounded-full text-primary-foreground/50 hover:text-primary-foreground transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X size={11} />
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
                className={`flex-shrink-0 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${
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
      <main className="max-w-lg mx-auto px-4 pt-3.5 pb-6 space-y-2">
        {/* Results Metadata */}
        <div className="flex items-center justify-between px-1 mb-1">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/60">
            {listItems.length} Order{listItems.length !== 1 ? "s" : ""} active
            {debouncedSearch && ` for "${debouncedSearch}"`}
          </p>
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="text-[9px] text-accent font-extrabold uppercase tracking-widest cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {listItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
            <div className="w-12 h-12 bg-secondary/80 rounded-xl flex items-center justify-center mb-3 text-muted-foreground">
              <Package size={22} />
            </div>
            <p className="font-extrabold text-foreground mb-0.5 text-xs">
              No orders found
            </p>
            <p className="text-[10px] text-muted-foreground max-w-[180px]">
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
                  className="w-full text-left bg-card border border-border/40 hover:border-border/80 rounded-2xl overflow-hidden shadow-sm active:scale-[0.99] transition-all flex items-center gap-3 p-2.5 cursor-pointer relative"
                >
                  {/* Small product thumbnail with door fallback */}
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
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[8px] font-mono text-muted-foreground/80 truncate">
                          {order.id}
                        </span>
                        {order.customerName && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                            <span className="text-[9px] font-extrabold uppercase text-foreground/80 truncate">
                              {order.customerName}
                            </span>
                          </>
                        )}
                      </div>
                      <StatusChip status={order.status} className="text-[8px] px-1.5 py-0.5 shrink-0" />
                    </div>

                    <h3 className="font-extrabold text-foreground text-xs leading-tight truncate mt-0.5">
                      {order.productName}
                    </h3>

                    {/* Compact Specs list */}
                    <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mt-1 flex-wrap leading-none">
                      <span className="font-medium bg-secondary/70 border border-border/40 px-1 py-0.5 rounded text-[8px]">
                        {order.freeSize ? "Free Size" : `${order.height} × ${order.width} ${order.unit}`}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                      <span className="font-medium bg-accent/5 border border-accent/10 text-accent px-1.5 py-0.5 rounded text-[8px]">
                        Qty: {order.quantity}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                      <span className="capitalize">{order.packaging || "plastic"}</span>
                    </div>

                    {/* Bottom Metadata row */}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/20">
                      <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
                        <Calendar size={9} className="text-accent" />
                        <span>
                          {new Date(order.createdAt!).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <ChevronRight size={10} className="text-muted-foreground/60" />
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
              <div key={groupId} className="bg-card border border-border/40 rounded-2xl shadow-sm overflow-hidden transition-all duration-200">
                {/* Group Header block */}
                <button
                  onClick={() => toggleGroup(groupId)}
                  className="w-full text-left p-2.5 flex items-center gap-2.5 active:bg-secondary/40 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Layers size={16} className="text-accent" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[8px] font-mono text-muted-foreground/80 truncate">
                          {groupId}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                        <span className="text-[9px] font-extrabold uppercase text-foreground truncate">
                          {firstOrder.customerName || "Group Order"}
                        </span>
                      </div>
                      <StatusChip status={overallStatus} className="text-[8px] px-1.5 py-0.5 shrink-0" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5 leading-none">
                      <span className="font-extrabold text-accent">{groupOrders.length} Doors</span>
                      <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                      <span>
                        {new Date(firstOrder.createdAt!).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {isExpanded ? (
                    <ChevronUp size={14} className="text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown size={14} className="text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Expanded inner items */}
                {isExpanded && (
                  <div className="border-t border-border/30 bg-secondary/15 divide-y divide-border/20">
                    {groupOrders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="w-full text-left p-2.5 pl-6 flex items-center gap-3 active:bg-secondary/40 transition-all cursor-pointer"
                      >
                        <img
                          src={order.productImage || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop"}
                          alt={order.productName}
                          className="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-secondary/40 border border-border/30"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2.5">
                            <h3 className="font-extrabold text-foreground text-xs leading-none truncate">
                              {order.productName}
                            </h3>
                            <StatusChip status={order.status} className="text-[7px] px-1.5 py-0.5 shrink-0" />
                          </div>
                          
                          <p className="text-[8px] font-mono text-muted-foreground mt-0.5 leading-none">
                            {order.id}
                          </p>

                          {/* Dimensions & Qty */}
                          <div className="flex items-center gap-1.5 text-[8.5px] text-muted-foreground mt-1.5 leading-none">
                            <span className="bg-card border border-border/40 px-1 py-0.5 rounded text-[7.5px]">
                              {order.freeSize ? "Free Size" : `${order.height} × ${order.width} ${order.unit}`}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                            <span className="font-bold text-accent">Qty: {order.quantity}</span>
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
