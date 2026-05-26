"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { StatusChip } from "../components/ui/StatusChip";
import { useOrder } from "../hooks/useOrder";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Check, X, Calendar, Phone, User, Clock, Sparkles, Box, Info, Download } from "lucide-react";
import { toast } from "sonner";

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isOwner } = useAuth();
  const { order, isLoading, isUpdating, updateStatus } = useOrder(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-8 font-sans select-none flex flex-col animate-[fadeIn_0.2s_ease-out]">
        <header className="bg-primary text-primary-foreground px-4 py-4 sticky top-0 z-40 shadow-md">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/10 animate-pulse" />
            <div className="h-6 w-32 bg-primary-foreground/20 rounded animate-pulse" />
          </div>
        </header>
        <div className="max-w-lg mx-auto w-full px-4 py-5 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border/50 rounded-2xl h-36 animate-pulse"
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

  const canCancel = order.status === "placed";

  const timeline = [
    { status: "placed", label: "Placed", active: true },
    {
      status: "in_progress",
      label: "In Progress",
      active: ["in_progress", "done", "shipped"].includes(order.status),
    },
    {
      status: "done",
      label: "Completed",
      active: ["done", "shipped"].includes(order.status),
    },
    { status: "shipped", label: "Shipped", active: order.status === "shipped" },
  ];

  const handleCancel = async () => {
    const ok = await updateStatus({
      toStatus: "cancelled",
      changedBy: user?.id || "owner",
      note: "Cancelled by owner",
    });
    if (ok) {
      toast.success("Order cancelled successfully");
      router.back();
    } else {
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  const handleDownloadInvoice = () => {
    if (!order) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocker prevented invoice download. Please allow popups.");
      return;
    }

    const cleanCustomerName = (order.customerName || "Customer")
      .trim()
      .replace(/[^a-zA-Z0-9]/g, "_");
    const docTitle = `Invoice_${order.id}_${cleanCustomerName}`;

    const htmlContent = `
<html>
<head>
  <title>${docTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Outfit:wght@400;600;700;800;900&display=swap');
    body {
      font-family: 'Outfit', 'Inter', sans-serif;
      background-color: #ffffff;
      color: #1A1210;
      padding: 40px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #e5e7eb;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
  </style>
</head>
<body>
  <div class="invoice-container border-t-8 border-amber-800">
    <!-- Header -->
    <div class="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-amber-900">DWARIK DOOR</h1>
        <p class="text-xs uppercase font-extrabold tracking-wider text-amber-800 mt-1">Premium Bespoke Timbercraft</p>
        <p class="text-xs text-gray-500 mt-2">12, Gopinath Industrial Estate, Gujarat, India</p>
        <p class="text-xs text-gray-500">Support: contact@dwarikdoor.com | +91 99988 87766</p>
      </div>
      <div class="text-right">
        <h2 class="text-lg font-bold text-gray-800">INVOICE RECEIPT</h2>
        <p class="text-xs font-mono font-bold text-amber-800 mt-1">#${order.id}</p>
        <p class="text-xs text-gray-500 mt-1">Date: ${new Date(order.createdAt!).toLocaleDateString('en-IN')}</p>
      </div>
    </div>

    <!-- Customer & Order details grid -->
    <div class="grid grid-cols-2 gap-8 mb-8">
      <div>
        <h3 class="text-xs uppercase font-extrabold tracking-wider text-gray-400 mb-2">Customer Details</h3>
        <p class="text-sm font-bold text-gray-800">${order.customerName || 'Walk-in Customer'}</p>
        <p class="text-xs text-gray-500 mt-1">Phone: ${order.customerPhone || 'Not Provided'}</p>
      </div>
      <div>
        <h3 class="text-xs uppercase font-extrabold tracking-wider text-gray-400 mb-2">Order Information</h3>
        <p class="text-xs text-gray-500">Status: <span class="capitalize font-bold text-amber-800">${order.status}</span></p>
        <p class="text-xs text-gray-500 mt-1">Assigned Operator: <span class="capitalize font-bold">${order.assignedTo || 'Unassigned'}</span></p>
        <p class="text-xs text-gray-500 mt-1">Last Updated: ${new Date(order.updatedAt!).toLocaleDateString('en-IN')}</p>
      </div>
    </div>

    <!-- Product Table -->
    <div class="mb-8">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b-2 border-amber-950/10 bg-amber-50/50">
            <th class="py-3 px-4 text-xs uppercase font-extrabold tracking-wider text-amber-900">Product Specifications</th>
            <th class="py-3 px-4 text-xs uppercase font-extrabold tracking-wider text-amber-900 text-center">Dimensions</th>
            <th class="py-3 px-4 text-xs uppercase font-extrabold tracking-wider text-amber-900 text-center">Packaging</th>
            <th class="py-3 px-4 text-xs uppercase font-extrabold tracking-wider text-amber-900 text-right">Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-gray-100">
            <td class="py-4 px-4">
              <div class="flex items-center gap-3">
                <img src="${order.productImage || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100&h=150&fit=crop'}" class="w-12 h-16 rounded object-cover border border-gray-200" />
                <div>
                  <p class="text-xs font-mono font-bold text-amber-800">${order.productId}</p>
                  <p class="text-sm font-bold text-gray-800 mt-0.5">${order.productName}</p>
                  ${order.customization ? `<p class="text-[10px] text-gray-500 mt-1 italic">Note: ${order.customization}</p>` : ''}
                </div>
              </div>
            </td>
            <td class="py-4 px-4 text-xs text-center font-bold text-gray-700">
              ${order.freeSize ? 'Free Size' : `${order.height} × ${order.width} ${order.unit}`}
            </td>
            <td class="py-4 px-4 text-xs text-center font-bold text-gray-700 capitalize">
              ${order.packaging || 'Plastic Wrap'}
            </td>
            <td class="py-4 px-4 text-sm font-black text-right text-amber-900">
              ${order.quantity} Units
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Quality Guarantee Footer -->
    <div class="p-4 bg-amber-50/50 border border-amber-900/10 rounded-xl text-center mb-8">
      <p class="text-[10px] uppercase font-black tracking-widest text-amber-900">Dwarik Genuine Seal</p>
      <p class="text-[10px] text-amber-800/80 leading-relaxed mt-1">This document verifies the order placement for custom-seasoned hardwood timber products manufactured under strict ISO quality benchmarks. All products are warranted against structural defects.</p>
    </div>

    <!-- Thank you footer -->
    <div class="text-center text-xs text-gray-400">
      <p>Thank you for choosing Dwarik Door — Graining Elegance into Spaces.</p>
      <p class="mt-1 text-[10px]">Generated electronically on ${new Date().toLocaleDateString('en-IN')}</p>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.close();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-12 font-sans select-none animate-[fadeIn_0.2s_ease-out]">

      {/* Brand Header consistent with other pages */}
      <header className="bg-primary text-primary-foreground px-4 py-4 sticky top-0 z-40 shadow-md">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 hover:bg-primary-foreground/10 active:scale-90 rounded-full transition-all cursor-pointer text-primary-foreground"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-[9px] text-primary-foreground/60 font-extrabold uppercase tracking-widest leading-none">
                Order Tracking
              </p>
              <h1 className="text-base font-bold tracking-tight text-primary-foreground mt-0.5">Order Details</h1>
            </div>
          </div>
          <StatusChip status={order.status} className="text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Core Product Catalog Details Card */}
        <Card className="p-5 border-border/50 shadow-sm rounded-3xl relative overflow-hidden flex flex-col gap-0 bg-card">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-80" />

          <div className="flex justify-between items-center gap-4 mb-4">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-accent">Order Reference</span>
              <p className="text-sm font-mono font-bold text-foreground mt-0.5">{order.id}</p>
            </div>
            {isOwner && (
              <button
                onClick={handleDownloadInvoice}
                className="p-2 bg-accent/10 border border-accent/25 hover:bg-accent/20 active:scale-90 text-accent rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
                title="Download Invoice"
                aria-label="Download Invoice"
              >
                <Download size={18} />
              </button>
            )}
          </div>

          <div className="flex gap-4 items-center">
            {/* Elegant Image Box with Direct Door Placeholder */}
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

              {/* Size & Specs Grid layout */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2.5 pt-2 border-t border-border/30">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Box size={12} className="text-accent" />
                  <span className="font-medium text-foreground">
                    {order.freeSize ? "Free Size" : `${order.height}×${order.width} ${order.unit}`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles size={12} className="text-accent" />
                  <span className="font-medium text-foreground capitalize">
                    {order.packaging || "Plastic Wrap"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* High Density Total Quantity, Packaging and Dimension Unit Section */}
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
            <div className="mt-4 p-3.5 bg-secondary/40 border-l-2 border-accent rounded-r-2xl animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center gap-1 mb-1 text-accent">
                <Info size={11} />
                <p className="text-[9px] font-black uppercase tracking-wider">Custom Specifications</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {order.customization}
              </p>
            </div>
          )}
        </Card>

        {/* Customer contact block */}
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

        {/* Order tracking timeline */}
        <Card className="p-5 border-border/50 shadow-sm rounded-3xl flex flex-col gap-0 bg-card">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/30">
            <Clock size={14} className="text-accent" />
            <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider">Order Timeline</h3>
          </div>

          <div className="relative pl-1">
            {timeline.map((step, index) => {
              const isActive = step.active;
              const isCurrent = step.status === order.status;

              return (
                <div key={step.status} className="flex gap-4 relative pb-6 last:pb-0">
                  {/* Timeline path line */}
                  {index < timeline.length - 1 && (
                    <div
                      className={`absolute left-3.5 top-7 w-0.5 h-[calc(100%-14px)] transition-colors duration-300 ${isActive ? "bg-accent" : "bg-border"
                        }`}
                    />
                  )}

                  {/* Timeline ring */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border transition-all duration-300 ${isActive
                        ? "bg-accent border-accent text-accent-foreground shadow shadow-accent/15"
                        : "bg-secondary border-border text-muted-foreground/60"
                      }`}
                  >
                    {isActive ? (
                      <Check size={12} strokeWidth={3} className="animate-[scaleIn_0.2s_ease-out]" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>

                  {/* Step texts */}
                  <div className="flex-1 pt-0.5">
                    <p
                      className={`text-xs uppercase tracking-wider font-extrabold transition-colors duration-300 ${isActive ? "text-foreground" : "text-muted-foreground/60"
                        }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-[10px] text-accent font-medium mt-1 animate-[fadeIn_0.3s_ease-out]">
                        Updated on {new Date(order.updatedAt!).toLocaleDateString("en-IN")} at{" "}
                        {new Date(order.updatedAt!).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Administrative Log */}
        <Card className="p-4.5 border-border/50 shadow-sm rounded-3xl flex flex-col gap-0 bg-card">
          <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-border/30">
            <Info size={14} className="text-accent" />
            <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider">Administrative Log</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar size={11} className="text-muted-foreground/60" /> Placed Date
              </span>
              <span className="font-bold text-foreground">
                {new Date(order.createdAt!).toLocaleDateString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock size={11} className="text-muted-foreground/60" /> Last Modified
              </span>
              <span className="font-bold text-foreground">
                {new Date(order.updatedAt!).toLocaleDateString("en-IN")}
              </span>
            </div>
            {order.assignedTo && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <User size={11} className="text-muted-foreground/60" /> Operator Assigned
                </span>
                <span className="font-bold text-foreground capitalize">
                  {order.assignedTo}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Action Controls */}
        <div className="space-y-3">
          {isOwner && (
            <Button
              onClick={handleDownloadInvoice}
              className="w-full h-11 rounded-xl text-xs uppercase font-extrabold tracking-wider bg-accent hover:bg-accent/90 text-accent-foreground flex items-center justify-center gap-1.5 shadow-lg shadow-accent/15 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Sparkles size={14} className="animate-pulse text-[#FAF9F6]" />
              Download Invoice Receipt
            </Button>
          )}

          {canCancel && (
            <Button
              variant="destructive"
              className="w-full h-11 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all active:scale-[0.98] shadow-sm shadow-destructive/10 cursor-pointer"
              disabled={isUpdating}
              onClick={handleCancel}
            >
              <X size={15} className="mr-1.5" />
              {isUpdating ? "Processing request…" : "Request Order Cancellation"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
