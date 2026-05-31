"use client";

import { Home, ShoppingBag, Package, Users, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";

export function BottomNav() {
  const pathname = usePathname();
  const { isOwner } = useAuth();

  const ownerNavItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: ShoppingBag, label: "Orders", path: "/orders" },
    { icon: Package, label: "Inventory", path: "/inventory" },
    { icon: Users, label: "Employees", path: "/employees" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const employeeNavItems = [
    { icon: Home, label: "Home", path: "/employee/dashboard" },
    { icon: ShoppingBag, label: "Orders", path: "/employee/orders" },
    { icon: Package, label: "Inventory", path: "/inventory" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const navItems = isOwner ? ownerNavItems : employeeNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#160E0D] border-t border-[#DAB668]/20 z-50 safe-area-inset-bottom shadow-[0_-4px_24px_rgba(0,0,0,0.3)] transition-all duration-300">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          // Enhanced robust active route matching (including nested paths like details/edits)
          const isActive = item.path === "/dashboard" || item.path === "/employee/dashboard"
            ? pathname === item.path
            : pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 cursor-pointer active:scale-95 group",
                isActive 
                  ? "text-accent font-black scale-102" 
                  : "text-neutral-400/65 hover:text-white",
              )}
            >
              {/* Premium Active Top Edge Light Line */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-accent shadow-[0_0_8px_#DAB668] animate-pulse" />
              )}

              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 1.75} 
                className={cn(
                  "transition-transform duration-300", 
                  isActive ? "scale-105 drop-shadow-[0_0_6px_rgba(218,182,104,0.3)]" : "group-hover:scale-105"
                )}
              />
              <span className={cn(
                "text-[10px] tracking-wider transition-all duration-300 font-bold uppercase",
                isActive ? "font-black" : "opacity-75"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
