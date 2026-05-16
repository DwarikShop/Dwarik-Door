import { useState } from "react";
import { BottomNav } from "../components/BottomNav";
import { products } from "../data/mockData";
import {
  Search,
  Package,
  AlertTriangle,
  TrendingDown,
  ShieldAlert,
  Layers,
  ChevronRight,
} from "lucide-react";

type FilterType = "all" | "low" | "out" | "damaged";

export function InventoryDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const stats = {
    total: products.length,
    lowStock: products.filter(
      (p) => p.stock - p.reserved <= 10 && p.stock - p.reserved > 0,
    ).length,
    outOfStock: products.filter((p) => p.stock - p.reserved <= 0).length,
    totalDamaged: products.reduce((acc, p) => acc + p.damaged, 0),
  };

  const filteredProducts = products.filter((product) => {
    const available = product.stock - product.reserved;

    const matchesSearch =
      !searchTerm ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "low" && available > 0 && available <= 10) ||
      (filter === "out" && available <= 0) ||
      (filter === "damaged" && product.damaged > 0);

    return matchesSearch && matchesFilter;
  });

  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: "all", label: "All", count: stats.total },
    { value: "low", label: "Low Stock", count: stats.lowStock },
    { value: "out", label: "Out of Stock", count: stats.outOfStock },
    { value: "damaged", label: "Damaged", count: stats.totalDamaged },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
      {/* ── Sticky Header ── */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-40 shadow-lg">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-primary-foreground/60 font-medium uppercase tracking-wider">
                Dwarik Door
              </p>
              <h1 className="text-xl font-bold">Inventory</h1>
            </div>
            <div className="flex items-center gap-2">
              {stats.totalDamaged > 0 && (
                <div className="flex items-center gap-1.5 bg-destructive/20 text-destructive-foreground px-3 py-1.5 rounded-full">
                  <ShieldAlert size={14} />
                  <span className="text-xs font-bold">
                    {stats.totalDamaged} damaged
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-foreground/50"
              size={17}
            />
            <input
              type="text"
              placeholder="Search by name, ID or category…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent border-0 text-sm"
            />
          </div>
        </div>

        {/* Filter tabs — flush to header bottom */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none px-4 pb-3">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f.value
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20"
              }`}
            >
              {f.label}
              <span
                className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                  filter === f.value
                    ? "bg-accent-foreground/20 text-accent-foreground"
                    : "bg-primary-foreground/20 text-primary-foreground/60"
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* ── Stats Row ── */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              label: "Total",
              value: stats.total,
              icon: Layers,
              color: "text-primary",
              bg: "bg-primary/8",
            },
            {
              label: "Low Stock",
              value: stats.lowStock,
              icon: TrendingDown,
              color: "text-warning",
              bg: "bg-warning/10",
            },
            {
              label: "Out",
              value: stats.outOfStock,
              icon: Package,
              color: "text-destructive",
              bg: "bg-destructive/10",
            },
            {
              label: "Damaged",
              value: stats.totalDamaged,
              icon: AlertTriangle,
              color: "text-orange-500",
              bg: "bg-orange-50 dark:bg-orange-500/10",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-card border border-border rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-sm"
              >
                <div className={`p-1.5 rounded-lg ${s.bg}`}>
                  <Icon size={14} className={s.color} />
                </div>
                <p className={`text-xl font-bold leading-none ${s.color}`}>
                  {s.value}
                </p>
                <p className="text-[10px] text-muted-foreground text-center leading-tight">
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Product List ── */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-3">
        {/* Result count */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs text-accent font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
              <Package size={32} className="text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground mb-1">
              No products found
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const available = product.stock - product.reserved;
            const stockStatus =
              available > 10 ? "available" : available > 0 ? "low" : "out";
            const hasDamaged = product.damaged > 0;

            // Stock bar proportions
            const total = product.stock;
            const availablePct = total > 0 ? (available / total) * 100 : 0;
            const reservedPct =
              total > 0 ? (product.reserved / total) * 100 : 0;
            const damagedPct = total > 0 ? (product.damaged / total) * 100 : 0;

            const borderColor =
              stockStatus === "out"
                ? "border-l-destructive"
                : stockStatus === "low"
                  ? "border-l-warning"
                  : hasDamaged
                    ? "border-l-orange-400"
                    : "border-l-transparent";

            const statusDot =
              stockStatus === "available"
                ? "bg-success"
                : stockStatus === "low"
                  ? "bg-warning"
                  : "bg-destructive";

            const statusLabel =
              stockStatus === "available"
                ? "Available"
                : stockStatus === "low"
                  ? "Low Stock"
                  : "Out of Stock";

            const statusTextColor =
              stockStatus === "available"
                ? "text-success"
                : stockStatus === "low"
                  ? "text-warning"
                  : "text-destructive";

            return (
              <div
                key={product.id}
                className={`bg-card border border-border border-l-4 ${borderColor} rounded-2xl overflow-hidden shadow-sm`}
              >
                <div className="flex gap-0">
                  {/* Product image — tall portrait strip */}
                  <div className="w-24 shrink-0 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      style={{ minHeight: "120px" }}
                    />
                    {/* Price overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                      <p className="text-white text-[10px] font-bold">
                        ₹{(product.price / 1000).toFixed(1)}k
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 p-3">
                    {/* Top row: name + status */}
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className="font-bold text-foreground text-sm leading-snug line-clamp-2 flex-1 min-w-0">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusDot}`}
                        />
                        <span
                          className={`text-[11px] font-semibold ${statusTextColor}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* ID + category */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-xs text-muted-foreground font-mono">
                        {product.id}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-xs text-muted-foreground truncate">
                        {product.category}
                      </span>
                    </div>

                    {/* Stock numbers row */}
                    <div className="grid grid-cols-3 gap-1 mb-2.5">
                      <div className="bg-success/8 rounded-lg px-2 py-1.5 text-center">
                        <p className="text-sm font-bold text-success leading-none">
                          {available}
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          Available
                        </p>
                      </div>
                      <div className="bg-info/8 rounded-lg px-2 py-1.5 text-center">
                        <p className="text-sm font-bold text-info leading-none">
                          {product.reserved}
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          Reserved
                        </p>
                      </div>
                      <div
                        className={`rounded-lg px-2 py-1.5 text-center ${
                          hasDamaged ? "bg-destructive/8" : "bg-secondary"
                        }`}
                      >
                        <p
                          className={`text-sm font-bold leading-none ${
                            hasDamaged
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          {product.damaged}
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          Damaged
                        </p>
                      </div>
                    </div>

                    {/* Visual stock bar */}
                    <div className="space-y-1">
                      <div className="flex h-1.5 rounded-full overflow-hidden bg-secondary gap-px">
                        {availablePct > 0 && (
                          <div
                            className="bg-success rounded-full transition-all duration-500"
                            style={{ width: `${availablePct}%` }}
                          />
                        )}
                        {reservedPct > 0 && (
                          <div
                            className="bg-info rounded-full transition-all duration-500"
                            style={{ width: `${reservedPct}%` }}
                          />
                        )}
                        {damagedPct > 0 && (
                          <div
                            className="bg-destructive rounded-full transition-all duration-500"
                            style={{ width: `${damagedPct}%` }}
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                            Avail
                          </span>
                          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-info inline-block" />
                            Resv
                          </span>
                          {hasDamaged && (
                            <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                              Dmgd
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-muted-foreground">
                          {product.stock} total
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom action strip — only for attention items */}
                {(stockStatus !== "available" || hasDamaged) && (
                  <div
                    className={`flex items-center justify-between px-3 py-2 border-t border-border ${
                      stockStatus === "out"
                        ? "bg-destructive/5"
                        : stockStatus === "low"
                          ? "bg-warning/5"
                          : "bg-orange-50 dark:bg-orange-500/5"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium ${
                        stockStatus === "out"
                          ? "text-destructive"
                          : stockStatus === "low"
                            ? "text-warning"
                            : "text-orange-500"
                      }`}
                    >
                      {stockStatus === "out"
                        ? "⚠ Out of stock — reorder needed"
                        : stockStatus === "low"
                          ? `⚠ Only ${available} units left`
                          : `${product.damaged} unit${product.damaged > 1 ? "s" : ""} damaged`}
                    </p>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>

      <BottomNav />
    </div>
  );
}
