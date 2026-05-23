"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { FAB } from "../components/FAB";
import { StatusChip } from "../components/ui/StatusChip";
import { useOrders } from "../hooks/useOrders";
import { useDebounce } from "../hooks/useDebounce";
import { Search, Package, X, Layers, ChevronDown, ChevronUp } from "lucide-react";
import type { TOrder } from "../models/types";

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

  // ── Group orders by groupId ──────────────────────────────────────────────
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

    // Merge into a single list sorted by most recent updatedAt
    const items: ListItem[] = [
      ...singles.map((o) => ({ type: "single" as const, order: o })),
      ...Array.from(groups.entries()).map(([groupId, groupOrders]) => ({
        type: "group" as const,
        groupId,
        orders: groupOrders,
      })),
    ];

    items.sort((a, b) => {
      const aDate = a.type === "single" ? a.order.updatedAt! : a.orders[0].updatedAt!;
      const bDate = b.type === "single" ? b.order.updatedAt! : b.orders[0].updatedAt!;
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

        {listItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package size={48} className="text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              {debouncedSearch
                ? `No orders found for "${debouncedSearch}"`
                : "No orders yet"}
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
                      <StatusChip status={order.status} className="text-xs px-2 py-0.5 shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1.5">{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.freeSize ? "Free Size" : `${order.height} × ${order.width} ${order.unit}`} &bull; {order.quantity} pcs
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      {order.customerName && (
                        <p className="text-xs text-muted-foreground truncate flex-1 min-w-0">{order.customerName}</p>
                      )}
                      <p className="text-xs text-muted-foreground shrink-0 ml-2">
                        {new Date(order.createdAt!).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </button>
              );
            }

            // ── Group card ──────────────────────────────────────────────────
            const { groupId, orders: groupOrders } = item;
            const isExpanded = expandedGroups.has(groupId);
            const firstOrder = groupOrders[0];
            const allStatuses = [...new Set(groupOrders.map((o) => o.status))];
            const overallStatus = allStatuses.length === 1 ? allStatuses[0] : "in_progress";

            return (
              <div key={groupId} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                {/* Group header — tap to expand/collapse */}
                <button
                  onClick={() => toggleGroup(groupId)}
                  className="w-full text-left p-3 flex items-center gap-3 active:bg-secondary/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Layers size={20} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {firstOrder.customerName || "Group Order"}
                      </p>
                      <StatusChip status={overallStatus} className="text-xs px-2 py-0.5 shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {groupId} &bull; {groupOrders.length} item{groupOrders.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(firstOrder.createdAt!).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
                </button>

                {/* Expanded items */}
                {isExpanded && (
                  <div className="border-t border-border divide-y divide-border">
                    {groupOrders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="w-full text-left p-3 flex gap-3 active:bg-secondary/50 transition-colors"
                      >
                        <img
                          src={order.productImage}
                          alt={order.productName}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-secondary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-0.5">
                            <p className="font-semibold text-foreground text-sm leading-snug line-clamp-1 flex-1 min-w-0">
                              {order.productName}
                            </p>
                            <StatusChip status={order.status} className="text-xs px-2 py-0.5 shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground mb-0.5">{order.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.freeSize ? "Free Size" : `${order.height} × ${order.width} ${order.unit}`} &bull; {order.quantity} pcs
                          </p>
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
