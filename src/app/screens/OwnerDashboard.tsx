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
  placed: { label: "Placed", dot: "bg-info", pill: "bg-info/10 text-info" },
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
};

export function OwnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { products } = useProducts();
  const { orders } = useOrders({ role: "owner" });
  const [showNotifications, setShowNotifications] = useState(false);

  const stats = {
    pending: orders.filter((o) => o.status === "placed").length,
    inProgress: orders.filter((o) => o.status === "in_progress").length,
    done: orders.filter((o) => o.status === "done").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    lowInventory: products.filter((p) => p.stock - p.reserved < 10).length,
    damaged: products.reduce((acc, p) => acc + p.damaged, 0),
  };

  const hasAlerts = stats.damaged > 0 || stats.lowInventory > 0;
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    )
    .slice(0, 10);

  const pipeline = [
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-info",
      bg: "bg-info/8",
    },
    {
      label: "Progress",
      value: stats.inProgress,
      icon: TrendingUp,
      color: "text-warning",
      bg: "bg-warning/8",
    },
    {
      label: "Ready",
      value: stats.done,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/8",
    },
    {
      label: "Shipped",
      value: stats.shipped,
      icon: Truck,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-24 font-sans select-none animate-[fadeIn_0.25s_ease-out]">
      
      {/* Brand Header consistent with other pages */}
      <header className="bg-primary text-primary-foreground px-4 pt-8 pb-5 sticky top-0 z-40 shadow-md">
        <div className="max-w-lg mx-auto flex items-start justify-between">
          <div>
            <p className="text-[9px] text-primary-foreground/60 font-extrabold uppercase tracking-widest leading-none mb-1">
              {greeting()},
            </p>
            <h1 className="text-xl font-black tracking-tight leading-none text-primary-foreground flex items-center gap-1.5">
              <span>{user?.name?.split(" ")[0] || "Owner"}</span>
              <Sparkles size={14} className="text-accent animate-pulse" />
            </h1>
            <p className="text-[10px] text-[#DAB668] font-bold mt-2">
              {fmtDate()}
            </p>
          </div>
          
          <button
            aria-label="Notifications"
            onClick={() => setShowNotifications(true)}
            className="relative p-2.5 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-full active:scale-90 transition-all cursor-pointer border border-primary-foreground/5"
          >
            <Bell size={18} />
            {hasAlerts && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-ping" />
            )}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        
        {/* ── Section 1: Alerts (Snug Notification Cards) ── */}
        {hasAlerts && (
          <section className="flex gap-3 animate-[slideUp_0.3s_ease-out]">
            {stats.damaged > 0 && (
              <button
                onClick={() => router.push("/inventory")}
                className="flex-1 flex items-center gap-3 bg-destructive/5 border border-destructive/15 rounded-2xl p-3.5 text-left active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                <div className="p-2 bg-destructive/10 rounded-xl shrink-0">
                  <AlertTriangle className="text-destructive animate-pulse" size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-bold text-destructive/70 tracking-wider">Damaged Alert</p>
                  <p className="text-xs font-black text-destructive leading-tight mt-0.5">
                    {stats.damaged} units
                  </p>
                </div>
              </button>
            )}

            {stats.lowInventory > 0 && (
              <button
                onClick={() => router.push("/inventory")}
                className="flex-1 flex items-center gap-3 bg-warning/5 border border-warning/15 rounded-2xl p-3.5 text-left active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                <div className="p-2 bg-warning/10 rounded-xl shrink-0">
                  <Package className="text-warning animate-pulse" size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-bold text-warning/70 tracking-wider">Low Stock Alert</p>
                  <p className="text-xs font-black text-warning leading-tight mt-0.5">
                    {stats.lowInventory} product{stats.lowInventory > 1 ? "s" : ""}
                  </p>
                </div>
              </button>
            )}
          </section>
        )}

        {/* ── Section 2: Today's Pulse ── */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Activity size={12} className="text-accent" />
              <h2 className="text-[10px] font-extrabold uppercase tracking-widest">Today's Pulse</h2>
            </div>
            
            <button
              onClick={() => router.push("/orders")}
              className="text-[10px] text-accent font-extrabold uppercase tracking-widest flex items-center gap-0.5 cursor-pointer"
            >
              All orders <ChevronRight size={11} />
            </button>
          </div>

          <div className="bg-card border border-border/40 rounded-3xl p-4 shadow-sm">
            {/* 4 stat chips */}
            <div className="grid grid-cols-4 gap-2">
              {pipeline.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => router.push("/orders")}
                    className="flex flex-col items-center gap-1.5 active:scale-95 transition-all p-1 cursor-pointer"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}
                    >
                      <Icon size={16} className={s.color} />
                    </div>
                    <p className={`text-base font-black leading-none ${s.color}`}>
                      {s.value}
                    </p>
                    <p className="text-[9px] uppercase tracking-wide font-extrabold text-muted-foreground text-center">
                      {s.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Section 3: Recent Orders ── */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Inbox size={12} className="text-accent" />
              <h2 className="text-[10px] font-extrabold uppercase tracking-widest">Recent Activity</h2>
            </div>
            
            <button
              onClick={() => router.push("/orders")}
              className="text-[10px] text-accent font-extrabold uppercase tracking-widest flex items-center gap-0.5 cursor-pointer"
            >
              View all <ChevronRight size={11} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="bg-card border border-border/40 rounded-3xl p-10 text-center shadow-sm">
              <Package size={22} className="text-muted-foreground/60 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-semibold">No active orders found</p>
            </div>
          ) : (
            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm divide-y divide-border/20">
              {recentOrders.map((order) => {
                const meta = STATUS_META[order.status] ?? STATUS_META.cancelled;
                return (
                  <button
                    key={order.id}
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-secondary/35 active:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    {/* Compact Image with status indicator */}
                    <div className="relative shrink-0">
                      <img
                        src={order.productImage || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop"}
                        alt={order.productName}
                        className="w-12 h-12 rounded-xl object-cover border border-border/30 bg-secondary"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${meta.dot}`}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-extrabold text-foreground truncate leading-tight">
                        {order.productName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 leading-none">
                        <span className="text-[9px] font-mono text-muted-foreground/80">
                          {order.id}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border inline-block shrink-0" />
                        <span className="text-[9px] font-bold text-accent">
                          Qty: {order.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full font-black ${meta.pill}`}
                      >
                        {meta.label}
                      </span>
                      <ChevronRight
                        size={12}
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
                <Bell size={16} className="text-accent animate-bounce" />
                <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                  Live Notifications
                </h2>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-[10px] text-accent font-extrabold uppercase tracking-widest cursor-pointer"
              >
                Done
              </button>
            </div>

            {/* Notification items */}
            <div className="overflow-y-auto flex-1 px-4 py-4 space-y-2.5">
              {/* No notifications */}
              {!hasAlerts && stats.pending === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-secondary/30 rounded-2xl p-6">
                  <Bell size={28} className="text-muted-foreground/60 mb-2" />
                  <p className="font-extrabold text-foreground text-xs uppercase tracking-wider">
                    All updates clear
                  </p>
                  <p className="text-[10px] text-muted-foreground max-w-[200px] mt-1 leading-relaxed">
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
                    <AlertTriangle className="text-destructive" size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase font-extrabold text-destructive tracking-wider">
                      Damaged Inventory
                    </p>
                    <p className="text-[10px] text-destructive/70 mt-1 leading-snug">
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
                    <Package className="text-warning" size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase font-extrabold text-warning tracking-wider">
                      Low stock catalog Alert
                    </p>
                    <p className="text-[10px] text-warning/70 mt-1 leading-snug">
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
                    <Clock className="text-info" size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase font-extrabold text-info tracking-wider">
                      New Orders Placed
                    </p>
                    <p className="text-[10px] text-info/70 mt-1 leading-snug">
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
                    <CheckCircle2 className="text-success" size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase font-extrabold text-success tracking-wider">
                      Ready for Shipment
                    </p>
                    <p className="text-[10px] text-success/70 mt-1 leading-snug">
                      {stats.done} door order{stats.done > 1 ? "s are" : " is"} completed and waiting to be marked as shipped to clientes.
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
