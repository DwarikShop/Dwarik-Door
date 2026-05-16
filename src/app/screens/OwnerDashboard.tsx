import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { FAB } from "../components/FAB";
import { useAuth } from "../context/AuthContext";
import { orders, products } from "../data/mockData";
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
  const navigate = useNavigate();

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
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 3);

  const pipeline = [
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-info",
      bg: "bg-info/10",
      bar: "bg-info",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: TrendingUp,
      color: "text-warning",
      bg: "bg-warning/10",
      bar: "bg-warning",
    },
    {
      label: "Done",
      value: stats.done,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
      bar: "bg-success",
    },
    {
      label: "Shipped",
      value: stats.shipped,
      icon: Truck,
      color: "text-primary",
      bg: "bg-primary/10",
      bar: "bg-primary",
    },
  ];
  const pipelineTotal = pipeline.reduce((s, p) => s + p.value, 0) || 1;

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
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
            className="relative mt-1 p-2.5 bg-primary-foreground/10 rounded-full"
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
          <section className="space-y-2">
            {stats.damaged > 0 && (
              <button
                onClick={() => navigate("/inventory")}
                className="w-full flex items-center gap-3 bg-destructive/5 border border-destructive/15 rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition-transform"
              >
                <div className="p-2 bg-destructive/10 rounded-xl shrink-0">
                  <AlertTriangle className="text-destructive" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-destructive leading-none">
                    Damaged Inventory
                  </p>
                  <p className="text-xs text-destructive/60 mt-0.5">
                    {stats.damaged} units need attention
                  </p>
                </div>
                <ChevronRight
                  size={15}
                  className="text-destructive/40 shrink-0"
                />
              </button>
            )}

            {stats.lowInventory > 0 && (
              <button
                onClick={() => navigate("/inventory")}
                className="w-full flex items-center gap-3 bg-warning/5 border border-warning/15 rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition-transform"
              >
                <div className="p-2 bg-warning/10 rounded-xl shrink-0">
                  <Package className="text-warning" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-warning leading-none">
                    Low Stock
                  </p>
                  <p className="text-xs text-warning/60 mt-0.5">
                    {stats.lowInventory} product
                    {stats.lowInventory > 1 ? "s" : ""} running low
                  </p>
                </div>
                <ChevronRight size={15} className="text-warning/40 shrink-0" />
              </button>
            )}
          </section>
        )}

        {/* ── Section 2: Today's Pulse ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Today's Pulse</h2>
            <button
              onClick={() => navigate("/orders")}
              className="text-xs text-accent font-semibold flex items-center gap-0.5"
            >
              All orders <ChevronRight size={13} />
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            {/* Segmented bar */}
            <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-5">
              {pipeline.map((p) =>
                p.value > 0 ? (
                  <div
                    key={p.label}
                    className={`${p.bar} rounded-full transition-all duration-700`}
                    style={{ width: `${(p.value / pipelineTotal) * 100}%` }}
                  />
                ) : null,
              )}
              {/* Empty state bar */}
              {pipelineTotal === 0 && (
                <div className="bg-secondary rounded-full w-full" />
              )}
            </div>

            {/* 4 stat chips */}
            <div className="grid grid-cols-4 gap-2">
              {pipeline.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => navigate("/orders")}
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
              onClick={() => navigate("/orders")}
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
                    onClick={() => navigate(`/orders/${order.id}`)}
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
    </div>
  );
}
