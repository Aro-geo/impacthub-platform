
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, CreditCard, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import FloatingAuthModal from '@/components/FloatingAuthModal';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme, actualTheme } = useTheme();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthAction = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  const getFirstName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.name) {
      const names = user.user_metadata.name.split(' ');
      return names.length > 1 ? `${names[0][0]}${names[1][0]}` : names[0][0];
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button
                onClick={() => navigate('/')}
                className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg p-1"
              >
                <Logo size="lg" showText />
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#features" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Features
              </a>
              <a href="#impact" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Impact
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Contact
              </a>
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Welcome Message */}
                <div className="hidden md:block">
                  <span className="text-sm text-muted-foreground">Welcome back,</span>
                  <span className="text-sm font-medium text-foreground ml-1">{getFirstName()}!</span>
                </div>

                {/* Quick Action Buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAuthAction}
                >
                  Dashboard
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/ai-dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  AI Tools
                </Button>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end" forceMount>
                    {/* User Info Section */}
                    <div className="flex items-center space-x-3 p-4 border-b border-border">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {user.user_metadata?.name || getFirstName()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <DropdownMenuItem 
                        className="cursor-pointer p-3 rounded-lg"
                        onClick={() => navigate('/profile')}
                      >
                        <User className="mr-3 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        className="cursor-pointer p-3 rounded-lg"
                        onClick={() => navigate('/settings')}
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        className="cursor-pointer p-3 rounded-lg"
                        onClick={() => navigate('/pricing')}
                      >
                        <CreditCard className="mr-3 h-4 w-4" />
                        <span>Plan & Pricing</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="my-2" />

                      {/* Theme Selection */}
                      <div className="px-3 py-2">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Theme</p>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={theme === 'light' ? 'default' : 'ghost'}
                            size="sm"
                            className="flex-1 h-8"
                            onClick={() => setTheme('light')}
                          >
                            <Sun className="mr-2 h-3 w-3" />
                            Light
                          </Button>
                          <Button
                            variant={theme === 'dark' ? 'default' : 'ghost'}
                            size="sm"
                            className="flex-1 h-8"
                            onClick={() => setTheme('dark')}
                          >
                            <Moon className="mr-2 h-3 w-3" />
                            Dark
                          </Button>
                          <Button
                            variant={theme === 'system' ? 'default' : 'ghost'}
                            size="sm"
                            className="flex-1 h-8"
                            onClick={() => setTheme('system')}
                          >
                            <Monitor className="mr-2 h-3 w-3" />
                            Auto
                          </Button>
                        </div>
                      </div>

                      <DropdownMenuSeparator className="my-2" />

                      <DropdownMenuItem 
                        className="cursor-pointer p-3 rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                        onClick={signOut}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <Button onClick={handleAuthAction}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Auth Modal */}
      <FloatingAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signup"
      />
    </nav>
  );
};

export default Navigation;
