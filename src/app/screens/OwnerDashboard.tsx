"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { FAB } from "../components/FAB";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../hooks/useOrders";
import { useProducts } from "../hooks/useProducts";
import {
  Bell,
  AlertTriangle,
  Package,
  Clock,
  TrendingUp,
  CheckCircle2,
  Truck,
  ChevronRight,
  Sparkles,
  Activity,
  Inbox,
} from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// Format Date in standard Indian format
function fmtDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const STATUS_META: Record<
  string,
  { label: string; dot: string; pill: string }
> = {
  draft: {
    label: "Draft",
    dot: "bg-muted-foreground",
    pill: "bg-muted/50 text-muted-foreground",
  },
  placed: { label: "Placed", dot: "bg-info", pill: "bg-info/10 text-info" },
  backordered: {
    label: "Backordered",
    dot: "bg-destructive",
    pill: "bg-destructive/10 text-destructive",
  },
  in_progress: {
    label: "In Progress",
    dot: "bg-warning",
    pill: "bg-warning/10 text-warning",
  },
  done: {
    label: "Done",
    dot: "bg-success",
    pill: "bg-success/10 text-success",
  },
  shipped: {
    label: "Shipped",
    dot: "bg-primary",
    pill: "bg-primary/10 text-primary",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-muted-foreground",
    pill: "bg-secondary text-muted-foreground",
  },
  rejected: {
    label: "Rejected",
    dot: "bg-destructive",
    pill: "bg-destructive/10 text-destructive",
  },
};

