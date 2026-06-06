"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components";
import { useProducts } from "../hooks/useProducts";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Search, AlertCircle, X, Plus, Layers, Sparkles, Check, ClipboardList, Info, HelpCircle, Trash2 } from "lucide-react";
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
      <span className="text-xs uppercase font-extrabold text-foreground tracking-wider">{label}</span>
      <button
        type="button"
        aria-label={`Toggle ${label}`}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-200 cursor-pointer ${on ? "bg-accent" : "bg-[#FAF9F6] border border-border"
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full shadow transition-transform duration-200 ${on ? "translate-x-7 bg-[#FAF9F6]" : "translate-x-1 bg-muted-foreground/40"
            }`}
        />
      </button>
    </div>
  );
}

// ── Single order item state ───────────────────────────────────────────────────
interface OrderItem {
  id?: string;
  product: ReturnType<typeof useProducts>["products"][0] | null;
  height: string;
  width: string;
  heightFraction: string;
  widthFraction: string;
  unit: "inch" | "mm";
  packaging: "plastic" | "carton";
  freeSize: boolean;
  quantity: string;
  customization: boolean;
  customizationText: string;
}

const emptyItem = (): OrderItem => ({
  product: null,
  height: "",
  width: "",
  heightFraction: "",
  widthFraction: "",
  unit: "inch",
  packaging: "plastic",
  freeSize: false,
  quantity: "1",
  customization: false,
  customizationText: "",
});

// ── Main screen ───────────────────────────────────────────────────────────────
export function PlaceOrderScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { products, isLoading: productsLoading } = useProducts();

  // Order type toggle
  const [isGroupOrder, setIsGroupOrder] = useState(false);

  // Customer details
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Edit draft or order logic
  const searchParams = useSearchParams();
  const editDraftId = searchParams.get("editDraftId");
  const editOrderId = searchParams.get("editOrderId");
  const editId = editDraftId || editOrderId;
  const [originalStatus, setOriginalStatus] = useState<string | null>(null);
  const [isDraftLoading, setIsDraftLoading] = useState(!!editId);
  const [initialGroupOrderIds, setInitialGroupOrderIds] = useState<string[]>([]);
  const [loadedGroupId, setLoadedGroupId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (editId && products.length > 0) {
      fetch(`/api/orders/${editId}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
            setIsDraftLoading(false);
            return;
          }
          setOriginalStatus(data.status);

          // If editing a placed or backordered order, verify it has not started
          if (editOrderId && ["in_progress", "done", "shipped", "cancelled", "rejected"].includes(data.status)) {
            toast.error("Order has already started or is completed/cancelled, and cannot be edited.");
            router.push(`/orders/${data.id}`);
            return;
          }

          setCustomerName(data.customerName || "");
          setCustomerPhone(data.customerPhone || "");
          setIsGroupOrder(data.orderType === "group");
          setLoadedGroupId(data.groupId);

          const parseDec = (val: number | undefined | null, unit: string) => {
            if (val === undefined || val === null || isNaN(val)) return { integer: "", fraction: "" };
            if (unit !== "inch") {
              return { integer: val.toString(), fraction: "" };
            }
            const integer = Math.floor(val);
            const decimal = val - integer;
            const eighths = Math.round(decimal * 8);
            return {
              integer: integer > 0 || eighths === 0 ? integer.toString() : "",
              fraction: eighths > 0 ? `${eighths}/8` : "",
            };
          };

          const mapSingleOrder = (o: any) => {
            const prod = products.find((p) => p.id === o.productId) || null;
            const heightDec = parseDec(o.height, o.unit || "inch");
            const widthDec = parseDec(o.width, o.unit || "inch");
            return {
              id: o.id,
              product: prod,
              height: heightDec.integer,
              width: widthDec.integer,
              heightFraction: heightDec.fraction,
              widthFraction: widthDec.fraction,
              unit: o.unit || "inch",
              packaging: o.packaging || "plastic",
              freeSize: o.freeSize || false,
              quantity: (o.quantity || 1).toString(),
              customization: !!o.customization,
              customizationText: o.customization || "",
            };
          };

          if (data.groupId && data.orderType === "group") {
            fetch(`/api/orders?groupId=${data.groupId}`, { credentials: "include" })
              .then((res) => res.json())
              .then((groupData) => {
                if (Array.isArray(groupData)) {
                  // Only show active (non-cancelled, non-rejected) items in the editor
                  const activeGroupData = groupData.filter(
                    (o) => !["cancelled", "rejected"].includes(o.status)
                  );
                  const items = activeGroupData.map(mapSingleOrder);
                  setGroupItems(items);
                  setGroupSearches(items.map(() => ""));
                  setInitialGroupOrderIds(activeGroupData.map((o) => o.id));
                } else {
                  const singleItemMapped = mapSingleOrder(data);
                  setGroupItems([singleItemMapped]);
                  setGroupSearches([""]);
                  setInitialGroupOrderIds([data.id]);
                }
                setIsDraftLoading(false);
              })
              .catch(() => {
                const singleItemMapped = mapSingleOrder(data);
                setGroupItems([singleItemMapped]);
                setGroupSearches([""]);
                setInitialGroupOrderIds([data.id]);
                setIsDraftLoading(false);
              });
          } else {
            const singleItemMapped = mapSingleOrder(data);
            setSingleItem(singleItemMapped);
            setInitialGroupOrderIds([]);
            setIsDraftLoading(false);
          }
        })
        .catch(() => {
          toast.error("Failed to load order data");
          setIsDraftLoading(false);
        });
    }
  }, [editId, editOrderId, products, router]);

  // Dropdown lazy loading indices
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  // Filter products by ID or Name
  const filterProducts = (term: string) => {
    if (!term) return products;
    const t = term.toLowerCase();
    return products.filter(
      (p) => p.id.toLowerCase().includes(t) || p.name.toLowerCase().includes(t),
    );
  };

  // Stock check
  const getStockError = (item: OrderItem) => {
    if (!item.product) return null;
    const available = item.product.stock - item.product.reserved;
    const qty = parseInt(item.quantity) || 0;
    if (available <= 0) return `Out of stock — no units available`;
    if (qty > available)
      return `Only ${available} unit${available !== 1 ? "s" : ""} available. Max: ${available}`;
    return null;
  };

  // Update field of specific group order item
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

  // Submit flow - placed sequentially to prevent ID conflicts
  const handleSubmit = async (e: React.FormEvent, status: "draft" | "placed" = "placed") => {
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

    // Validate all items for placed orders
    if (status !== "draft") {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const label = isGroupOrder ? `Item ${i + 1}` : "Order";
        if (!item.product) {
          toast.error(`${label}: Please select a product`);
          return;
        }
        const hasHeight = item.height || (item.unit === "inch" && item.heightFraction);
        const hasWidth = item.width || (item.unit === "inch" && item.widthFraction);
        if (!item.freeSize && (!hasHeight || !hasWidth)) {
          toast.error(`${label}: Enter dimensions or enable Free Size`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      let groupId: string | undefined;

      // Group orders: Create group first (only if we don't already have a loaded group)
      if (isGroupOrder && !loadedGroupId) {
        const grpRes = await fetch("/api/order-groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ customerName, customerPhone }),
        });
        if (grpRes.status === 401) {
          logout();
          toast.error("Session expired. Please log in again.");
          return;
        }
        if (!grpRes.ok) {
          const err = await grpRes.json();
          toast.error(err.error || "Failed to create order group");
          return;
        }
        const grp = await grpRes.json();
        groupId = grp.id;
      }

      const activeGroupId = groupId || loadedGroupId;

      // Place / Update sequentially
      for (const item of items) {
        const parseFrac = (f: string) => {
          if (!f) return 0;
          const [n, d] = f.split("/");
          return parseInt(n) / parseInt(d);
        };

        const isExisting = !!item.id;
        const url = isExisting ? `/api/orders/${item.id}` : "/api/orders";
        const method = isExisting ? "PATCH" : "POST";

        const r = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            productId: item.product?.id || "UNSELECTED",
            productName: item.product?.name || "Draft Unspecified Product",
            productImage: item.product?.customImageUrl || item.product?.image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop",
            height: item.freeSize ? 0 : (parseFloat(item.height) || 0) + (item.unit === "inch" ? parseFrac(item.heightFraction) : 0),
            width: item.freeSize ? 0 : (parseFloat(item.width) || 0) + (item.unit === "inch" ? parseFrac(item.widthFraction) : 0),
            unit: item.unit,
            packaging: item.packaging,
            freeSize: item.freeSize,
            customization: item.customization ? item.customizationText : undefined,
            quantity: parseInt(item.quantity) || 1,
            customerName,
            customerPhone,
            groupId: activeGroupId || undefined,
            orderType: isGroupOrder ? "group" : "single",
            changedBy: user?.id || "owner",
            status,
          }),
        });
        if (r.status === 401) {
          logout();
          toast.error("Session expired. Please log in again.");
          return;
        }
        const data = await r.json();
        if (!r.ok) {
          toast.error(data.error || "Failed to save order");
          return;
        }
      }

      // Handle removed items
      if (editId) {
        const remainingIds = new Set(items.map((it) => it.id).filter(Boolean));
        const deletedIds = initialGroupOrderIds.filter((id) => !remainingIds.has(id));

        for (const delId of deletedIds) {
          if (originalStatus === "draft") {
            await fetch(`/api/orders/${delId}`, {
              method: "DELETE",
              credentials: "include",
            });
          } else {
            await fetch(`/api/orders/${delId}/status`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                toStatus: "cancelled",
                changedBy: user?.id || "owner",
                note: "Removed from group order during edit",
              }),
            });
          }
        }
      }

      // Update group totalItems and customer details
      if (activeGroupId) {
        const grpUpdRes = await fetch(`/api/order-groups/${activeGroupId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            totalItems: items.length,
            customerName,
            customerPhone,
          }),
        });
        if (grpUpdRes.status === 401) {
          logout();
          toast.error("Session expired. Please log in again.");
          return;
        }
      }

      toast.success(
        editOrderId
          ? "Order changes saved successfully!"
          : isGroupOrder
            ? `Group order placed successfully — ${items.length} items`
            : "Order placed successfully!",
      );
      setTimeout(() => router.push("/orders"), 500);
    } catch {
      toast.success(
        editOrderId
          ? "Order changes saved!"
          : isGroupOrder
            ? "Group order placed!"
            : "Order placed successfully!",
      );
      setTimeout(() => router.push("/orders"), 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render order form item
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

    const isDropdownOpen = activeSearchIndex === (index !== undefined ? index : -1);
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      if (target.scrollHeight - target.scrollTop <= target.clientHeight + 25) {
        setVisibleCount((prev) => prev + 12);
      }
    };

    return (
      <div className="space-y-4">
        {/* Product Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            {index !== undefined ? `Product catalog ${index + 1}` : "Select Product"}
          </label>
          <div className="relative group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors"
              size={15}
            />
            <input
              type="text"
              placeholder={
                productsLoading
                  ? "Loading products catalogue…"
                  : "Search catalog by ID or Name"
              }
              value={search}
              onFocus={() => {
                setActiveSearchIndex(index !== undefined ? index : -1);
                setVisibleCount(12);
              }}
              onBlur={() => {
                setTimeout(() => setActiveSearchIndex(null), 250);
              }}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setVisibleCount(12);
              }}
              disabled={productsLoading}
              className="w-full h-11 pl-10 pr-10 rounded-2xl bg-[#1E1311]/5 border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 text-xs transition-all disabled:opacity-50"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange("");
                  setVisibleCount(12);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Lazy Loaded Dropdown List */}
          {isDropdownOpen && filtered.length > 0 && (
            <div
              onScroll={handleScroll}
              className="mt-2 max-h-52 overflow-y-auto rounded-2xl border border-border bg-card shadow-lg scrollbar-none animate-[fadeIn_0.2s_ease-out]"
            >
              {filtered.slice(0, visibleCount).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onItemChange({ product: p });
                    onSearchChange("");
                    setActiveSearchIndex(null);
                  }}
                  className="w-full text-left flex gap-3 items-center p-3 hover:bg-secondary/40 border-b border-border/10 last:border-b-0 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-secondary border border-border/30">
                    <img
                      src={p.customImageUrl || p.image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop"}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-foreground break-words whitespace-normal leading-snug">
                      {p.name}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">{p.id}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Product Card Preview with Custom Door Fallback */}
        {item.product && (
          <div className="p-3.5 border border-accent/15 bg-accent/5 rounded-2xl animate-[fadeIn_0.3s_ease-out]">
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-secondary border border-border/20">
                <img
                  src={item.product.customImageUrl || item.product.image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop"}
                  alt={item.product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-foreground text-xs break-words whitespace-normal">
                  {item.product.name}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {item.product.id}
                </p>

                {/* Stock status indicator */}
                <div className="mt-1.5 flex items-center">
                  <span
                    className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${stockStatus === "available"
                        ? "bg-success/15 text-success"
                        : stockStatus === "low"
                          ? "bg-warning/15 text-warning"
                          : "bg-destructive/15 text-destructive"
                      }`}
                  >
                    {stockStatus === "available"
                      ? `${available} units available`
                      : stockStatus === "low"
                        ? `Critical Low Stock (${available})`
                        : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {item.product && (
          <>
            {/* Dimensions Specifications */}
            <div className="space-y-3 p-3.5 bg-secondary/25 border border-border/40 rounded-2xl">
              <Toggle
                on={item.freeSize}
                onToggle={() => onItemChange({ freeSize: !item.freeSize })}
                label="Free Size (Standard Dimensions)"
              />

              {!item.freeSize && (
                <div className="space-y-3.5 animate-[fadeIn_0.2s_ease-out] pt-1">
                  {/* Unit Selector tab buttons */}
                  <div className="flex gap-2">
                    {(["inch", "mm"] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => onItemChange({ unit: u })}
                        className={`flex-1 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${item.unit === u
                            ? "bg-accent text-accent-foreground shadow-sm"
                            : "bg-[#1E1311]/5 text-muted-foreground hover:bg-[#1E1311]/10"
                          }`}
                      >
                        {u.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Height & Width Inputs */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Height ({item.unit})
                      </label>
                      <div className="flex gap-1.5">
                        <Input
                          type="number"
                          placeholder="Height"
                          value={item.height}
                          onChange={(e) =>
                            onItemChange({ height: e.target.value })
                          }
                          className="h-10 rounded-xl bg-secondary/35 border-border/60 focus-visible:ring-accent/20 flex-1"
                          required={!item.freeSize && !(item.unit === "inch" && item.heightFraction)}
                        />
                        {item.unit === "inch" && (
                          <select
                            value={item.heightFraction || ""}
                            onChange={(e) => onItemChange({ heightFraction: e.target.value })}
                            className="h-10 w-[72px] rounded-xl bg-secondary/35 border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 text-xs px-2 text-foreground font-medium"
                          >
                            <option value="">-</option>
                            <option value="1/8">1/8</option>
                            <option value="2/8">2/8</option>
                            <option value="3/8">3/8</option>
                            <option value="4/8">4/8</option>
                            <option value="5/8">5/8</option>
                            <option value="6/8">6/8</option>
                            <option value="7/8">7/8</option>
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Width ({item.unit})
                      </label>
                      <div className="flex gap-1.5">
                        <Input
                          type="number"
                          placeholder="Width"
                          value={item.width}
                          onChange={(e) =>
                            onItemChange({ width: e.target.value })
                          }
                          className="h-10 rounded-xl bg-secondary/35 border-border/60 focus-visible:ring-accent/20 flex-1"
                          required={!item.freeSize && !(item.unit === "inch" && item.widthFraction)}
                        />
                        {item.unit === "inch" && (
                          <select
                            value={item.widthFraction || ""}
                            onChange={(e) => onItemChange({ widthFraction: e.target.value })}
                            className="h-10 w-[72px] rounded-xl bg-secondary/35 border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 text-xs px-2 text-foreground font-medium"
                          >
                            <option value="">-</option>
                            <option value="1/8">1/8</option>
                            <option value="2/8">2/8</option>
                            <option value="3/8">3/8</option>
                            <option value="4/8">4/8</option>
                            <option value="5/8">5/8</option>
                            <option value="6/8">6/8</option>
                            <option value="7/8">7/8</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Packaging Option Selector */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Packaging Option
              </label>
              <div className="flex gap-2">
                {(["plastic", "carton"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onItemChange({ packaging: p })}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${item.packaging === p
                        ? "bg-accent text-accent-foreground shadow-sm scale-[1.01]"
                        : "bg-[#1E1311]/5 text-muted-foreground hover:bg-[#1E1311]/10"
                      }`}
                  >
                    {p === "carton" ? "Carton" : "Plastic"}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Total Quantity
                {available > 0 && (
                  <span className="ml-1 text-[9px] font-normal text-muted-foreground/60">
                    (Stock Cap: {available})
                  </span>
                )}
              </label>
              <Input
                type="number"
                min="1"
                max={available > 0 ? available : undefined}
                placeholder="Enter quantity"
                value={item.quantity}
                onChange={(e) => onItemChange({ quantity: e.target.value })}
                className={`h-10 rounded-xl bg-secondary/35 border-border/60 focus-visible:ring-accent/20 ${stockError ? "border-destructive focus-visible:border-destructive" : ""}`}
                required
              />
              {stockError && (
                <div className="flex items-start gap-2 p-3.5 bg-destructive/5 border border-destructive/20 rounded-2xl animate-[fadeIn_0.2s_ease-out]">
                  <AlertCircle
                    className="text-destructive shrink-0 mt-0.5"
                    size={14}
                  />
                  <p className="text-xs text-destructive font-medium">
                    {stockError}
                  </p>
                </div>
              )}
            </div>

            {/* Custom Notes */}
            <div className="space-y-2 p-3.5 bg-secondary/25 border border-border/40 rounded-2xl">
              <Toggle
                on={item.customization}
                onToggle={() =>
                  onItemChange({ customization: !item.customization })
                }
                label="Custom Specifications"
              />
              {item.customization && (
                <textarea
                  placeholder="Enter customization notes (wood carvings, specific glass options, polish types)…"
                  value={item.customizationText}
                  onChange={(e) =>
                    onItemChange({ customizationText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/35 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/15 resize-none text-xs leading-relaxed animate-[fadeIn_0.2s_ease-out]"
                  rows={3}
                />
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-12 font-sans select-none animate-[fadeIn_0.25s_ease-out]">

      {/* Brand Header consistent with other pages */}
      <header className="bg-[#4E342E] dark:bg-[#2A1510] border-b border-[#DAB668]/40 text-white px-4 py-4 sticky top-0 z-40 shadow-[0_4px_25px_rgba(78,52,46,0.25)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/10 hover:bg-white/15 text-white rounded-xl active:scale-90 transition-all cursor-pointer border border-white/15 shadow-sm"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[10px] text-neutral-400/80 font-extrabold uppercase tracking-widest leading-none">
              {originalStatus === "placed" || originalStatus === "backordered" ? "Order Editor" : "Customer Portal"}
            </p>
            <h1 className="text-lg font-black tracking-tight text-white mt-0.5">
              {originalStatus === "placed" || originalStatus === "backordered" ? "Edit Order" : "Place Order"}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Order type Toggle card */}
          <Card className="p-4 border-border/50 shadow-sm rounded-3xl flex flex-col gap-0 bg-card relative overflow-hidden">
            <Toggle
              on={isGroupOrder}
              onToggle={() => {
                const nextVal = !isGroupOrder;
                setIsGroupOrder(nextVal);
                if (nextVal) {
                  // Transitioning from single to group order: copy single item to first group item
                  setGroupItems([singleItem]);
                  setGroupSearches([singleSearch]);
                } else {
                  // Transitioning from group to single order: copy first group item to single item
                  if (groupItems.length > 0) {
                    setSingleItem(groupItems[0]);
                    setSingleSearch(groupSearches[0] || "");
                  }
                }
              }}
              label="Group Order Workflow"
            />
            <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
              {isGroupOrder
                ? "Process multiple door catalog items under one customer reference, grouped together."
                : "Standard single door catalog item order for one customer."}
            </p>
          </Card>

          {/* Customer Details Form block */}
          <Card className="p-5 border-border/50 shadow-sm rounded-3xl flex flex-col gap-3.5 bg-card">
            <div className="flex items-center gap-2 pb-1.5 border-b border-border/30 text-accent">
              <ClipboardList size={14} />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                Customer Specifications
              </h3>
            </div>

            {/* Customer Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Customer Name
              </label>
              <Input
                placeholder="Enter customer's full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-10 rounded-xl bg-[#1E1311]/5 border-border/60 focus-visible:ring-accent/20 text-xs"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Customer Phone <span className="text-muted-foreground/60 font-normal">(10 Digits)</span>
              </label>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="Enter 10-digit number"
                value={customerPhone}
                maxLength={10}
                onChange={(e) =>
                  setCustomerPhone(
                    e.target.value.replace(/\D/g, "").slice(0, 10),
                  )
                }
                className={`h-10 rounded-xl bg-[#1E1311]/5 border-border/60 focus-visible:ring-accent/20 text-xs ${phoneError ? "border-destructive focus-visible:border-destructive" : ""}`}
                required
              />
              {phoneError && (
                <p className="text-[10px] text-destructive flex items-center gap-1 font-bold mt-1">
                  <AlertCircle size={11} /> {phoneError}
                </p>
              )}
            </div>
          </Card>

          {/* Render single item flow */}
          {!isGroupOrder && (
            <Card className="p-5 border-border/50 shadow-sm rounded-3xl flex flex-col gap-0 bg-card">
              {renderItem(singleItem, singleSearch, setSingleSearch, (patch) =>
                setSingleItem((prev) => ({ ...prev, ...patch })),
              )}
            </Card>
          )}

          {/* Group order items block */}
          {isGroupOrder && (
            <section className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Layers size={14} className="text-accent" />
                  Order Group Items ({groupItems.length})
                </h3>
              </div>

              {groupItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-card border border-border/50 rounded-3xl p-5 space-y-4 shadow-sm relative overflow-hidden animate-[slideUp_0.2s_ease-out]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border/30">
                    <span className="text-[10px] font-extrabold text-accent uppercase tracking-wide">
                      Door Item {index + 1}
                    </span>
                    {groupItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGroupItem(index)}
                        className="p-1 hover:bg-destructive/10 text-destructive rounded-lg transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <X size={15} />
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
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-accent/40 text-accent text-xs font-bold uppercase tracking-wider hover:bg-accent/5 active:scale-[0.99] transition-all cursor-pointer"
              >
                <Plus size={15} />
                Add Another Product
              </button>
            </section>
          )}

          {/* Submit Action Block */}
          <div className="flex flex-col gap-2 pt-4 border-t border-border/30">
            <div className="flex gap-2">
              {originalStatus === "placed" || originalStatus === "backordered" ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 rounded-xl text-xs uppercase tracking-wider font-extrabold cursor-pointer"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 rounded-xl text-xs uppercase tracking-wider font-extrabold cursor-pointer bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/15"
                    disabled={isSubmitting || !!phoneError}
                    onClick={(e) => handleSubmit(e, originalStatus as any)}
                  >
                    {isSubmitting ? "Saving…" : "Save Changes"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 rounded-xl text-xs uppercase tracking-wider font-extrabold cursor-pointer"
                    onClick={(e) => handleSubmit(e, "draft")}
                    disabled={isSubmitting || !!phoneError}
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 rounded-xl text-xs uppercase tracking-wider font-extrabold cursor-pointer bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/15"
                    disabled={isSubmitting || !!phoneError}
                    onClick={(e) => handleSubmit(e, "placed")}
                  >
                    {isSubmitting
                      ? "Processing…"
                      : isGroupOrder
                        ? `Place Group (${groupItems.length})`
                        : "Place Order"}
                  </Button>
                </>
              )}
            </div>
            {editDraftId && originalStatus === "draft" && (
              <Button
                type="button"
                variant="destructive"
                className="w-full h-11 rounded-xl text-xs uppercase tracking-wider font-extrabold cursor-pointer mt-2"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 size={16} className="mr-2" />
                Delete Draft
              </Button>
            )}
          </div>
        </form>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border/50 p-6 rounded-3xl shadow-xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Trash2 className="text-destructive" size={24} />
              Delete Draft
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Are you sure you want to delete this draft? This action cannot be undone and all saved data will be lost.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-xl h-10 font-bold"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl h-10 font-bold bg-destructive/90 hover:bg-destructive"
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  const r = await fetch(`/api/orders/${editDraftId}`, { method: "DELETE" });
                  if (r.ok) {
                    toast.success("Draft deleted");
                    router.push("/orders");
                  } else {
                    toast.error("Failed to delete draft");
                  }
                } catch (err) {
                  toast.error("An error occurred");
                } finally {
                  setIsSubmitting(false);
                  setIsDeleteDialogOpen(false);
                }
              }}
            >
              {isSubmitting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
