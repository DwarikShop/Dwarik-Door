"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Phone,
  Shield,
  LogOut,
  Moon,
  Sun,
  KeyRound,
  ChevronRight,
  Hash,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useEmployees } from "../hooks/useEmployees";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isDark, toggleDark } = useTheme();
  const router = useRouter();
  const { changePassword, isSubmitting } = useEmployees();

  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwForm.next.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    const ok = await changePassword(user!.id, {
      currentPassword: pwForm.current,
      newPassword: pwForm.next,
    });
    if (ok) {
      toast.success("Password changed successfully");
      setPwForm({ current: "", next: "", confirm: "" });
      setShowPwForm(false);
    } else {
      toast.error("Incorrect current password");
    }
  };

  const infoItems = [
    {
      icon: Hash,
      label: "Employee ID",
      value: user?.id ?? "—",
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      icon: Phone,
      label: "Phone",
      value: user?.phone ?? "—",
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      icon: Shield,
      label: "Role",
      value: user?.role ?? "—",
      color: "text-accent",
      bg: "bg-accent/10",
      capitalize: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ── Hero area — no heavy header, just clean background ── */}
      <div className="relative overflow-hidden">
        {/* Gradient accent strip */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_50%)]" />

        <div className="relative max-w-lg mx-auto px-4 pt-12 pb-16 flex flex-col items-center">
          {/* Large avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white tracking-wide">
                {user?.name ? getInitials(user.name) : "?"}
              </span>
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-[3px] border-primary" />
          </div>

          <h1 className="text-xl font-bold text-white mt-4 tracking-tight">
            {user?.name}
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Sparkles size={12} className="text-white/60" />
            <span className="text-xs text-white/60 font-medium uppercase tracking-wider">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main content — pulled up over the hero ── */}
      <main className="max-w-lg mx-auto px-4 -mt-8 space-y-4 relative z-10">
        {/* ── Quick Info Cards — horizontal row ── */}
        <div className="grid grid-cols-3 gap-2.5">
          {infoItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="bg-card border border-border rounded-2xl p-3 shadow-sm text-center"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-2`}
                >
                  <Icon size={16} className={item.color} />
                </div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-none">
                  {item.label}
                </p>
                <p
                  className={`text-sm font-bold text-foreground mt-1 truncate ${item.capitalize ? "capitalize" : ""}`}
                >
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Settings List ── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
          {/* Appearance */}
          <div className="flex items-center gap-3.5 px-4 py-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-violet-500/10" : "bg-amber-500/10"}`}
            >
              {isDark ? (
                <Moon size={18} className="text-violet-500" />
              ) : (
                <Sun size={18} className="text-amber-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug">
                Appearance
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isDark ? "Dark theme is on" : "Light theme is on"}
              </p>
            </div>
            <button
              aria-label="Toggle dark mode"
              onClick={toggleDark}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 shrink-0 ${
                isDark ? "bg-violet-500" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                  isDark ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Change Password */}
          <div>
            <button
              type="button"
              onClick={() => {
                setShowPwForm((v) => !v);
                setPwForm({ current: "", next: "", confirm: "" });
              }}
              className="w-full flex items-center gap-3.5 px-4 py-4 text-left hover:bg-secondary/30 active:bg-secondary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                <KeyRound size={18} className="text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-snug">
                  Change Password
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Update your login credentials
                </p>
              </div>
              <ChevronRight
                size={15}
                className={`text-muted-foreground/40 shrink-0 transition-transform duration-200 ${showPwForm ? "rotate-90" : ""}`}
              />
            </button>

            {showPwForm && (
              <form
                onSubmit={handleChangePassword}
                className="px-4 pb-4 space-y-3"
              >
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter current password"
                    value={pwForm.current}
                    onChange={(e) =>
                      setPwForm((f) => ({ ...f, current: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={pwForm.next}
                    onChange={(e) =>
                      setPwForm((f) => ({ ...f, next: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={pwForm.confirm}
                    onChange={(e) =>
                      setPwForm((f) => ({ ...f, confirm: e.target.value }))
                    }
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving…" : "Update Password"}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* ── Sign Out ── */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-4 bg-card border border-border rounded-2xl shadow-sm hover:bg-destructive/5 active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <LogOut size={18} className="text-destructive" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-destructive leading-snug">
              Sign Out
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              You'll need to sign in again
            </p>
          </div>
          <ChevronRight size={15} className="text-destructive/30 shrink-0" />
        </button>

        {/* ── Footer ── */}
        <div className="text-center pt-4 pb-2">
          <p className="text-xs font-bold text-muted-foreground/50 tracking-widest uppercase">
            Dwarik Door
          </p>
          <p className="text-[10px] text-muted-foreground/30 mt-0.5">
            Premium Manufacturing · v1.0.0
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