export function OwnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { products } = useProducts();
  const { orders } = useOrders({ role: "owner", status: "all" });
  const [showNotifications, setShowNotifications] = useState(false);

  const stats = {
    drafts: orders.filter((o) => o.status === "draft").length,
    pending: orders.filter((o) => o.status === "placed").length,
    backordered: orders.filter((o) => o.status === "backordered").length,
    backorderedUnits: orders.filter((o) => o.status === "backordered").reduce((acc, o) => acc + o.quantity, 0),
    inProgress: orders.filter((o) => o.status === "in_progress").length,
    done: orders.filter((o) => o.status === "done").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    rejected: orders.filter((o) => o.status === "rejected").length,
    lowInventory: products.filter((p) => p.stock - p.reserved < 10).length,
    damaged: products.reduce((acc, p) => acc + p.damaged, 0),
  };

  const hasAlerts = stats.damaged > 0 || stats.lowInventory > 0 || stats.backordered > 0;
  const recentOrders = orders
    .filter((o) => o.status !== "cancelled")
    .sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    )
    .slice(0, 10);

  const pulseStats = [
    {
      label: "Pending",
      value: stats.pending,
      color: "text-info",
    },
    {
      label: "Progress",
      value: stats.inProgress,
      color: "text-warning",
    },
    {
      label: "Done",
      value: stats.done,
      color: "text-success",
    },
    {
      label: "Shipped",
      value: stats.shipped,
      color: "text-primary",
    },
    {
      label: "Drafts",
      value: stats.drafts,
      color: "text-muted-foreground",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      color: "text-muted-foreground",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      color: "text-destructive",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-24 font-sans select-none animate-[fadeIn_0.25s_ease-out]">
      
      {/* Brand Header consistent with other pages */}
      <header className="bg-[#4E342E] dark:bg-[#2A1510] border-b border-[#DAB668]/40 text-white px-4 pt-8 pb-5 sticky top-0 z-40 shadow-[0_4px_25px_rgba(78,52,46,0.25)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300">
        <div className="max-w-lg mx-auto flex items-start justify-between">
          <div>
            <p className="text-[11px] text-neutral-400/80 font-extrabold uppercase tracking-widest leading-none mb-2">
              {greeting()},
            </p>
            <h1 className="text-3xl font-black tracking-tight leading-none text-white flex items-center gap-2">
              <span>{user?.name?.split(" ")[0] || "Owner"}</span>
              <Sparkles size={20} className="text-accent animate-pulse" />
            </h1>
            <p className="text-[11px] text-accent font-bold mt-3">
              {fmtDate()}
            </p>
          </div>
          
          <button
            aria-label="Notifications"
            onClick={() => setShowNotifications(true)}
            className="relative p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl active:scale-90 transition-all cursor-pointer border border-white/15 shadow-sm"
          >
            <Bell size={20} className="text-neutral-300 hover:text-white transition-colors" />
            {hasAlerts && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full animate-ping shadow-[0_0_8px_rgba(218,182,104,0.6)]" />
            )}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        
        {/* ── Section 1: Alerts (Snug Notification Cards) ── */}
        {hasAlerts && (
          <section className="flex gap-3 overflow-x-auto scrollbar-none animate-[slideUp_0.3s_ease-out]">
            {stats.backordered > 0 && (
              <button
                onClick={() => router.push("/orders")}
                className="flex-none w-[160px] flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-2xl p-3.5 text-left active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                <div className="p-2 bg-destructive/15 rounded-xl shrink-0">
                  <AlertTriangle className="text-destructive animate-pulse" size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase font-extrabold text-destructive/85 tracking-wider">Backorders</p>
                  <p className="text-sm font-black text-destructive leading-tight mt-0.5">
                    {stats.backordered} orders
                  </p>
                </div>
              </button>
            )}
            {stats.damaged > 0 && (
              <button
                onClick={() => router.push("/inventory")}
                className="flex-none w-[160px] flex items-center gap-3 bg-destructive/5 border border-destructive/15 rounded-2xl p-3.5 text-left active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                <div className="p-2 bg-destructive/10 rounded-xl shrink-0">
                  <AlertTriangle className="text-destructive animate-pulse" size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase font-extrabold text-destructive/85 tracking-wider">Damaged Alert</p>
                  <p className="text-sm font-black text-destructive leading-tight mt-0.5">
                    {stats.damaged} units
                  </p>
                </div>
              </button>
            )}

            {stats.lowInventory > 0 && (
              <button
                onClick={() => router.push("/inventory")}
                className="flex-none w-[160px] flex items-center gap-3 bg-warning/5 border border-warning/15 rounded-2xl p-3.5 text-left active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                <div className="p-2 bg-warning/10 rounded-xl shrink-0">
                  <Package className="text-warning animate-pulse" size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase font-extrabold text-warning/85 tracking-wider">Low Stock Alert</p>
                  <p className="text-sm font-black text-warning leading-tight mt-0.5">
                    {stats.lowInventory} product{stats.lowInventory > 1 ? "s" : ""}
                  </p>
                </div>
              </button>
            )}
          </section>
        )}

        {/* ── Section 2: Today's Pulse ── */}
        <section className="space-y-2.5 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Activity size={14} className="text-accent" />
              <h2 className="text-sm font-black uppercase tracking-wider">Today's Pulse</h2>
            </div>
            <button
              onClick={() => router.push("/orders")}
              className="text-[10px] text-accent font-black uppercase tracking-wider flex items-center gap-0.5 cursor-pointer hover:underline"
            >
              All orders <ChevronRight size={10} />
            </button>
          </div>

          <div className="flex gap-2 py-1 overflow-x-auto scrollbar-none">
            {pulseStats.map((s) => (
              <button
                key={s.label}
                onClick={() => router.push("/orders")}
                className="flex-none w-[92px] bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm active:scale-95 cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center py-3.5 px-1 gap-1"
              >
                <p className={`text-2xl font-black leading-none tabular-nums ${s.color}`}>
                  {s.value}
                </p>
                <p className="text-[9.5px] uppercase tracking-wide font-extrabold text-muted-foreground text-center leading-tight">
                  {s.label}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* ── Section 3: Recent Orders ── */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Inbox size={15} className="text-accent" />
              <h2 className="text-sm font-black uppercase tracking-wider">Recent Activity</h2>
            </div>
            
            <button
              onClick={() => router.push("/orders")}
              className="text-xs text-accent font-black uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="bg-card border border-border/40 rounded-3xl p-10 text-center shadow-sm">
              <Package size={26} className="text-muted-foreground/60 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-bold">No active orders found</p>
            </div>
          ) : (
            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm divide-y divide-border/20">
              {recentOrders.map((order) => {
                const meta = STATUS_META[order.status] ?? STATUS_META.cancelled;
                return (
                  <button
                    key={order.id}
                    onClick={() => router.push(order.status === 'draft' ? `/place-order?editDraftId=${order.id}` : `/orders/${order.id}`)}
                    className="w-full flex items-center gap-3 px-3.5 py-3.5 text-left hover:bg-secondary/35 active:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    {/* Compact Image with status indicator */}
                    <div className="relative shrink-0">
                      <img
                        src={order.productImage || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop"}
                        alt={order.productName}
                        className="w-14 h-14 rounded-xl object-cover border border-border/30 bg-secondary"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${meta.dot}`}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-extrabold text-foreground break-words whitespace-normal leading-tight">
                        {order.productName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5 leading-none">
                        <span className="text-[11px] font-mono text-muted-foreground/80">
                          {order.id}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border inline-block shrink-0" />
                        <span className="text-[11px] font-bold text-accent">
                          Qty: {order.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-black ${meta.pill}`}
                      >
                        {meta.label}
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-muted-foreground/40"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
      <FAB />

      {/* ── Notification Drawer Panel ── */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end animate-[fadeIn_0.2s_ease-out]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNotifications(false)}
          />

          {/* Panel drawer */}
          <div className="relative bg-card rounded-t-3xl shadow-2xl max-h-[75vh] flex flex-col animate-[slideUp_0.3s_ease-out] border-t border-border/30">
            {/* Grab handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30">
              <div className="flex items-center gap-1.5">
                <Bell size={18} className="text-accent animate-bounce" />
                <h2 className="text-base font-extrabold text-foreground uppercase tracking-wider">
                  Live Notifications
                </h2>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-xs text-accent font-black uppercase tracking-wider cursor-pointer"
              >
                Done
              </button>
            </div>

            {/* Notification items */}
            <div className="overflow-y-auto flex-1 px-4 py-4 space-y-2.5">
              {/* No notifications */}
              {!hasAlerts && stats.pending === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-secondary/30 rounded-2xl p-6">
                  <Bell size={32} className="text-muted-foreground/60 mb-2" />
                  <p className="font-extrabold text-foreground text-sm uppercase tracking-wider">
                    All updates clear
                  </p>
                  <p className="text-xs text-muted-foreground max-w-[240px] mt-1 leading-relaxed">
                    No urgent pending orders or inventory alerts reported.
                  </p>
                </div>
              )}

              {/* Damaged inventory alert */}
              {stats.damaged > 0 && (
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    router.push("/inventory");
                  }}
                  className="w-full flex items-start gap-3 p-3.5 bg-destructive/5 border border-destructive/15 rounded-2xl text-left active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="p-2 bg-destructive/10 rounded-xl shrink-0 mt-0.5">
                    <AlertTriangle className="text-destructive" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm uppercase font-extrabold text-destructive tracking-wider">
                      Damaged Inventory
                    </p>
                    <p className="text-xs text-destructive/70 mt-1 leading-snug">
                      {stats.damaged} door unit{stats.damaged > 1 ? "s" : ""} marked as damaged. Action required to re-allocate or update status.
                    </p>
                  </div>
                </button>
              )}

              {/* Low stock alert */}
              {stats.lowInventory > 0 && (
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    router.push("/inventory");
                  }}
                  className="w-full flex items-start gap-3 p-3.5 bg-warning/5 border border-warning/15 rounded-2xl text-left active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="p-2 bg-warning/10 rounded-xl shrink-0 mt-0.5">
                    <Package className="text-warning" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm uppercase font-extrabold text-warning tracking-wider">
                      Low stock catalog Alert
                    </p>
                    <p className="text-xs text-warning/70 mt-1 leading-snug">
                      {stats.lowInventory} door catalog item{stats.lowInventory > 1 ? "s are" : " is"} running below warning threshold (10 units).
                    </p>
                  </div>
                </button>
              )}

              {/* Pending orders */}
              {stats.pending > 0 && (
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    router.push("/orders");
                  }}
                  className="w-full flex items-start gap-3 p-3.5 bg-info/5 border border-info/15 rounded-2xl text-left active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="p-2 bg-info/10 rounded-xl shrink-0 mt-0.5">
                    <Clock className="text-info" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm uppercase font-extrabold text-info tracking-wider">
                      New Orders Placed
                    </p>
                    <p className="text-xs text-info/70 mt-1 leading-snug">
                      {stats.pending} order{stats.pending > 1 ? "s are" : " is"} waiting in the placements log to be processed by operators.
                    </p>
                  </div>
                </button>
              )}

              {/* Orders done but not shipped */}
              {stats.done > 0 && (
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    router.push("/orders");
                  }}
                  className="w-full flex items-start gap-3 p-3.5 bg-success/5 border border-success/15 rounded-2xl text-left active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="p-2 bg-success/10 rounded-xl shrink-0 mt-0.5">
                    <CheckCircle2 className="text-success" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm uppercase font-extrabold text-success tracking-wider">
                      Ready for Shipment
                    </p>
                    <p className="text-xs text-success/70 mt-1 leading-snug">
                      {stats.done} door order{stats.done > 1 ? "s are" : " is"} completed and waiting to be marked as shipped to customers.
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
