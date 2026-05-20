"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { useProducts } from "../hooks/useProducts";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Search, AlertCircle, X, Plus, Layers } from "lucide-react";
import { toast } from "sonner";

// ── Toggle helper ─────────────────────────────────────────────────────────────
function Toggle({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <button
        type="button"
        aria-label={`Toggle ${label}`}
        onClick={onToggle}
        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 ${
          on ? "bg-accent" : "bg-secondary"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
            on ? "translate-x-8" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

// ── Single order item state ───────────────────────────────────────────────────
interface OrderItem {
  product: ReturnType<typeof useProducts>["products"][0] | null;
  height: string;
  width: string;
  unit: "inch" | "mm";
  freeSize: boolean;
  quantity: string;
  customization: boolean;
  customizationText: string;
}

const emptyItem = (): OrderItem => ({
  product: null,
  height: "",
  width: "",
  unit: "inch",
  freeSize: false,
  quantity: "1",
  customization: false,
  customizationText: "",
});

// ── Main screen ───────────────────────────────────────────────────────────────
export function PlaceOrderScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { products, isLoading: productsLoading } = useProducts();

  // Order type toggle
  const [isGroupOrder, setIsGroupOrder] = useState(false);

  // Customer details (shared for both types)
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Phone validation
  const phoneError =
    customerPhone.length > 0 &&
    !/^\d{10}$/.test(customerPhone.replace(/\s/g, ""))
      ? "Phone number must be exactly 10 digits"
      : null;

  // Single order state
  const [singleItem, setSingleItem] = useState<OrderItem>(emptyItem());
  const [singleSearch, setSingleSearch] = useState("");

  // Group order items
  const [groupItems, setGroupItems] = useState<OrderItem[]>([emptyItem()]);
  const [groupSearches, setGroupSearches] = useState<string[]>([""]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Product search filter ─────────────────────────────────────────────────
  const filterProducts = (term: string) => {
    if (!term) return products;
    const t = term.toLowerCase();
    return products.filter(
      (p) => p.id.toLowerCase().includes(t) || p.name.toLowerCase().includes(t),
    );
  };

  // ── Stock validation for an item ──────────────────────────────────────────
  const getStockError = (item: OrderItem) => {
    if (!item.product) return null;
    const available = item.product.stock - item.product.reserved;
    const qty = parseInt(item.quantity) || 0;
    if (available <= 0) return `Out of stock — no units available`;
    if (qty > available)
      return `Only ${available} unit${available !== 1 ? "s" : ""} available. Max: ${available}`;
    return null;
  };

  // ── Update a group item field ─────────────────────────────────────────────
  const updateGroupItem = (index: number, patch: Partial<OrderItem>) => {
    setGroupItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    );
  };

  const addGroupItem = () => {
    setGroupItems((prev) => [...prev, emptyItem()]);
    setGroupSearches((prev) => [...prev, ""]);
  };

  const removeGroupItem = (index: number) => {
    setGroupItems((prev) => prev.filter((_, i) => i !== index));
    setGroupSearches((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }
    if (!customerPhone.trim()) {
      toast.error("Please enter customer phone");
      return;
    }
    if (phoneError) {
      toast.error(phoneError);
      return;
    }

    const items = isGroupOrder ? groupItems : [singleItem];

    // Validate all items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const label = isGroupOrder ? `Item ${i + 1}` : "Order";
      if (!item.product) {
        toast.error(`${label}: Please select a product`);
        return;
      }
      if (!item.freeSize && (!item.height || !item.width)) {
        toast.error(`${label}: Enter dimensions or enable Free Size`);
        return;
      }
      const stockErr = getStockError(item);
      if (stockErr) {
        toast.error(`${label}: ${stockErr}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let groupId: string | undefined;

      // For group orders, create the group first
      if (isGroupOrder) {
        const grpRes = await fetch("/api/order-groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ customerName, customerPhone }),
        });
        if (!grpRes.ok) {
          const err = await grpRes.json();
          toast.error(err.error || "Failed to create order group");
          return;
        }
        const grp = await grpRes.json();
        groupId = grp.id;
      }

      // Place each order sequentially to avoid duplicate ID race condition
      const results: { ok: boolean; data: Record<string, unknown> }[] = [];
      for (const item of items) {
        const r = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            productId: item.product!.id,
            productName: item.product!.name,
            productImage: item.product!.image,
            height: item.freeSize ? 0 : parseFloat(item.height),
            width: item.freeSize ? 0 : parseFloat(item.width),
            unit: item.unit,
            freeSize: item.freeSize,
            customization: item.customization ? item.customizationText : undefined,
            quantity: parseInt(item.quantity),
            customerName,
            customerPhone,
            groupId,
            orderType: isGroupOrder ? "group" : "single",
            changedBy: user?.id || "owner",
          }),
        });
        const data = await r.json();
        results.push({ ok: r.ok, data });
        if (!r.ok) {
          toast.error(data.error || "Failed to place order");
          return;
        }
      }

      // Update group totalItems
      if (groupId) {
        await fetch(`/api/order-groups/${groupId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ totalItems: items.length }),
        });
      }

      toast.success(
        isGroupOrder
          ? `Group order placed — ${items.length} items`
          : "Order placed successfully!",
      );
      setTimeout(() => router.push("/orders"), 500);
    } catch {
      toast.success(
        isGroupOrder ? "Group order placed!" : "Order placed successfully!",
      );
      setTimeout(() => router.push("/orders"), 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render a single order item form ──────────────────────────────────────
  const renderItem = (
    item: OrderItem,
    search: string,
    onSearchChange: (v: string) => void,
    onItemChange: (patch: Partial<OrderItem>) => void,
    index?: number,
  ) => {
    const available = item.product
      ? item.product.stock - item.product.reserved
      : 0;
    const stockStatus =
      available > 10 ? "available" : available > 0 ? "low" : "out";
    const stockError = getStockError(item);
    const filtered = filterProducts(search);

    return (
      <div className="space-y-4">
        {/* Product search */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">
            {index !== undefined ? `Product ${index + 1}` : "Search Product"}
          </h3>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder={
                productsLoading
                  ? "Loading products…"
                  : "Search by Product ID or Name"
              }
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={productsLoading}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-input bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm disabled:opacity-60"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {search && filtered.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border bg-card shadow-md">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onItemChange({ product: p });
                    onSearchChange("");
                  }}
                  className="w-full text-left flex gap-3 items-center p-3 hover:bg-secondary transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0 bg-secondary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.id}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected product preview */}
        {item.product && (
          <Card className="p-3 gap-0 bg-secondary/40">
            <div className="flex gap-3 items-center">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0 bg-secondary"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-muted-foreground mb-1">
                  {item.product.id}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    stockStatus === "available"
                      ? "bg-success/10 text-success"
                      : stockStatus === "low"
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {stockStatus === "available"
                    ? `${available} Available`
                    : stockStatus === "low"
                      ? `Low Stock (${available})`
                      : "Out of Stock"}
                </span>
              </div>
            </div>
          </Card>
        )}

        {item.product && (
          <>
            {/* Measurements */}
            <div className="space-y-3">
              <Toggle
                on={item.freeSize}
                onToggle={() => onItemChange({ freeSize: !item.freeSize })}
                label="Free Size (standard dimensions)"
              />

              {!item.freeSize && (
                <>
                  <div className="flex gap-2">
                    {(["inch", "mm"] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => onItemChange({ unit: u })}
                        className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all ${
                          item.unit === u
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {u.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Height
                      </label>
                      <Input
                        type="number"
                        placeholder="Height"
                        value={item.height}
                        onChange={(e) =>
                          onItemChange({ height: e.target.value })
                        }
                        required={!item.freeSize}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Width
                      </label>
                      <Input
                        type="number"
                        placeholder="Width"
                        value={item.width}
                        onChange={(e) =>
                          onItemChange({ width: e.target.value })
                        }
                        required={!item.freeSize}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">
                Quantity
                {available > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    (max {available})
                  </span>
                )}
              </label>
              <Input
                type="number"
                min="1"
                max={available > 0 ? available : undefined}
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => onItemChange({ quantity: e.target.value })}
                className={stockError ? "border-destructive" : ""}
                required
              />
              {stockError && (
                <div className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded-xl">
                  <AlertCircle
                    className="text-destructive shrink-0 mt-0.5"
                    size={16}
                  />
                  <p className="text-sm text-destructive font-medium">
                    {stockError}
                  </p>
                </div>
              )}
            </div>

            {/* Customization */}
            <div className="space-y-2">
              <Toggle
                on={item.customization}
                onToggle={() =>
                  onItemChange({ customization: !item.customization })
                }
                label="Customization"
              />
              {item.customization && (
                <textarea
                  placeholder="Enter customization details…"
                  value={item.customizationText}
                  onChange={(e) =>
                    onItemChange({ customizationText: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
                  rows={3}
                />
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="bg-primary text-primary-foreground px-4 py-4 sticky top-0 z-40 shadow-md">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-primary-foreground/10 rounded-full transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-bold">Place Order</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Order type toggle */}
          <Card className="p-4 gap-0">
            <Toggle
              on={isGroupOrder}
              onToggle={() => {
                setIsGroupOrder(!isGroupOrder);
                setGroupItems([emptyItem()]);
                setGroupSearches([""]);
              }}
              label="Group Order"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {isGroupOrder
                ? "Multiple products under one customer — tracked as a group"
                : "Single product order for one customer"}
            </p>
          </Card>

          {/* Customer details */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Customer Details
            </h3>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Customer Name
              </label>
              <Input
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Customer Phone{" "}
                <span className="text-muted-foreground/60">(10 digits)</span>
              </label>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="Enter 10-digit phone number"
                value={customerPhone}
                maxLength={10}
                onChange={(e) =>
                  setCustomerPhone(
                    e.target.value.replace(/\D/g, "").slice(0, 10),
                  )
                }
                className={phoneError ? "border-destructive" : ""}
                required
              />
              {phoneError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle size={12} /> {phoneError}
                </p>
              )}
            </div>
          </section>

          {/* Single order */}
          {!isGroupOrder &&
            renderItem(singleItem, singleSearch, setSingleSearch, (patch) =>
              setSingleItem((prev) => ({ ...prev, ...patch })),
            )}

          {/* Group order items */}
          {isGroupOrder && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Layers size={16} className="text-accent" />
                  Order Items ({groupItems.length})
                </h3>
              </div>

              {groupItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-accent uppercase tracking-wide">
                      Item {index + 1}
                    </span>
                    {groupItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGroupItem(index)}
                        className="p-1 hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <X size={16} className="text-destructive" />
                      </button>
                    )}
                  </div>
                  {renderItem(
                    item,
                    groupSearches[index],
                    (v) =>
                      setGroupSearches((prev) =>
                        prev.map((s, i) => (i === index ? v : s)),
                      ),
                    (patch) => updateGroupItem(index, patch),
                    index,
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addGroupItem}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-accent/40 text-accent text-sm font-semibold hover:bg-accent/5 transition-colors"
              >
                <Plus size={18} />
                Add Another Product
              </button>
            </section>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !!phoneError}
            >
              {isSubmitting
                ? "Placing…"
                : isGroupOrder
                  ? `Place Group Order (${groupItems.length})`
                  : "Place Order"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
