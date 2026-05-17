"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { User, Phone, Shield, LogOut, Bell, Moon } from "lucide-react";
import { toast } from "sonner";

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isDark, toggleDark } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/login");
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
                  <span className="text-sm font-medium">Notifications</span>
                </div>
                <button
                  aria-label="Toggle notifications"
                  className="relative inline-flex h-7 w-14 items-center rounded-full bg-accent transition-colors"
                >
                  <span className="inline-block h-5 w-5 transform translate-x-8 rounded-full bg-white shadow transition-transform" />
                </button>
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
          <h2 className="text-lg font-bold mb-3">Company</h2>
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
