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
  Sparkles,
  Trash2,
  Info,
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
  idError: string;
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-card rounded-3xl p-6 w-full max-w-md shadow-2xl border border-border/80 max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sparkles size={16} className="text-accent" />
            </div>
            <h2 className="text-sm font-extrabold text-foreground">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5">
          {/* Product ID */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Product ID * <span className="font-normal text-muted-foreground/60">(e.g. DW-009)</span>
            </label>
            <Input
              placeholder="DW-009"
              value={form.id}
              onChange={(e) => onChange("id", e.target.value.toUpperCase())}
              className={`h-10 rounded-xl bg-secondary/35 border-border/80 focus-visible:ring-accent/20 ${
                idError ? "border-destructive focus-visible:border-destructive" : ""
              }`}
              required
            />
            {idError && <p className="text-xs font-medium text-destructive mt-1">{idError}</p>}
          </div>

          {/* Product Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Product Name *
            </label>
            <Input
              placeholder="e.g. Premium Teak Veneer Door"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="h-10 rounded-xl bg-secondary/35 border-border/80 focus-visible:ring-accent/20"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Category *
            </label>
            <Input
              placeholder="e.g. Flush Doors"
              value={form.category}
              onChange={(e) => onChange("category", e.target.value)}
              className="h-10 rounded-xl bg-secondary/35 border-border/80 focus-visible:ring-accent/20"
              required
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Image URL
            </label>
            <Input
              placeholder="https://images.unsplash.com/..."
              value={form.image}
              onChange={(e) => onChange("image", e.target.value)}
              className="h-10 rounded-xl bg-secondary/35 border-border/80 focus-visible:ring-accent/20"
            />
          </div>

          {/* Price & Stock Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Price (₹) *
              </label>
              <Input
                type="number"
                min="0"
                placeholder="12500"
                value={form.price}
                onChange={(e) => onChange("price", e.target.value)}
                className="h-10 rounded-xl bg-secondary/35 border-border/80 focus-visible:ring-accent/20"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Stock (units)
              </label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.stock}
                onChange={(e) => onChange("stock", e.target.value)}
                className="h-10 rounded-xl bg-secondary/35 border-border/80 focus-visible:ring-accent/20"
              />
            </div>
          </div>

          {/* Damaged Units */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Damaged units
            </label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={form.damaged}
              onChange={(e) => onChange("damaged", e.target.value)}
              className="h-10 rounded-xl bg-secondary/35 border-border/80 focus-visible:ring-accent/20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                className="h-10 rounded-xl flex items-center justify-center gap-1.5 flex-1 cursor-pointer font-bold text-xs"
                disabled={isSubmitting}
                onClick={onDelete}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </Button>
            )}
            <Button
              type="submit"
              className="h-10 rounded-xl flex-1 cursor-pointer bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xs shadow-lg shadow-accent/10"
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

  const idCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!form.id) {
      setIdError("");
      return;
    }

    if (idCheckTimer.current) clearTimeout(idCheckTimer.current);
    idCheckTimer.current = setTimeout(async () => {
      const excludeId = editTarget?.id;
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

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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
      id: form.id !== editTarget.id ? form.id : undefined,
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

  const handleDelete = async () => {
    if (!editTarget) return;
    const ok = await deleteProduct(editTarget.id);
    if (ok) {
      toast.success(`${editTarget.name} removed`);
      closeModal();
    } else toast.error("Failed to remove product");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-24 font-sans select-none">
        <header className="bg-primary text-primary-foreground sticky top-0 z-40 px-4 pt-4 pb-3">
          <div className="max-w-lg mx-auto">
            <div className="h-4.5 w-20 bg-primary-foreground/10 rounded mb-1.5 animate-pulse" />
            <div className="h-6 w-32 bg-primary-foreground/20 rounded animate-pulse" />
          </div>
        </header>
        <div className="max-w-lg mx-auto px-4 pt-3 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border/60 rounded-xl h-16 animate-pulse" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-card border border-border/50 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  // Stats Derived
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

  const filters: { value: FilterType; label: string; count: number; activeBg: string; activeText: string }[] = [
    { value: "all", label: "All", count: stats.total, activeBg: "bg-primary text-primary-foreground", activeText: "bg-primary-foreground/20 text-primary-foreground" },
    { value: "low", label: "Low", count: stats.lowStock, activeBg: "bg-warning/10 text-warning border border-warning/20", activeText: "bg-warning/20 text-warning" },
    { value: "out", label: "Out", count: stats.outOfStock, activeBg: "bg-destructive/10 text-destructive border border-destructive/20", activeText: "bg-destructive/20 text-destructive" },
    { value: "damaged", label: "Damaged", count: stats.totalDamaged, activeBg: "bg-orange-500/10 text-orange-500 border border-orange-500/20", activeText: "bg-orange-500/20 text-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-24 font-sans select-none">
      
      {/* High-density sticky header consistent with other pages */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-40 shadow-md">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[9px] text-primary-foreground/60 font-extrabold uppercase tracking-widest leading-none">
                Dwarik Door
              </p>
              <h1 className="text-xl font-bold tracking-tight mt-1">Inventory</h1>
            </div>
            
            <div className="flex items-center gap-1.5">
              {isOwner && (
                <button
                  onClick={() => router.push("/demand-analysis")}
                  className="flex items-center gap-1 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground px-2.5 py-1 rounded-full active:scale-95 transition-all cursor-pointer border border-primary-foreground/5"
                  aria-label="Demand Analysis"
                >
                  <TrendingUp size={11} />
                  <span className="text-[9px] uppercase font-bold tracking-wider">Demand</span>
                </button>
              )}
              {isOwner && (
                <button
                  onClick={openAdd}
                  className="p-1.5 bg-accent text-accent-foreground hover:bg-accent/90 active:scale-90 rounded-full transition-all cursor-pointer shadow"
                  aria-label="Add product"
                >
                  <Plus size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-foreground/50 group-focus-within:text-primary-foreground transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder="Search catalog by name, ID or category…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8.5 pl-9 pr-8 rounded-xl bg-primary-foreground/10 border border-primary-foreground/5 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent focus:ring-1.5 focus:ring-accent/10 text-xs transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-primary-foreground/10 rounded-full text-primary-foreground/50 hover:text-primary-foreground transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Dense filter pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none px-4 pb-2.5 max-w-lg mx-auto">
          {filters.map((f) => {
            const isSelected = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? "bg-accent text-accent-foreground shadow-sm font-extrabold"
                    : "bg-primary-foreground/10 text-primary-foreground/75 hover:bg-primary-foreground/20 border border-transparent"
                }`}
              >
                {f.label}
                <span
                  className={`inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[8px] font-bold ${
                    isSelected
                      ? "bg-accent-foreground/20 text-accent-foreground"
                      : "bg-primary-foreground/20 text-primary-foreground/50"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Dense Stats Overview */}
      <div className="max-w-lg mx-auto px-4 pt-3">
        <div className="grid grid-cols-4 gap-1.5">
          {[
            {
              label: "Catalog",
              value: stats.total,
              icon: Layers,
              color: "text-[#4E342E] dark:text-[#C89B3C]",
              bg: "bg-[#4E342E]/8 dark:bg-[#C89B3C]/10",
              border: "border-primary/10",
            },
            {
              label: "Low",
              value: stats.lowStock,
              icon: TrendingDown,
              color: "text-warning",
              bg: "bg-warning/10",
              border: "border-warning/10",
            },
            {
              label: "Out",
              value: stats.outOfStock,
              icon: Package,
              color: "text-destructive",
              bg: "bg-destructive/10",
              border: "border-destructive/10",
            },
            {
              label: "Damaged",
              value: stats.totalDamaged,
              icon: AlertTriangle,
              color: "text-orange-500",
              bg: "bg-orange-500/10",
              border: "border-orange-500/10",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`bg-card border ${s.border} rounded-xl py-2 px-1 flex flex-col items-center gap-1 shadow-sm`}
              >
                <div className={`p-1 rounded-lg ${s.bg}`}>
                  <Icon size={11} className={s.color} />
                </div>
                <p className={`text-base font-black leading-none ${s.color}`}>
                  {s.value}
                </p>
                <p className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground text-center">
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-density compact catalog list */}
      <main className="max-w-lg mx-auto px-4 pt-3.5 pb-6 space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/60">
            {filteredProducts.length} Item{filteredProducts.length !== 1 ? "s" : ""} active
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-[9px] text-accent font-extrabold uppercase tracking-widest cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
            <div className="w-12 h-12 bg-secondary/80 rounded-xl flex items-center justify-center mb-3 text-muted-foreground">
              <Package size={22} />
            </div>
            <p className="font-extrabold text-foreground mb-0.5 text-xs">
              No matching products
            </p>
            <p className="text-[10px] text-muted-foreground max-w-[180px]">
              Try adjusting your query or filter tags.
            </p>
            {isOwner && (
              <button
                onClick={openAdd}
                className="mt-3.5 flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-[10px] font-bold uppercase tracking-wider active:scale-95 shadow cursor-pointer"
              >
                <Plus size={11} /> Add Product
              </button>
            )}
          </div>
        ) : (
          filteredProducts.map((product) => {
            const available = product.stock - product.reserved;
            const stockStatus =
              available > 10 ? "available" : available > 0 ? "low" : "out";
            const hasDamaged = product.damaged > 0;
            
            // Status colors
            const statusDot =
              stockStatus === "available"
                ? "bg-success"
                : stockStatus === "low"
                  ? "bg-warning"
                  : "bg-destructive";
            const statusTextColor =
              stockStatus === "available"
                ? "text-success"
                : stockStatus === "low"
                  ? "text-warning"
                  : "text-destructive";

            return (
              <div
                key={product.id}
                className="bg-card border border-border/40 hover:border-border/80 rounded-2xl overflow-hidden shadow-sm transition-all duration-200"
              >
                {/* Horizontal row layout */}
                <div className="flex items-center gap-3 p-2.5">
                  
                  {/* Small avatar thumbnail */}
                  <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-border/40 bg-secondary/30 relative">
                    <img
                      src={product.image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop"}
                      alt={product.name}
                      className="w-full h-full object-cover animate-[fadeIn_0.2s_ease-out]"
                    />
                  </div>

                  {/* Product Details (Category, ID, Name, Price) */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[8px] uppercase tracking-wider font-black text-accent truncate max-w-[70px]">
                        {product.category}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[8px] font-mono text-muted-foreground/75">
                        {product.id}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-foreground text-xs leading-tight truncate mt-0.5">
                      {product.name}
                    </h3>
                    <p className="text-[11px] font-black text-foreground/80 mt-0.5">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Action Stock counts */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Available pill */}
                    <div className="flex flex-col items-center bg-success/5 border border-success/15 px-1.5 py-0.5 rounded-lg min-w-[32px]">
                      <span className="text-[11px] font-black text-success leading-none">{available}</span>
                      <span className="text-[6px] uppercase font-bold text-muted-foreground/80 mt-0.5 leading-none">Avail</span>
                    </div>
                    
                    {/* Reserved pill */}
                    <div className="flex flex-col items-center bg-info/5 border border-info/15 px-1.5 py-0.5 rounded-lg min-w-[32px]">
                      <span className="text-[11px] font-black text-info leading-none">{product.reserved}</span>
                      <span className="text-[6px] uppercase font-bold text-muted-foreground/80 mt-0.5 leading-none">Resv</span>
                    </div>

                    {/* Damaged pill — only show if > 0 to save space */}
                    {product.damaged > 0 ? (
                      <div className="flex flex-col items-center bg-destructive/5 border border-destructive/15 px-1.5 py-0.5 rounded-lg min-w-[32px]">
                        <span className="text-[11px] font-black text-destructive leading-none">{product.damaged}</span>
                        <span className="text-[6px] uppercase font-bold text-muted-foreground/80 mt-0.5 leading-none">Dmg</span>
                      </div>
                    ) : (
                      <div className="w-[32px] h-0 shrink-0" /> // Spacer block to align
                    )}

                    {isOwner && (
                      <button
                        onClick={() => openEdit(product)}
                        className="p-1 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer ml-0.5"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Edit2 size={11} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtitle warning strip (very tight & clean) */}
                {(stockStatus !== "available" || hasDamaged) && (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 border-t border-border/30 text-[8px] font-bold uppercase tracking-wider ${
                      stockStatus === "out"
                        ? "bg-destructive/5 text-destructive"
                        : stockStatus === "low"
                          ? "bg-warning/5 text-warning"
                          : "bg-orange-500/5 text-orange-500"
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-current shrink-0 animate-pulse" />
                    <span className="truncate">
                      {stockStatus === "out"
                        ? "Out of stock"
                        : stockStatus === "low"
                          ? `Low Stock: ${available} left`
                          : `Damaged reported: ${product.damaged} units`}
                    </span>
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
