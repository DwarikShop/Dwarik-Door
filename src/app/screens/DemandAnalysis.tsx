"use client";

/**
 * DemandAnalysis
 *
 * Shows a pie chart of product demand based on order quantity from MongoDB.
 * Each slice = one product, sized by total units ordered across active orders.
 * Future: category-wise breakdown (data structure already prepared).
 */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOrders } from "../hooks/useOrders";
import { useProducts } from "../hooks/useProducts";
import { ArrowLeft, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Brand-consistent colour palette
const SLICE_COLORS = [
  "#C89B3C",
  "#4E342E",
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#84CC16",
];

interface DemandEntry {
  id: string;
  name: string;
  category: string;
  totalOrdered: number;
  orderCount: number;
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DemandEntry;
  const total = payload[0].value as number;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-foreground mb-0.5">{d.name}</p>
      <p className="text-muted-foreground">
        {d.id} · {d.category}
      </p>
      <p className="text-accent font-semibold mt-1">{total} units ordered</p>
      <p className="text-muted-foreground">
        {d.orderCount} order{d.orderCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ── Custom legend ─────────────────────────────────────────────────────────────
// Using `any` for the recharts Legend content prop to avoid version-specific type issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomLegend(props: any) {
  const payload = props?.payload as
    | { value: string; color?: string }[]
    | undefined;
  if (!payload) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2 px-2">
      {payload.map((entry, i) => (
        <li
          key={i}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              backgroundColor:
                entry.color ?? SLICE_COLORS[i % SLICE_COLORS.length],
            }}
          />
          <span className="truncate max-w-[100px]">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export function DemandAnalysis() {
  const router = useRouter();

  // Fetch all orders (limit 100 to cover full history) and all products
  const { orders, isLoading: ordersLoading } = useOrders({
    role: "owner",
    limit: 100,
  });
  const { products, isLoading: productsLoading } = useProducts();

  const isLoading = ordersLoading || productsLoading;

  // ── Aggregate demand ──────────────────────────────────────────────────────
  const demandData = useMemo<DemandEntry[]>(() => {
    if (!orders.length || !products.length) return [];

    // Only count active orders (exclude cancelled / rejected)
    const activeOrders = orders.filter(
      (o) => !["cancelled", "rejected"].includes(o.status),
    );

    const demandMap = new Map<
      string,
      { totalOrdered: number; orderCount: number }
    >();
    for (const order of activeOrders) {
      if (!order.productId) continue;
      const prev = demandMap.get(order.productId) ?? {
        totalOrdered: 0,
        orderCount: 0,
      };
      demandMap.set(order.productId, {
        totalOrdered: prev.totalOrdered + order.quantity,
        orderCount: prev.orderCount + 1,
      });
    }

    return products
      .map((p) => {
        const d = demandMap.get(p.id) ?? { totalOrdered: 0, orderCount: 0 };
        return { id: p.id, name: p.name, category: p.category, ...d };
      })
      .filter((d) => d.totalOrdered > 0)
      .sort((a, b) => b.totalOrdered - a.totalOrdered);
  }, [orders, products]);

  const totalUnits = demandData.reduce((s, d) => s + d.totalOrdered, 0);
  const activeOrderCount = orders.filter(
    (o) => !["cancelled", "rejected"].includes(o.status),
  ).length;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="bg-[#4E342E] dark:bg-[#2A1510] border-b border-[#DAB668]/40 text-white px-4 py-4 sticky top-0 z-40 shadow-[0_4px_25px_rgba(78,52,46,0.25)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/10 hover:bg-white/15 text-white rounded-xl active:scale-90 transition-all cursor-pointer border border-white/15 shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-black leading-tight text-white">Demand Analysis</h1>
            <p className="text-[10px] text-neutral-400/80 mt-0.5">
              Real-time · based on active orders
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3">
            <div className="bg-card border border-border rounded-2xl h-72 animate-pulse" />
            <div className="bg-card border border-border rounded-2xl h-48 animate-pulse" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && demandData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp size={32} className="text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground mb-1">
              No demand data yet
            </p>
            <p className="text-sm text-muted-foreground">
              Place some orders to see demand analysis
            </p>
          </div>
        )}

        {/* Charts */}
        {!isLoading && demandData.length > 0 && (
          <>
            {/* Pie chart card */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-bold text-foreground">
                  Product Demand Spread
                </h2>
                <span className="text-xs text-muted-foreground">
                  {totalUnits} total units
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {demandData.length} product{demandData.length !== 1 ? "s" : ""}{" "}
                · {activeOrderCount} active order
                {activeOrderCount !== 1 ? "s" : ""}
              </p>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={demandData}
                    dataKey="totalOrdered"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                    }: {
                      cx: number;
                      cy: number;
                      midAngle: number;
                      innerRadius: number;
                      outerRadius: number;
                      percent: number;
                    }) => {
                      if (percent < 0.06) return null;
                      const RADIAN = Math.PI / 180;
                      const r = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + r * Math.cos(-midAngle * RADIAN);
                      const y = cy + r * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={11}
                          fontWeight={600}
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    labelLine={false}
                  >
                    {demandData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={CustomLegend} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Ranked list */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-bold text-foreground">
                  Top Products by Demand
                </h2>
              </div>
              <div className="divide-y divide-border">
                {demandData.map((d, index) => {
                  const pct =
                    totalUnits > 0 ? (d.totalOrdered / totalUnits) * 100 : 0;
                  const color = SLICE_COLORS[index % SLICE_COLORS.length];
                  return (
                    <div
                      key={d.id}
                      className="px-4 py-3 flex items-center gap-3"
                    >
                      {/* Rank badge */}
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {index + 1}
                      </span>

                      {/* Info + bar */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {d.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {d.id} · {d.category}
                        </p>
                        <div className="mt-1.5 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold" style={{ color }}>
                          {d.totalOrdered}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          units
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {pct.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Future: category breakdown placeholder */}
            <div className="bg-card border border-border border-dashed rounded-2xl p-4 text-center">
              <TrendingUp
                size={20}
                className="text-muted-foreground mx-auto mb-2"
              />
              <p className="text-xs font-semibold text-foreground">
                Category-wise breakdown
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Coming soon — demand grouped by door category
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
