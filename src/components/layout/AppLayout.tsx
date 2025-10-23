import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { HomeIcon, BookOpen, Sparkles, Users2, User } from 'lucide-react';

const navigationItems = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Learn', href: '/learn', icon: BookOpen },
  { name: 'AI Tools', href: '/ai-dashboard', icon: Sparkles },
  { name: 'Community', href: '/community', icon: Users2 },
  { name: 'Profile', href: '/profile', icon: User },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header - Responsive for both mobile and desktop */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-14 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/logo.svg" 
              alt="ImpactHub" 
              className="h-6 w-6" 
            />
            <span className="font-bold">ImpactHub</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-16">
        <div className="container px-4 py-6">
          {children}
        </div>
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden">
        <div className="container flex h-16 items-center justify-around px-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center",
                  isActive && "text-primary"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "mt-1 text-xs",
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar - Only visible on large screens */}
      <nav className="fixed left-0 top-14 hidden h-[calc(100vh-3.5rem)] w-64 border-r lg:block">
        <div className="space-y-4 py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-6 py-2",
                  isActive && "bg-accent text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Content Padding - Only visible on large screens */}
      <div className="hidden lg:block lg:pl-64" />
    </div>
  );
}

export default AppLayout;