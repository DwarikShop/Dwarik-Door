"use client";

import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { BottomNav } from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../hooks/useOrders";
import { Clock, CheckCircle2, Package, TrendingUp, Sparkles, ChevronRight, Activity, Zap, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusChip } from "../components/ui/StatusChip";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function EmployeeDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { orders: myOrders, isLoading } = useOrders({ role: "employee" });

  const assignedOrders = [...myOrders]
    .filter((o) => o.assignedTo === user?.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );
  const pendingOrders = assignedOrders.filter((o) => o.status === "placed");
  const inProgressOrders = assignedOrders.filter((o) => o.status === "in_progress");
  const completedToday = assignedOrders.filter(
    (o) =>
      o.status === "done" &&
      new Date(o.updatedAt!).toDateString() === new Date().toDateString(),
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-24 font-sans select-none animate-[fadeIn_0.2s_ease-out]">
        <header className="bg-[#4E342E] dark:bg-[#2A1510] border-b border-[#DAB668]/40 text-white px-4 pt-6 pb-5 sticky top-0 z-40 shadow-[0_4px_25px_rgba(78,52,46,0.25)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300">
          <div className="max-w-lg mx-auto">
            <div className="h-4 w-20 bg-white/10 rounded mb-1.5 animate-pulse" />
            <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
          </div>
        </header>
        <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border/50 rounded-2xl h-16 animate-pulse" />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border/50 rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-24 font-sans select-none animate-[fadeIn_0.25s_ease-out]">
      
      {/* Brand Header consistent with other pages */}
      <header className="bg-[#4E342E] dark:bg-[#2A1510] border-b border-[#DAB668]/40 text-white px-4 pt-6 pb-5 sticky top-0 z-40 shadow-[0_4px_25px_rgba(78,52,46,0.25)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300">
        <div className="max-w-lg mx-auto">
          <p className="text-[11px] text-neutral-400/80 font-extrabold uppercase tracking-widest leading-none mb-2">
            {greeting()},
          </p>
          <h1 className="text-3xl font-black tracking-tight leading-none text-white flex items-center gap-2">
            <span>{user?.name || "Employee"}</span>
            <Sparkles size={20} className="text-accent animate-pulse" />
          </h1>
          <p className="text-[11px] uppercase tracking-widest font-extrabold text-accent mt-3">
            Operator Workspace
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        
        {/* Today's Overview Stats */}
        <section className="space-y-2">
          <div className="flex items-center gap-1.5 text-muted-foreground px-1">
            <Activity size={15} className="text-accent" />
            <h2 className="text-sm font-black uppercase tracking-wider">Today's Production</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Pending */}
            <Card className="p-3.5 border-border/40 rounded-2xl shadow-sm bg-card hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-xl shrink-0">
                  <Clock className="text-warning animate-pulse" size={18} />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground leading-none">
                    {pendingOrders.length}
                  </p>
                  <p className="text-[11px] uppercase font-extrabold text-muted-foreground mt-1.5">
                    Pending
                  </p>
                </div>
              </div>
            </Card>

            {/* In Progress */}
            <Card className="p-3.5 border-border/40 rounded-2xl shadow-sm bg-card hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-info/10 rounded-xl shrink-0">
                  <TrendingUp className="text-info" size={18} />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground leading-none">
                    {inProgressOrders.length}
                  </p>
                  <p className="text-[11px] uppercase font-extrabold text-muted-foreground mt-1.5">
                    Progress
                  </p>
                </div>
              </div>
            </Card>

            {/* Completed today */}
            <Card className="col-span-2 p-3.5 border-border/40 rounded-2xl shadow-sm bg-card hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-xl shrink-0">
                  <CheckCircle2 className="text-success" size={18} />
                </div>
                <div>
                  <p className="text-xl font-black text-foreground leading-none flex items-center gap-1.5">
                    <span>{completedToday.length} units</span>
                    {completedToday.length > 0 && <Sparkles size={15} className="text-accent animate-pulse" />}
                  </p>
                  <p className="text-[11px] uppercase font-extrabold text-muted-foreground mt-1.5">
                    Completed Today
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Quick Actions grid */}
        <section className="space-y-2">
          <div className="flex items-center gap-1.5 text-muted-foreground px-1">
            <Zap size={15} className="text-accent" />
            <h2 className="text-sm font-black uppercase tracking-wider">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* My Orders Button */}
            <button
              onClick={() => router.push("/employee/orders")}
              className="h-20 bg-[#4E342E] hover:bg-[#3E2924] active:scale-95 text-primary-foreground rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow shadow-primary/10 border border-transparent"
            >
              <ClipboardList size={24} className="text-accent" />
              <span className="text-xs uppercase font-extrabold tracking-wider">My Orders</span>
            </button>
            
            {/* Inventory Button */}
            <button
              onClick={() => router.push("/inventory")}
              className="h-20 bg-card hover:bg-secondary/40 active:scale-95 text-foreground rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all border border-border/50 cursor-pointer shadow-sm"
            >
              <Package size={24} className="text-accent" />
              <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground">Inventory</span>
            </button>
          </div>
        </section>

        {/* Assigned Orders Feed */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ClipboardList size={14} className="text-accent" />
              <h2 className="text-xs font-black uppercase tracking-wider">Assigned Workspace</h2>
            </div>
            
            <button
              onClick={() => router.push("/employee/orders")}
              className="text-xs text-accent font-black uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
            >
              All orders <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-2">
            {assignedOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center bg-card rounded-3xl border border-border/40 p-6 shadow-sm">
                <Package size={32} className="text-muted-foreground/60 mb-2" />
                <p className="font-extrabold text-foreground mb-0.5 text-sm">
                  No orders assigned yet
                </p>
                <p className="text-xs text-muted-foreground max-w-[220px]">
                  When orders are assigned to you by the owner, they will show up here.
                </p>
              </div>
            ) : (
              assignedOrders.slice(0, 10).map((order) => (
                <button
                  key={order.id}
                  onClick={() => router.push(`/employee/orders/${order.id}`)}
                  className="w-full text-left bg-card border border-border/40 hover:border-border/80 rounded-2xl overflow-hidden shadow-sm active:scale-[0.99] transition-all flex items-center gap-3.5 p-3.5 cursor-pointer relative"
                >
                  {/* Compact Product Thumbnail with Door Fallback */}
                  <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-border/40 bg-secondary/30 relative">
                    <img
                      src={order.productImage || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop"}
                      alt={order.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2.5">
                      <span className="text-xs font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20 font-mono tracking-wide shrink-0">
                        #{order.id}
                      </span>
                      <StatusChip status={order.status} className="text-[11px] px-2.5 py-1 shrink-0" />
                    </div>

                    <h3 className="font-extrabold text-foreground text-base leading-tight break-words whitespace-normal mt-1.5">
                      {order.productName}
                    </h3>
                    
                    {/* Dimension Specifications */}
                    <div className="flex items-center gap-2 mt-2 leading-none flex-wrap">
                      <span className="text-xs font-extrabold text-accent bg-accent/5 border border-accent/15 px-1.5 py-0.5 rounded">
                        Qty: {order.quantity} pcs
                      </span>
                      {order.customerName && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                          <span className="text-xs font-bold text-muted-foreground truncate">
                            Customer: <span className="text-foreground">{order.customerName}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <ChevronRight size={16} className="text-muted-foreground/50 shrink-0 ml-1" />
                </button>
              ))
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
