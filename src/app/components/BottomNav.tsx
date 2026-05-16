import { Home, ShoppingBag, Package, Users, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';

export function BottomNav() {
  const location = useLocation();
  const { isOwner } = useAuth();

  const ownerNavItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: Users, label: 'Employees', path: '/employees' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  const employeeNavItems = [
    { icon: Home, label: 'Home', path: '/employee/dashboard' },
    { icon: ShoppingBag, label: 'Orders', path: '/employee/orders' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  const navItems = isOwner ? ownerNavItems : employeeNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive ? 'text-accent' : 'text-muted-foreground'
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
