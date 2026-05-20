"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { User, Phone, Shield, LogOut, Bell, Moon, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useEmployees } from "../hooks/useEmployees";

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground px-6 py-6 sticky top-0 z-40 shadow-md">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-foreground/20 rounded-full mb-4">
            <User size={48} />
          </div>
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-primary-foreground/80 capitalize">{user?.role}</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-6 space-y-6">
        <section>
          <h2 className="text-lg font-bold mb-3">Account Information</h2>
          <Card className="p-4 gap-0">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <User size={24} className="text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-semibold">{user?.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <Phone size={24} className="text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-semibold">{user?.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <Shield size={24} className="text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-semibold capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">Settings</h2>
          <Card className="p-4 gap-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Notifications</span>
                    <p className="text-xs text-muted-foreground">
                      Tap the bell on the dashboard
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Moon size={20} className="text-muted-foreground" />
                    <span className="text-sm font-medium">Dark Mode</span>
                  </div>
                  <button
                    aria-label="Toggle dark mode"
                    onClick={toggleDark}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 ${
                      isDark ? "bg-accent" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        isDark ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <Card className="p-4 gap-0">
            <button
              type="button"
              onClick={() => { setShowPwForm((v) => !v); setPwForm({ current: "", next: "", confirm: "" }); }}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <KeyRound size={20} className="text-muted-foreground" />
                <span className="text-sm font-medium">Change Password</span>
              </div>
              <span className="text-xs text-accent font-semibold">{showPwForm ? "Cancel" : "Change"}</span>
            </button>

            {showPwForm && (
              <form onSubmit={handleChangePassword} className="space-y-3 mt-4 pt-4 border-t border-border">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Current Password</label>
                  <Input
                    type="password"
                    placeholder="Enter current password"
                    value={pwForm.current}
                    onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">New Password</label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={pwForm.next}
                    onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : "Update Password"}
                </Button>
              </form>
            )}
          </Card>
        </section>

        <section>
          <Card className="p-4 gap-0">
            <div className="text-center py-4">
              <h3 className="text-xl font-bold mb-2">DWARIK DOOR</h3>
              <p className="text-sm text-muted-foreground">
                Premium Door Manufacturing
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Version 1.0.0
              </p>
            </div>
          </Card>
        </section>

        <Button
          variant="destructive"
          className="w-full"
          size="lg"
          onClick={handleLogout}
        >
          <LogOut size={20} className="mr-2" />
          Logout
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
