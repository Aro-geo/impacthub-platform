import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, BookOpen, Sparkles, Users, User } from 'lucide-react';

const navigationItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Learn', href: '/learn', icon: BookOpen },
  { name: 'AI Tools', href: '/ai-tools', icon: Sparkles },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Profile', href: '/profile', icon: User },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background px-4 lg:hidden">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;

        return (
          <Link
            key={item.name}
            to={item.href}
            className="flex flex-col items-center justify-center"
          >
            <Icon 
              className={cn(
                "h-5 w-5",
                isActive ? "text-primary" : "text-muted-foreground"
              )} 
            />
            <span 
              className={cn(
                "text-xs",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default MobileNav;