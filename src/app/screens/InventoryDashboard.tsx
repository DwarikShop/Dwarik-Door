"use client";

import { useState, useEffect, useRef } from "react";
import { BottomNav } from "../components/BottomNav";
import { useProducts } from "../hooks/useProducts";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import type { TProduct } from "../models/types";
import {
  Search,
  Package,
  AlertTriangle,
  TrendingDown,
  Layers,
  ChevronRight,
  Plus,
  X,
  Edit2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FilterType = "all" | "low" | "out" | "damaged";

const EMPTY_FORM = {
  id: "",
  name: "",
  category: "",
  image: "",
  price: "",
  stock: "",
  damaged: "0",
};
type FormState = typeof EMPTY_FORM;

// ── ProductModal — at MODULE level to prevent remount on every render ─────────

interface ProductModalProps {
  title: string;
  form: FormState;
  idReadOnly?: boolean; // true = show ID as read-only (not used here, kept for clarity)
  idError: string; // duplicate ID error message
  isSubmitting: boolean;
  onChange: (field: keyof FormState, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onDelete?: () => void;
}

function ProductModal({
  title,
  form,
  idError,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
  onDelete,
}: ProductModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-5 w-full max-w-md shadow-xl border border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {/* Product ID — editable, validated for uniqueness */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Product ID *{" "}
              <span className="font-normal text-muted-foreground/60">
                (e.g. DW-009)
              </span>
            </label>
            <Input
              placeholder="DW-009"
              value={form.id}
              onChange={(e) => onChange("id", e.target.value.toUpperCase())}
              className={
                idError
                  ? "border-destructive focus-visible:border-destructive"
                  : ""
              }
              required
            />
            {idError && <p className="text-xs text-destructive">{idError}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Product Name *
            </label>
            <Input
              placeholder="e.g. Premium Teak Veneer Door"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Category *
            </label>
            <Input
              placeholder="e.g. Flush Doors"
              value={form.category}
              onChange={(e) => onChange("category", e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Image URL
            </label>
            <Input
              placeholder="https://images.unsplash.com/..."
              value={form.image}
              onChange={(e) => onChange("image", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Price (₹) *
              </label>
              <Input
                type="number"
                min="0"
                placeholder="12500"
                value={form.price}
                onChange={(e) => onChange("price", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Stock (units)
              </label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.stock}
                onChange={(e) => onChange("stock", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Damaged units
            </label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={form.damaged}
              onChange={(e) => onChange("damaged", e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                disabled={isSubmitting}
                onClick={onDelete}
              >
                {isSubmitting ? "…" : "Delete"}
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !!idError}
            >
              {isSubmitting ? "Saving…" : title}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── InventoryDashboard ────────────────────────────────────────────────────────

export function InventoryDashboard() {
  const { isOwner } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<TProduct | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [idError, setIdError] = useState("");

  const {
    products,
    isLoading,
    isSubmitting,
    addProduct,
    updateProduct,
    deleteProduct,
    checkIdExists,
  } = useProducts();

  // ── Real-time ID duplicate check (debounced 400ms) ────────────────────────
  const idCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!form.id) {
      setIdError("");
      return;
    }

    if (idCheckTimer.current) clearTimeout(idCheckTimer.current);
    idCheckTimer.current = setTimeout(async () => {
      // When editing, exclude the product's original ID from the check
      const excludeId = editTarget?.id;
      // If ID hasn't changed in edit mode, no need to check
      if (editTarget && form.id === editTarget.id) {
        setIdError("");
        return;
      }
      const exists = await checkIdExists(form.id, excludeId);
      setIdError(exists ? `ID "${form.id}" is already in use` : "");
    }, 400);

    return () => {
      if (idCheckTimer.current) clearTimeout(idCheckTimer.current);
    };
  }, [form.id, editTarget, checkIdExists]);

  // ── Form field change ─────────────────────────────────────────────────────
  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Open / close modals ───────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setIdError("");
    setShowAddModal(true);
  };

  const openEdit = (p: TProduct) => {
    setEditTarget(p);
    setIdError("");
    setForm({
      id: p.id,
      name: p.name,
      category: p.category,
      image: p.image ?? "",
      price: String(p.price),
      stock: String(p.stock),
      damaged: String(p.damaged),
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditTarget(null);
    setIdError("");
  };

  // ── Submit: Add ───────────────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idError) {
      toast.error(idError);
      return;
    }
    if (!form.id) {
      toast.error("Product ID is required");
      return;
    }
    if (!form.name || !form.category || !form.price) {
      toast.error("Name, category and price are required");
      return;
    }
    const { product, error } = await addProduct({
      id: form.id,
      name: form.name.trim(),
      category: form.category.trim(),
      image: form.image.trim(),
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      damaged: Number(form.damaged) || 0,
    });
    if (product) {
      toast.success(`${product.name} added to inventory`);
      closeModal();
    } else {
      toast.error(error || "Failed to add product");
    }
  };

  // ── Submit: Update ────────────────────────────────────────────────────────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (idError) {
      toast.error(idError);
      return;
    }
    if (!form.id) {
      toast.error("Product ID is required");
      return;
    }

    const { product, error } = await updateProduct(editTarget.id, {
      id: form.id !== editTarget.id ? form.id : undefined, // only send if changed
      name: form.name.trim(),
      category: form.category.trim(),
      image: form.image.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      damaged: Number(form.damaged),
    });
    if (product) {
      toast.success("Product updated successfully");
      closeModal();
    } else {
      toast.error(error || "Failed to update product");
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!editTarget) return;
    const ok = await deleteProduct(editTarget.id);
    if (ok) {
      toast.success(`${editTarget.name} removed`);
      closeModal();
    } else toast.error("Failed to remove product");
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary text-primary-foreground sticky top-0 z-40 shadow-lg px-4 pt-5 pb-4">
          <div className="max-w-lg mx-auto">
            <div className="h-5 w-24 bg-primary-foreground/20 rounded mb-1" />
            <div className="h-7 w-32 bg-primary-foreground/20 rounded" />
          </div>
        </header>
        <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl h-32 animate-pulse"
            />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Derived stats ─────────────────────────────────────────────────────────
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
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
              {/* Demand Analysis button — replaces the damaged badge */}
              {isOwner && (
                <button
                  onClick={() => router.push("/demand-analysis")}
                  className="flex items-center gap-1.5 bg-primary-foreground/10 text-primary-foreground px-3 py-1.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
                  aria-label="Demand Analysis"
                >
                  <TrendingUp size={14} />
                  <span className="text-xs font-semibold">Demand</span>
                </button>
              )}
              {isOwner && (
                <button
                  onClick={openAdd}
                  className="p-2 bg-accent text-accent-foreground rounded-full hover:opacity-90 transition-opacity"
                  aria-label="Add product"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
          </div>
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
              className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent border-0 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/50 hover:text-primary-foreground transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
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

      {/* Stats */}
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

      {/* Product list */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-3">
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
            {isOwner && (
              <button
                onClick={openAdd}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-xl text-sm font-semibold"
              >
                <Plus size={16} /> Add Product
              </button>
            )}
          </div>
        ) : (
          filteredProducts.map((product) => {
            const available = product.stock - product.reserved;
            const stockStatus =
              available > 10 ? "available" : available > 0 ? "low" : "out";
            const hasDamaged = product.damaged > 0;
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
                  <div className="w-24 shrink-0 relative">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        style={{ minHeight: "120px" }}
                      />
                    ) : (
                      <div
                        className="w-full bg-secondary flex items-center justify-center"
                        style={{ minHeight: "120px" }}
                      >
                        <Package size={28} className="text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                      <p className="text-white text-[10px] font-bold">
                        ₹{(product.price / 1000).toFixed(1)}k
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 p-3">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className="font-bold text-foreground text-sm leading-snug line-clamp-2 flex-1 min-w-0">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusDot}`}
                          />
                          <span
                            className={`text-[11px] font-semibold ${statusTextColor}`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                        {isOwner && (
                          <button
                            onClick={() => openEdit(product)}
                            className="p-1 hover:bg-secondary rounded-lg transition-colors ml-1"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Edit2
                              size={13}
                              className="text-muted-foreground"
                            />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-xs text-muted-foreground font-mono">
                        {product.id}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-xs text-muted-foreground truncate">
                        {product.category}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
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
                        className={`rounded-lg px-2 py-1.5 text-center ${hasDamaged ? "bg-destructive/8" : "bg-secondary"}`}
                      >
                        <p
                          className={`text-sm font-bold leading-none ${hasDamaged ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {product.damaged}
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          Damaged
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {(stockStatus !== "available" || hasDamaged) && (
                  <div
                    className={`flex items-center justify-between px-3 py-2 border-t border-border ${stockStatus === "out" ? "bg-destructive/5" : stockStatus === "low" ? "bg-warning/5" : "bg-orange-50 dark:bg-orange-500/5"}`}
                  >
                    <p
                      className={`text-xs font-medium ${stockStatus === "out" ? "text-destructive" : stockStatus === "low" ? "text-warning" : "text-orange-500"}`}
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

      {showAddModal && (
        <ProductModal
          title="Add Product"
          form={form}
          idError={idError}
          isSubmitting={isSubmitting}
          onChange={handleFieldChange}
          onSubmit={handleAdd}
          onClose={closeModal}
        />
      )}

      {editTarget && (
        <ProductModal
          title="Edit Product"
          form={form}
          idError={idError}
          isSubmitting={isSubmitting}
          onChange={handleFieldChange}
          onSubmit={handleUpdate}
          onClose={closeModal}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
