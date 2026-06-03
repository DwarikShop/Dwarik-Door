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
  ChevronDown,
  Plus,
  X,
  Edit2,
  TrendingUp,
  Sparkles,
  Trash2,
  Info,
  DoorOpen,
  LayoutGrid,
  Crown,
  MoveHorizontal,
  Box,
  ChevronsDownUp,
  ChevronsUpDown,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Category visual styles mapping
export const getCategoryConfig = (category: string) => {
  const name = (category || "").toLowerCase();
  if (name.includes("flush")) {
    return {
      Icon: DoorOpen,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      border: "border-blue-100 dark:border-blue-900/40",
      badgeBg: "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300",
      gradient: "from-blue-50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10",
    };
  }
  if (name.includes("laminate")) {
    return {
      Icon: Layers,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40",
      border: "border-purple-100 dark:border-purple-900/40",
      badgeBg: "bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300",
      gradient: "from-purple-50 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/10",
    };
  }
  if (name.includes("designer")) {
    return {
      Icon: Sparkles,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-100 dark:border-amber-900/40",
      badgeBg: "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300",
      gradient: "from-amber-50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10",
    };
  }
  if (name.includes("panel")) {
    return {
      Icon: LayoutGrid,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-100 dark:border-emerald-900/40",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300",
      gradient: "from-emerald-50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10",
    };
  }
  if (name.includes("carved")) {
    return {
      Icon: Crown,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-100 dark:border-rose-900/40",
      badgeBg: "bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300",
      gradient: "from-rose-50 to-red-50/30 dark:from-rose-950/20 dark:to-red-950/10",
    };
  }
  if (name.includes("sliding")) {
    return {
      Icon: MoveHorizontal,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/40",
      border: "border-orange-100 dark:border-orange-900/40",
      badgeBg: "bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300",
      gradient: "from-orange-50 to-yellow-50/30 dark:from-orange-950/20 dark:to-yellow-950/10",
    };
  }
  if (name.includes("glass")) {
    return {
      Icon: Box,
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-50 dark:bg-cyan-950/40",
      border: "border-cyan-100 dark:border-cyan-900/40",
      badgeBg: "bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300",
      gradient: "from-cyan-50 to-sky-50/30 dark:from-cyan-950/20 dark:to-sky-950/10",
    };
  }
  return {
    Icon: Box,
    color: "text-zinc-600 dark:text-zinc-400",
    bg: "bg-zinc-50 dark:bg-zinc-950/40",
    border: "border-zinc-100 dark:border-zinc-900/40",
    badgeBg: "bg-zinc-100 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-300",
    gradient: "from-zinc-50 to-slate-50/30 dark:from-zinc-950/20 dark:to-slate-950/10",
  };
};

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
  existingCategories?: string[];
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
  existingCategories,
}: ProductModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      onChange("image", data.url);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    onChange("image", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-card rounded-3xl p-6 w-full max-w-md shadow-2xl border border-border/80 max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sparkles size={18} className="text-accent" />
            </div>
            <h2 className="text-base font-extrabold text-foreground">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5">
          {/* Product ID */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
            {idError && <p className="text-sm font-medium text-destructive mt-1">{idError}</p>}
          </div>

          {/* Product Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Category *
            </label>
            <Input
              placeholder="e.g. Flush Doors"
              value={form.category}
              onChange={(e) => onChange("category", e.target.value)}
              className="h-10 rounded-xl bg-secondary/35 border-border/80 focus-visible:ring-accent/20"
              required
            />
            {existingCategories && existingCategories.length > 0 && (
              <div className="pt-1">
                <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Quick Suggestions:</p>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1 pb-1">
                  {existingCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => onChange("category", cat)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        form.category.trim().toLowerCase() === cat.trim().toLowerCase()
                          ? "bg-accent/15 border-accent text-accent font-bold"
                          : "bg-secondary/40 border-border/60 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Image Uploader */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Product Image *
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {form.image ? (
              <div className="relative rounded-2xl overflow-hidden border border-border/80 group h-44 bg-secondary/20 shadow-inner flex items-center justify-center">
                <img
                  src={form.image}
                  alt="Product preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full transition-all active:scale-90 cursor-pointer border border-white/10"
                    title="Change Image"
                  >
                    <Upload size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="p-2.5 bg-destructive/80 hover:bg-destructive text-white rounded-full transition-all active:scale-90 cursor-pointer shadow-md"
                    title="Remove Image"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                {/* Corner indicator */}
                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase text-accent tracking-widest leading-none">
                  Preview
                </div>
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2 group min-h-[140px] ${
                  dragActive
                    ? "border-accent bg-accent/5 scale-[1.01]"
                    : "border-border/80 hover:border-accent/40 bg-secondary/15 hover:bg-secondary/25"
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-xs font-bold text-muted-foreground animate-pulse">Uploading image...</p>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-2xl bg-secondary/80 text-muted-foreground group-hover:text-accent group-hover:bg-accent/10 transition-all duration-300">
                      <Upload size={20} className="transition-transform group-hover:-translate-y-0.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-extrabold text-foreground group-hover:text-accent transition-colors">
                        Click or drag image to upload
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Supports PNG, JPG, JPEG, WEBP
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* URL Toggle Link */}
            <div className="pt-1.5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowUrlField(!showUrlField)}
                className="text-[10px] font-bold text-muted-foreground hover:text-accent transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{showUrlField ? "Hide" : "Or use custom image URL"}</span>
                <ChevronDown size={11} className={`transition-transform duration-200 ${showUrlField ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Collapsible URL Input Field */}
            <div className={`transition-all duration-300 overflow-hidden ${
              showUrlField ? "max-h-[80px] opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none mt-0"
            }`}>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={form.image}
                onChange={(e) => onChange("image", e.target.value)}
                className="h-10 rounded-xl bg-secondary/35 border-border/80 focus-visible:ring-accent/20 text-xs"
              />
            </div>
          </div>

          {/* Price & Stock Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                className="h-10 rounded-xl flex items-center justify-center gap-1.5 flex-1 cursor-pointer font-bold text-sm"
                disabled={isSubmitting}
                onClick={onDelete}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </Button>
            )}
            <Button
              type="submit"
              className="h-10 rounded-xl flex-1 cursor-pointer bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-sm shadow-lg shadow-accent/10"
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isWidgetsCollapsed, setIsWidgetsCollapsed] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
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

  const handleCategoryClick = (catName: string) => {
    const isSelected = selectedCategory === catName;
    const targetCat = isSelected ? null : catName;
    
    setSelectedCategory(targetCat);
    
    if (targetCat) {
      // Auto-expand the accordion
      setCollapsedCategories((prev) => ({
        ...prev,
        [catName]: false,
      }));
      
      // Auto-collapse the widgets grid drawer
      setIsWidgetsCollapsed(true);
      
      // Smooth scroll to top
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 150);
    }
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

  const existingCategories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean)),
  ).sort();

  // Compute category statistics with absolute undefined/null safety
  const categoryStats = existingCategories.map((cat) => {
    const catProducts = products.filter((p) => p.category === cat);
    const totalStock = catProducts.reduce((sum, p) => sum + (p.stock ?? 0), 0);
    const reservedStock = catProducts.reduce((sum, p) => sum + (p.reserved ?? 0), 0);
    const damagedStock = catProducts.reduce((sum, p) => sum + (p.damaged ?? 0), 0);
    const availableStock = totalStock - reservedStock;
    const lowStockCount = catProducts.filter((p) => {
      const avail = (p.stock ?? 0) - (p.reserved ?? 0);
      return avail <= 10 && avail > 0;
    }).length;
    const outOfStockCount = catProducts.filter(
      (p) => ((p.stock ?? 0) - (p.reserved ?? 0)) <= 0
    ).length;

    return {
      name: cat,
      productsCount: catProducts.length,
      totalStock,
      availableStock,
      damagedStock,
      lowStockCount,
      outOfStockCount,
    };
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-24 font-sans select-none">
        <header className="bg-[#4E342E] dark:bg-[#2A1510] border-b border-[#DAB668]/40 text-white px-4 pt-4 pb-3 sticky top-0 z-40 shadow-[0_4px_25px_rgba(78,52,46,0.25)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300">
          <div className="max-w-lg mx-auto">
            <div className="h-4.5 w-20 bg-white/10 rounded mb-1.5 animate-pulse" />
            <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
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
    const available = (product.stock ?? 0) - (product.reserved ?? 0);
    const matchesSearch =
      !searchTerm ||
      (product.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "low" && available > 0 && available <= 10) ||
      (filter === "out" && available <= 0) ||
      (filter === "damaged" && (product.damaged ?? 0) > 0);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const cat = product.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {} as Record<string, TProduct[]>);

  const sortedCats = Object.keys(groupedProducts).sort();

  const isAllCollapsed = sortedCats.length > 0 && sortedCats.every((cat) => collapsedCategories[cat] === true);

  const toggleAllCollapse = () => {
    if (isAllCollapsed) {
      setCollapsedCategories({});
    } else {
      const newCollapsed: Record<string, boolean> = {};
      sortedCats.forEach((cat) => {
        newCollapsed[cat] = true;
      });
      setCollapsedCategories(newCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1A1210] pb-24 font-sans select-none">
      
      {/* High-density sticky header consistent with other pages */}
      <header className="bg-[#4E342E] dark:bg-[#2A1510] border-b border-[#DAB668]/40 text-white sticky top-0 z-40 shadow-[0_4px_25px_rgba(78,52,46,0.25)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] text-neutral-400/80 font-extrabold uppercase tracking-widest leading-none">
                Dwarik Door
              </p>
              <h1 className="text-3xl font-black tracking-tight mt-1.5 text-white">Inventory</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {isOwner && (
                <button
                  onClick={() => router.push("/demand-analysis")}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white px-3 py-1.5 rounded-xl active:scale-95 transition-all cursor-pointer border border-white/15"
                  aria-label="Demand Analysis"
                >
                  <TrendingUp size={13} className="text-accent" />
                  <span className="text-xs uppercase font-extrabold tracking-wider">Demand</span>
                </button>
              )}
              {isOwner && (
                <button
                  onClick={openAdd}
                  className="p-2 bg-accent text-accent-foreground hover:bg-accent/90 active:scale-90 rounded-xl transition-all cursor-pointer shadow-sm border border-accent/15"
                  aria-label="Add product"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-accent transition-colors"
              size={15}
            />
            <input
              type="text"
              placeholder="Search catalog by name, ID or category…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-9 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 focus:bg-white/15 text-sm transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Dense Stats Overview */}
      <div className="max-w-lg mx-auto px-4 pt-4 animate-[fadeIn_0.3s_ease-out]">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            {
              label: "Low",
              value: stats.lowStock,
              icon: TrendingDown,
              color: "text-warning",
              bg: "bg-warning/8",
              border: "border-warning/15",
            },
            {
              label: "Out",
              value: stats.outOfStock,
              icon: Package,
              color: "text-destructive",
              bg: "bg-destructive/8",
              border: "border-destructive/15",
            },
            {
              label: "Damaged",
              value: stats.totalDamaged,
              icon: AlertTriangle,
              color: "text-orange-500",
              bg: "bg-orange-500/8",
              border: "border-orange-500/15",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`bg-card border ${s.border} rounded-xl p-1.5 pl-2 pr-2 flex items-center gap-2 shadow-sm transition-all duration-200 hover:scale-[1.01]`}
              >
                <div className={`p-1.5 rounded-xl ${s.bg} shrink-0`}>
                  <Icon size={13} className={s.color} />
                </div>
                <div className="min-w-0 leading-none">
                  <p className={`text-sm font-black tracking-tight ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="text-[8.5px] uppercase tracking-wider font-extrabold text-muted-foreground mt-0.5">
                    {s.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Browse Widgets Grid */}
      <div className="max-w-lg mx-auto px-4 pt-4.5">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground/80">
              Browse By Category
            </h2>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground font-black leading-none">
              {categoryStats.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2.5">
            {selectedCategory && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setIsWidgetsCollapsed(false); // Re-open grid when showing all
                }}
                className="text-[10px] font-black text-accent hover:underline uppercase tracking-wider cursor-pointer"
              >
                Show All
              </button>
            )}
            <button
              onClick={() => setIsWidgetsCollapsed(!isWidgetsCollapsed)}
              className="text-[10px] font-bold text-muted-foreground hover:text-accent uppercase tracking-wider cursor-pointer flex items-center gap-1 bg-secondary/50 hover:bg-secondary/80 px-2 py-1 rounded-lg transition-all"
              aria-label="Toggle category widgets drawer"
            >
              <span>{isWidgetsCollapsed ? "Expand" : "Collapse"}</span>
              <ChevronDown size={11} className={`transition-transform duration-200 ${isWidgetsCollapsed ? "-rotate-90" : ""}`} />
            </button>
          </div>
        </div>

        <div className={`transition-all duration-300 overflow-hidden ${isWidgetsCollapsed ? "max-h-0 opacity-0 pointer-events-none mt-0 mb-0" : "max-h-[500px] opacity-100 mt-1.5 mb-1"}`}>
          <div className="grid grid-cols-2 gap-3 pb-2.5">
            {categoryStats.map((catStat) => {
              const config = getCategoryConfig(catStat.name);
              const CatIcon = config.Icon;
              const isSelected = selectedCategory === catStat.name;
              const hasWarning = catStat.outOfStockCount > 0 || catStat.lowStockCount > 0;

              return (
                <button
                  key={catStat.name}
                  onClick={() => handleCategoryClick(catStat.name)}
                  className={`w-full rounded-2xl border text-left p-3.5 flex flex-col justify-between min-h-[92px] transition-all duration-300 active:scale-[0.98] cursor-pointer relative overflow-hidden bg-gradient-to-br ${
                    isSelected
                      ? `${config.border} ${config.bg} ${config.color} ring-1.5 ring-current/25 shadow-md shadow-current/5 scale-[1.02]`
                      : `border-border/30 hover:border-border/60 bg-card/65 dark:bg-card/35 backdrop-blur-md hover:scale-[1.01]`
                  }`}
                >
                  {/* Top Row: Title & Icon */}
                  <div className="flex items-start justify-between gap-2.5 w-full">
                    <div className="min-w-0">
                      <h3 className={`font-black text-[13px] tracking-tight break-words whitespace-normal leading-snug ${isSelected ? "" : "text-foreground"}`}>
                        {catStat.name}
                      </h3>
                      <span className={`inline-block text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md mt-1.5 ${
                        isSelected
                          ? `${config.badgeBg} font-black`
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {catStat.productsCount} Item{catStat.productsCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? config.badgeBg : config.bg} ${config.color}`}>
                      <CatIcon size={14} />
                    </div>
                  </div>

                  {/* Bottom Row: Warning indicators */}
                  {hasWarning && (
                    <div className="flex items-center gap-1.5 mt-2.5 pt-1.5 border-t border-current/10 w-full text-[9px] font-black uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0 animate-pulse" />
                      <span className={isSelected ? "" : "text-muted-foreground"}>
                        {catStat.outOfStockCount > 0 
                          ? `${catStat.outOfStockCount} Out` 
                          : `${catStat.lowStockCount} Low`}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* High-density compact catalog list */}
      <main className="max-w-lg mx-auto px-4 pt-3.5 pb-6 space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground/70">
            {filteredProducts.length} Item{filteredProducts.length !== 1 ? "s" : ""} active
          </p>
          <div className="flex items-center gap-3">
            {sortedCats.length > 0 && (
              <button
                onClick={toggleAllCollapse}
                className="text-[10px] text-muted-foreground hover:text-foreground font-extrabold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1 hover:bg-secondary/40 px-1.5 py-0.5 rounded"
                title={isAllCollapsed ? "Expand All Categories" : "Collapse All Categories"}
                aria-label={isAllCollapsed ? "Expand All Categories" : "Collapse All Categories"}
              >
                {isAllCollapsed ? (
                  <>
                    <ChevronsUpDown size={11} className="text-accent animate-pulse" />
                    <span>Expand All</span>
                  </>
                ) : (
                  <>
                    <ChevronsDownUp size={11} className="text-accent" />
                    <span>Collapse All</span>
                  </>
                )}
              </button>
            )}
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory(null);
                }}
                className="text-xs text-accent font-black uppercase tracking-wider cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
            <div className="w-14 h-14 bg-secondary/80 rounded-xl flex items-center justify-center mb-3 text-muted-foreground">
              <Package size={26} />
            </div>
            <p className="font-extrabold text-foreground mb-1 text-sm">
              No matching products
            </p>
            <p className="text-xs text-muted-foreground max-w-[200px] mb-3">
              Try adjusting your query or filter tags.
            </p>
            {isOwner && (
              <button
                onClick={openAdd}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-bold uppercase tracking-wider active:scale-95 shadow cursor-pointer"
              >
                <Plus size={13} /> Add Product
              </button>
            )}
          </div>
        ) : (
          sortedCats.map((catName) => {
            const catConfig = getCategoryConfig(catName);
            const CatIcon = catConfig.Icon;
            const catProducts = groupedProducts[catName] || [];
            const isCollapsed = collapsedCategories[catName] ?? false;

            return (
              <div
                key={catName}
                id={`cat-section-${catName.replace(/\s+/g, "-")}`}
                className="space-y-2.5 animate-[fadeIn_0.2s_ease-out] scroll-mt-20"
              >
                {/* Category Header Bar */}
                <button
                  onClick={() =>
                    setCollapsedCategories((prev) => ({
                      ...prev,
                      [catName]: !isCollapsed,
                    }))
                  }
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 cursor-pointer text-left ${
                    isCollapsed
                      ? "bg-card border-border/40 hover:border-border/60 hover:bg-secondary/20"
                      : `${catConfig.border} bg-gradient-to-r ${catConfig.gradient} shadow-sm shadow-current/5 scale-[1.01]`
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl bg-card border border-border/45 shadow-sm ${catConfig.color} shrink-0 flex items-center justify-center`}>
                      <CatIcon size={15} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-foreground text-sm tracking-tight truncate leading-tight">
                        {catName}
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-semibold leading-none mt-1">
                        {catProducts.length} Item{catProducts.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="p-1 hover:bg-secondary/60 rounded-lg text-muted-foreground/80 hover:text-foreground transition-all shrink-0">
                      <ChevronRight size={16} className={`transition-transform duration-300 ${isCollapsed ? "" : "rotate-90"}`} />
                    </div>
                  </div>
                </button>

                {/* Category Products List (Collapsible) */}
                {!isCollapsed && (
                  <div className="pl-2.5 space-y-3 border-l border-dashed border-border/60 ml-5 pt-1 pb-2">
                    {catProducts.map((product) => {
                      const available = (product.stock ?? 0) - (product.reserved ?? 0);
                      const stockStatus =
                        available > 10 ? "available" : available > 0 ? "low" : "out";
                      const hasDamaged = (product.damaged ?? 0) > 0;

                      return (
                        <div
                          key={product.id}
                          className="bg-card/75 dark:bg-card/35 backdrop-blur-md border border-border/30 hover:border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.005] relative animate-[slideUp_0.2s_ease-out]"
                        >
                          {/* Visual stock status colored left accent line */}
                          <span className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${
                            stockStatus === "out"
                              ? "bg-destructive"
                              : stockStatus === "low"
                                ? "bg-warning"
                                : "bg-success/80"
                          }`} />

                          {/* Product Core Row (Image + Name & ID) */}
                          <div className="flex items-start justify-between gap-3 p-3.5 pr-4 pl-4.5">
                            <div className="flex gap-3 items-start flex-1 min-w-0">
                              {/* Small avatar thumbnail */}
                              <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-border/40 bg-secondary/30 relative shadow-sm">
                                <img
                                  src={
                                    product.image ||
                                    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop"
                                  }
                                  alt={product.name}
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                              </div>

                              {/* Product Details (ID & Name) */}
                              <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[9px] font-black text-accent bg-accent/8 border border-accent/15 px-2 py-0.5 rounded-md font-mono tracking-wider shrink-0 shadow-sm leading-none flex items-center justify-center">
                                    {product.id}
                                  </span>
                                </div>
                                <h3 className="font-extrabold text-foreground text-xs leading-snug mt-1.5 hover:text-accent transition-colors break-words whitespace-normal">
                                  {product.name}
                                </h3>
                              </div>
                            </div>

                            {/* Edit action positioned nicely in top right */}
                            {isOwner && (
                              <button
                                onClick={() => openEdit(product)}
                                className="p-1.5 hover:bg-secondary/70 hover:text-accent text-muted-foreground rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm"
                                aria-label={`Edit ${product.name}`}
                              >
                                <Edit2 size={12} />
                              </button>
                            )}
                          </div>

                          {/* Stock Counts Row */}
                          <div className="px-3.5 pl-4.5 pb-3 pt-2 border-t border-border/10 flex items-center justify-between gap-2 flex-wrap">
                            {/* Left: Available & Reserved Indicators */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Available pill */}
                              <div className="flex items-center gap-1 bg-success/8 dark:bg-success/15 border border-success/15 px-2.5 py-1 rounded-lg text-[10px] font-bold text-success leading-none">
                                <span className="text-[8px] uppercase font-black text-success/70 leading-none">Available:</span>
                                <span className="font-black leading-none">{available}</span>
                              </div>

                              {/* Reserved pill */}
                              <div className="flex items-center gap-1 bg-info/8 dark:bg-info/15 border border-info/15 px-2.5 py-1 rounded-lg text-[10px] font-bold text-info leading-none">
                                <span className="text-[8px] uppercase font-black text-info/70 leading-none">Reserved:</span>
                                <span className="font-black leading-none">{product.reserved ?? 0}</span>
                              </div>

                              {/* Damaged pill */}
                              {(product.damaged ?? 0) > 0 && (
                                <div className="flex items-center gap-1 bg-destructive/8 dark:bg-destructive/15 border border-destructive/15 px-2.5 py-1 rounded-lg text-[10px] font-bold text-destructive leading-none">
                                  <span className="text-[8px] uppercase font-black text-destructive/70 leading-none">Damaged:</span>
                                  <span className="font-black leading-none">{product.damaged ?? 0}</span>
                                </div>
                              )}
                            </div>

                            {/* Right: Premium Alert Badge */}
                            {(stockStatus !== "available" || hasDamaged) && (
                              <div className="shrink-0 flex items-center">
                                {stockStatus === "out" ? (
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20 px-2 py-1 rounded-lg flex items-center gap-1 animate-pulse shadow-sm">
                                    <AlertTriangle size={9} />
                                    <span>Out of stock</span>
                                  </span>
                                ) : stockStatus === "low" ? (
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-warning/10 text-warning border border-warning/20 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                    <AlertTriangle size={9} />
                                    <span>Low Stock</span>
                                  </span>
                                ) : hasDamaged ? (
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 border border-orange-500/20 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                    <AlertTriangle size={9} />
                                    <span>Damaged</span>
                                  </span>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
          existingCategories={existingCategories}
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
          existingCategories={existingCategories}
        />
      )}
    </div>
  );
}
