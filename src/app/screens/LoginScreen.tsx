"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !password) {
      toast.error("Please enter phone and password");
      return;
    }

    const loggedInUser = await login(phone, password);

    if (loggedInUser) {
      toast.success("Login successful!");
      setTimeout(() => {
        router.push(
          loggedInUser.role === "owner" ? "/dashboard" : "/employee/dashboard",
        );
      }, 300);
    } else {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-6">
      {/* Back to home button */}
      <button
        onClick={() => router.push("/home")}
        className="fixed top-4 left-4 z-10 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-card/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm border border-border"
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-4">
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                className="text-primary-foreground"
              >
                <rect
                  x="10"
                  y="5"
                  width="30"
                  height="40"
                  rx="2"
                  fill="currentColor"
                  opacity="0.7"
                />
                <circle cx="25" cy="25" r="4" fill="#C89B3C" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to continue to Dwarik Door
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />

            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <Button type="submit" className="w-full" size="lg">
              Login
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button className="text-sm text-muted-foreground hover:text-accent transition-colors">
              Forgot password?
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Demo credentials:
              <br />
              Owner: 9876543210 / admin123
              <br />
              Employee: 9876543211 / emp123
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
