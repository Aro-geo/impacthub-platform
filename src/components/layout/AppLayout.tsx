import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { HomeIcon, BookOpen, Sparkles, Users2, User, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer } from '@/components/ui/responsive-container';

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
  const [isOpen, setIsOpen] = React.useState(false);

  const NavigationContent = () => (
    <div className="space-y-4 py-4">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;

        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center space-x-3 px-6 py-2 hover:bg-accent/50 transition-colors",
              isActive && "bg-accent text-accent-foreground"
            )}
            onClick={() => setIsOpen(false)}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header - Responsive for both mobile and desktop */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ResponsiveContainer padding="sm">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="-ml-3 h-9 w-9">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <div className="flex h-14 items-center border-b px-4">
                    <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                      <img src="/logo.svg" alt="ImpactHub" className="h-6 w-6" />
                      <span className="font-bold">ImpactHub</span>
                    </Link>
                  </div>
                  <NavigationContent />
                </SheetContent>
              </Sheet>

              <Link to="/" className="flex items-center space-x-2 lg:hidden">
                <img src="/logo.svg" alt="ImpactHub" className="h-6 w-6" />
                <span className="font-bold">ImpactHub</span>
              </Link>
            </div>
          </div>
        </ResponsiveContainer>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar - Only visible on large screens */}
        <nav className="fixed left-0 top-14 hidden h-[calc(100vh-3.5rem)] w-64 border-r bg-background lg:block">
          <div className="h-full overflow-y-auto">
            <NavigationContent />
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 w-full">
          <ResponsiveContainer padding="md">
            <div className="py-6 lg:pl-64">
              {children}
            </div>
          </ResponsiveContainer>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;