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
} from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

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
      bg: "bg-info/10",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: TrendingUp,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Done",
      value: stats.done,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
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
    <div className="min-h-screen bg-background pb-24">
      {/* ── Header ── */}
      <header className="bg-primary text-primary-foreground px-4 pt-8 pb-5 sticky top-0 z-40">
        <div className="max-w-lg mx-auto flex items-start justify-between">
          <div>
            <p className="text-xs text-primary-foreground/55 font-medium mb-0.5">
              {greeting()},
            </p>
            <h1 className="text-2xl font-bold tracking-tight leading-none">
              {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-xs text-primary-foreground/40 mt-1.5">
              {fmtDate()}
            </p>
          </div>
          <button
            aria-label="Notifications"
            onClick={() => setShowNotifications(true)}
            className="relative mt-1 p-2.5 bg-primary-foreground/10 rounded-full active:scale-95 transition-transform"
          >
            <Bell size={20} />
            {hasAlerts && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            )}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* ── Section 1: Alerts ── */}
        {hasAlerts && (
          <section className="flex gap-3">
            {stats.damaged > 0 && (
              <button
                onClick={() => router.push("/inventory")}
                className="flex-1 flex flex-col items-center gap-2 bg-destructive/5 border border-destructive/15 rounded-2xl px-3 py-3.5 text-center active:scale-[0.98] transition-transform"
              >
                <div className="p-2 bg-destructive/10 rounded-xl">
                  <AlertTriangle className="text-destructive" size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-destructive leading-none">
                    Damaged
                  </p>
                  <p className="text-xs text-destructive/60 mt-0.5">
                    {stats.damaged} units
                  </p>
                </div>
              </button>
            )}

            {stats.lowInventory > 0 && (
              <button
                onClick={() => router.push("/inventory")}
                className="flex-1 flex flex-col items-center gap-2 bg-warning/5 border border-warning/15 rounded-2xl px-3 py-3.5 text-center active:scale-[0.98] transition-transform"
              >
                <div className="p-2 bg-warning/10 rounded-xl">
                  <Package className="text-warning" size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-warning leading-none">
                    Low Stock
                  </p>
                  <p className="text-xs text-warning/60 mt-0.5">
                    {stats.lowInventory} product{stats.lowInventory > 1 ? "s" : ""}
                  </p>
                </div>
              </button>
            )}
          </section>
        )}

        {/* ── Section 2: Today's Pulse ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Today's Pulse</h2>
            <button
              onClick={() => router.push("/orders")}
              className="text-xs text-accent font-semibold flex items-center gap-0.5"
            >
              All orders <ChevronRight size={13} />
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            {/* 4 stat chips */}
            <div className="grid grid-cols-4 gap-2">
              {pipeline.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => router.push("/orders")}
                    className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}
                    >
                      <Icon size={17} className={s.color} />
                    </div>
                    <p className={`text-xl font-bold leading-none ${s.color}`}>
                      {s.value}
                    </p>
                    <p className="text-[10px] text-muted-foreground text-center leading-tight">
                      {s.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Section 3: Recent Orders ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Recent Orders</h2>
            <button
              onClick={() => router.push("/orders")}
              className="text-xs text-accent font-semibold flex items-center gap-0.5"
            >
              View all <ChevronRight size={13} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
              {recentOrders.map((order) => {
                const meta = STATUS_META[order.status] ?? STATUS_META.cancelled;
                return (
                  <button
                    key={order.id}
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/30 active:bg-secondary/50 transition-colors"
                  >
                    {/* Image with status dot */}
                    <div className="relative shrink-0">
                      <img
                        src={order.productImage}
                        alt={order.productName}
                        className="w-11 h-11 rounded-xl object-cover bg-secondary"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${meta.dot}`}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate leading-snug">
                        {order.productName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {order.id}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border inline-block" />
                        <span className="text-xs text-muted-foreground">
                          {order.quantity} pcs
                        </span>
                      </div>
                    </div>

                    {/* Status + chevron */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${meta.pill}`}
                      >
                        {meta.label}
                      </span>
                      <ChevronRight
                        size={13}
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

      {/* ── Notification Panel ── */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowNotifications(false)}
          />

          {/* Panel */}
          <div className="relative bg-card rounded-t-3xl shadow-2xl max-h-[75vh] flex flex-col">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="text-base font-bold text-foreground">
                Notifications
              </h2>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-xs text-accent font-semibold"
              >
                Close
              </button>
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
              {/* No alerts */}
              {!hasAlerts && stats.pending === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Bell size={32} className="text-muted-foreground mb-3" />
                  <p className="text-sm font-semibold text-foreground">
                    All clear
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No new notifications
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
                  className="w-full flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/15 rounded-2xl text-left active:scale-[0.98] transition-transform"
                >
                  <div className="p-2 bg-destructive/10 rounded-xl shrink-0 mt-0.5">
                    <AlertTriangle className="text-destructive" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-destructive">
                      Damaged Inventory
                    </p>
                    <p className="text-xs text-destructive/60 mt-0.5">
                      {stats.damaged} unit{stats.damaged > 1 ? "s" : ""} need
                      attention
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
                  className="w-full flex items-start gap-3 p-3 bg-warning/5 border border-warning/15 rounded-2xl text-left active:scale-[0.98] transition-transform"
                >
                  <div className="p-2 bg-warning/10 rounded-xl shrink-0 mt-0.5">
                    <Package className="text-warning" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-warning">
                      Low Stock
                    </p>
                    <p className="text-xs text-warning/60 mt-0.5">
                      {stats.lowInventory} product
                      {stats.lowInventory > 1 ? "s" : ""} running low
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
                  className="w-full flex items-start gap-3 p-3 bg-info/5 border border-info/15 rounded-2xl text-left active:scale-[0.98] transition-transform"
                >
                  <div className="p-2 bg-info/10 rounded-xl shrink-0 mt-0.5">
                    <Clock className="text-info" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-info">
                      Pending Orders
                    </p>
                    <p className="text-xs text-info/60 mt-0.5">
                      {stats.pending} order{stats.pending > 1 ? "s" : ""}{" "}
                      waiting to be started
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
                  className="w-full flex items-start gap-3 p-3 bg-success/5 border border-success/15 rounded-2xl text-left active:scale-[0.98] transition-transform"
                >
                  <div className="p-2 bg-success/10 rounded-xl shrink-0 mt-0.5">
                    <CheckCircle2 className="text-success" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-success">
                      Ready to Ship
                    </p>
                    <p className="text-xs text-success/60 mt-0.5">
                      {stats.done} order{stats.done > 1 ? "s" : ""} completed
                      and ready for shipment
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
