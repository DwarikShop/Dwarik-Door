"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { StatusChip } from "../components/ui/StatusChip";
import { useOrder } from "../hooks/useOrder";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Play, Check, Truck, X, Calendar, Phone, User, Clock, Sparkles, Box, Info } from "lucide-react";
import { toast } from "sonner";

export function EmployeeOrderWorkflow() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { order, isLoading, isUpdating, updateStatus } = useOrder(id);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState<"damaged" | "other">(
    "damaged",
  );
  const [rejectComment, setRejectComment] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-8 font-sans select-none flex flex-col animate-[fadeIn_0.2s_ease-out]">
        <header className="bg-[#4E342E] dark:bg-[#2A1510] border-b border-[#DAB668]/40 text-white px-4 py-4 sticky top-0 z-40 shadow-[0_4px_25px_rgba(78,52,46,0.25)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 animate-pulse border border-white/15" />
            <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
          </div>
        </header>
        <div className="max-w-lg mx-auto w-full px-4 py-5 space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-card border border-border/50 rounded-2xl h-40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] flex items-center justify-center font-sans p-6">
        <div className="text-center space-y-4 max-w-sm bg-card p-8 rounded-3xl border border-border/50 shadow-sm">
          <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto text-destructive">
            <X size={28} />
          </div>
          <h2 className="font-extrabold text-foreground text-sm uppercase tracking-wider">Order Not Found</h2>
          <p className="text-xs text-muted-foreground">The order reference ID is invalid or has been archived.</p>
          <Button onClick={() => router.back()} className="w-full h-10 rounded-xl font-bold bg-primary text-primary-foreground">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const changedBy = user?.id || "employee";

  const handleStartWork = async () => {
    const ok = await updateStatus({ toStatus: "in_progress", changedBy });
    if (ok) {
      toast.success("Order moved to In Progress");
      router.back();
    } else toast.error("Failed to update order");
  };

  const handleMarkDone = async () => {
    const ok = await updateStatus({ toStatus: "done", changedBy });
    if (ok) {
      toast.success("Order marked as Done");
      router.back();
    } else toast.error("Failed to update order");
  };

  const handleShip = async () => {
    const ok = await updateStatus({ toStatus: "shipped", changedBy });
    if (ok) {
      toast.success("Order marked as Shipped");
      router.back();
    } else toast.error("Failed to update order");
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    const ok = await updateStatus({
      toStatus: "rejected",
      changedBy,
      note: rejectComment,
      rejectReason,
    });
    if (ok) {
      if (rejectReason === "damaged") toast.info("Inventory marked as damaged");
      else toast.info("Stock returned to inventory");
      toast.success("Order rejected");
      setShowRejectModal(false);
      router.back();
    } else {
      toast.error("Failed to reject order");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-12 font-sans select-none animate-[fadeIn_0.2s_ease-out]">
      
      {/* Brand Header consistent with other pages */}
      <header className="bg-[#4E342E] dark:bg-[#2A1510] border-b border-[#DAB668]/40 text-white px-4 py-4 sticky top-0 z-40 shadow-[0_4px_25px_rgba(78,52,46,0.25)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white/10 hover:bg-white/15 text-white rounded-xl active:scale-90 transition-all cursor-pointer border border-white/15 shadow-sm"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <p className="text-[10px] text-neutral-400/80 font-extrabold uppercase tracking-widest leading-none">
                Operator Workspace
              </p>
              <h1 className="text-lg font-black tracking-tight text-white mt-0.5">Order Workflow</h1>
            </div>
          </div>
          <StatusChip status={order.status} className="text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-4">
        
        {/* Core Product Summary Receipt Card */}
        <Card className="p-5 border-border/50 shadow-sm rounded-3xl relative overflow-hidden flex flex-col gap-0 bg-card">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-80" />
          
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-accent">Order Reference</span>
              <p className="text-sm font-mono font-bold text-foreground mt-0.5">{order.id}</p>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {/* Elegant Product Thumbnail with mock wooden door placeholder fallback */}
            <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden border border-border/40 bg-secondary/30 relative">
              <img
                src={order.productImage || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop"}
                alt={order.productName}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <span className="text-[8px] uppercase tracking-wider font-black text-accent/80 block leading-none mb-1">
                {order.productId}
              </span>
              <h3 className="font-extrabold text-foreground text-sm leading-snug line-clamp-2">
                {order.productName}
              </h3>
              
              {/* Dimensions specs list */}
              <div className="grid grid-cols-1 gap-1.5 mt-2.5 pt-2 border-t border-border/30">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Box size={12} className="text-accent" />
                  <span className="font-medium text-foreground">
                    Size: {order.freeSize ? "Free Size" : `${order.height} × ${order.width} ${order.unit}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* High Density Triple Specs grid (Quantity, Packaging, Dim Unit) */}
          <div className="mt-5 pt-3.5 border-t border-border/35 grid grid-cols-3 gap-2.5">
            <div className="bg-success/5 border border-success/10 rounded-2xl p-2 text-center flex flex-col justify-center min-w-0">
              <span className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider block truncate">Quantity</span>
              <p className="text-sm font-black text-success mt-0.5 truncate">{order.quantity} units</p>
            </div>
            <div className="bg-info/5 border border-info/10 rounded-2xl p-2 text-center flex flex-col justify-center min-w-0">
              <span className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider block truncate">Packaging</span>
              <p className="text-sm font-black text-info mt-0.5 capitalize truncate">{order.packaging || "plastic"}</p>
            </div>
            <div className="bg-accent/5 border border-accent/10 rounded-2xl p-2 text-center flex flex-col justify-center min-w-0">
              <span className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider block truncate">Dim Unit</span>
              <p className="text-sm font-black text-accent mt-0.5 capitalize truncate">{order.unit || "inches"}</p>
            </div>
          </div>

          {order.customization && (
            <div className="mt-4 p-3.5 bg-warning/5 border border-warning/15 border-l-2 border-l-warning rounded-r-2xl animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center gap-1 mb-1 text-warning">
                <Info size={11} className="animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-wider">⚠️ Customization Required</p>
              </div>
              <p className="text-xs text-foreground leading-relaxed">
                {order.customization}
              </p>
            </div>
          )}
        </Card>

        {/* Customer contact block with Click-to-Call trigger */}
        <Card className="p-4.5 border-border/50 shadow-sm rounded-3xl flex flex-col gap-0 bg-card">
          <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-border/30">
            <User size={14} className="text-accent" />
            <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider">Customer Details</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User size={11} className="text-muted-foreground/60" /> Customer Name
              </span>
              <span className="font-bold text-foreground">
                {order.customerName || "Walk-in Customer"}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Phone size={11} className="text-muted-foreground/60" /> Phone number
              </span>
              {order.customerPhone ? (
                <a
                  href={`tel:${order.customerPhone}`}
                  className="font-bold text-accent font-mono hover:underline cursor-pointer active:scale-95 transition-transform"
                >
                  {order.customerPhone}
                </a>
              ) : (
                <span className="font-bold text-muted-foreground/60 font-mono">
                  Not Provided
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Action Controls Section */}
        <Card className="p-5 border-border/50 shadow-sm rounded-3xl flex flex-col gap-0 bg-card">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/30">
            <Sparkles size={14} className="text-accent" />
            <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider">Production Controls</h3>
          </div>

          <div className="space-y-3">
            {(order.status === "placed" || order.status === "backordered") && (
              <>
                {order.status === "backordered" && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mb-3 text-center animate-[fadeIn_0.3s_ease-out]">
                    <p className="text-xs font-black text-destructive uppercase tracking-wider mb-1">
                      Inventory Shortage
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      Waiting For Inventory
                    </p>
                    {order.shortageQuantity! > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Need {order.shortageQuantity} More Units
                      </p>
                    )}
                  </div>
                )}
                <Button
                  className="w-full h-11 rounded-xl text-xs uppercase font-extrabold tracking-wider bg-accent hover:bg-accent/90 text-accent-foreground flex items-center justify-center gap-1.5 shadow-lg shadow-accent/15 cursor-pointer"
                  disabled={isUpdating || order.status === "backordered"}
                  onClick={handleStartWork}
                >
                  <Play size={14} />
                  {isUpdating ? "Initializing Workspace…" : "Start Production"}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl text-xs uppercase font-extrabold tracking-wider border-destructive/30 hover:border-destructive hover:bg-destructive/5 text-destructive flex items-center justify-center gap-1.5 cursor-pointer"
                  disabled={isUpdating}
                  onClick={() => setShowRejectModal(true)}
                >
                  <X size={14} />
                  Reject Order / Return Stock
                </Button>
              </>
            )}

            {order.status === "in_progress" && (
              <>
                <Button
                  className="w-full h-11 rounded-xl text-xs uppercase font-extrabold tracking-wider bg-success hover:bg-success/90 text-success-foreground flex items-center justify-center gap-1.5 shadow-lg shadow-success/15 cursor-pointer"
                  disabled={isUpdating}
                  onClick={handleMarkDone}
                >
                  <Check size={14} />
                  {isUpdating ? "Completing Job…" : "Mark as Completed"}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl text-xs uppercase font-extrabold tracking-wider border-destructive/30 hover:border-destructive hover:bg-destructive/5 text-destructive flex items-center justify-center gap-1.5 cursor-pointer"
                  disabled={isUpdating}
                  onClick={() => setShowRejectModal(true)}
                >
                  <X size={14} />
                  Reject & Mark Damaged
                </Button>
              </>
            )}

            {order.status === "done" && (
              <Button
                className="w-full h-11 rounded-xl text-xs uppercase font-extrabold tracking-wider bg-accent hover:bg-accent/90 text-accent-foreground flex items-center justify-center gap-1.5 shadow-lg shadow-accent/15 cursor-pointer"
                disabled={isUpdating}
                onClick={handleShip}
              >
                <Truck size={14} />
                {isUpdating ? "Processing Shipment…" : "Mark as Shipped"}
              </Button>
            )}

            {order.status === "shipped" && (
              <div className="flex flex-col items-center py-6 text-center bg-secondary/35 rounded-2xl p-4">
                <div className="w-12 h-12 bg-success/15 text-success rounded-xl flex items-center justify-center mb-2">
                  <Check strokeWidth={3} size={22} />
                </div>
                <p className="font-extrabold text-foreground text-xs uppercase tracking-wider">
                  Shipment Dispatched
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
                  This door order has been manufactured and shipped to the customer.
                </p>
              </div>
            )}
          </div>
        </Card>
      </main>

      {/* Reject Modal Sheet */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-card rounded-3xl p-6 w-full max-w-md shadow-2xl border border-border/60 animate-[slideUp_0.3s_ease-out]">
            <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/30">
              Reject Order Job
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Rejection Type
                </label>
                <div className="space-y-2">
                  {(["damaged", "other"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRejectReason(r)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-left border-2 cursor-pointer ${
                        rejectReason === r
                          ? "bg-destructive/5 border-destructive text-destructive"
                          : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/70"
                      }`}
                    >
                      {r === "damaged" ? "⚠️ Damaged Inventory" : "ℹ️ Return to available stock"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Justification Comment <span className="text-destructive font-black">*</span>
                </label>
                <textarea
                  placeholder="Provide explicit reasons for returning stock or marking it as damaged…"
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/35 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/15 resize-none text-xs leading-relaxed"
                  rows={3}
                />
              </div>

              <div className="p-3 bg-secondary/65 border border-border/30 rounded-2xl">
                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold">
                  {rejectReason === "damaged"
                    ? "⚠️ Warning: Door items will be recorded under low-stock alerts / damaged logs."
                    : "ℹ️ Note: Ordered doors will be returned back to the catalog's available inventory."}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="h-10 rounded-xl flex-1 text-xs uppercase font-extrabold tracking-wider cursor-pointer"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="h-10 rounded-xl flex-1 text-xs uppercase font-extrabold tracking-wider cursor-pointer shadow-sm shadow-destructive/10"
                  disabled={isUpdating}
                  onClick={handleReject}
                >
                  {isUpdating ? "Rejecting…" : "Confirm Reject"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
