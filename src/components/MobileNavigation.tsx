import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  BookOpen, 
  Brain, 
  Users, 
  User,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  isOnline?: boolean;
  syncStatus?: 'synced' | 'syncing' | 'offline';
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  isOnline = true, 
  syncStatus = 'synced' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      requiresAuth: false
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: BookOpen,
      path: user ? '/impact-learn/dashboard' : '/impact-learn',
      requiresAuth: false
    },
    {
      id: 'ai',
      label: 'AI Tools',
      icon: Brain,
      path: '/ai-dashboard',
      requiresAuth: true
    },
    {
      id: 'community',
      label: 'Community',
      icon: Users,
      path: '/dashboard',
      requiresAuth: true
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: user ? '/dashboard' : '/auth',
      requiresAuth: false
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (item: typeof navItems[0]) => {
    if (item.requiresAuth && !user) {
      navigate('/auth');
      return;
    }
    navigate(item.path);
  };

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-3 w-3 animate-spin" />;
      case 'offline':
        return <WifiOff className="h-3 w-3" />;
      default:
        return <Wifi className="h-3 w-3" />;
    }
  };

  const getSyncColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'text-yellow-500';
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-green-500';
    }
  };

  return (
    <>
      {/* Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-2 md:hidden safe-area-top">
        <div className="flex items-center justify-between">
          <Logo size="sm" showText />
          
          <div className={cn("flex items-center space-x-1 text-xs", getSyncColor())}>
            {getSyncIcon()}
            <span className="capitalize">{syncStatus}</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden safe-area-bottom">
        <div className="grid grid-cols-5 h-16 bg-background">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 transition-colors bg-background",
                  "min-h-[44px] px-2 py-1",
                  active 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground active:bg-accent"
                )}
                disabled={item.requiresAuth && !user && !isOnline}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  active ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
                
                {/* Offline indicator for auth-required items */}
                {item.requiresAuth && !user && !isOnline && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16 md:hidden safe-area-bottom" />
    </>
  );
};

export default MobileNavigation;