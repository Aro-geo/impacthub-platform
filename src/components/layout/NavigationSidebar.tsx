import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Home, Book, Users, Settings, BarChart } from 'lucide-react';

interface NavigationSidebarProps {
  mobile?: boolean;
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Learn', href: '/learn', icon: Book },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function NavigationSidebar({ mobile = false }: NavigationSidebarProps) {
  const location = useLocation();

  return (
    <div className={cn(
      "flex h-full w-72 flex-col border-r bg-card px-2",
      mobile ? "pb-8" : "pb-12"
    )}>
      <div className="flex h-16 items-center border-b px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          {/* Add your logo here */}
          Impact Hub
        </Link>
      </div>

      <div className="flex-1 space-y-1 p-2">
        <nav className="grid gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
                  isActive ? "bg-accent" : "transparent"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t p-4">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}

export default NavigationSidebar;