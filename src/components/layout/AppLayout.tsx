import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { HomeIcon, BookOpen, Sparkles, Users2, User, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer } from '@/components/ui/responsive-container';

import Navigation from '@/components/Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      <Navigation className="z-50" />
      
      {/* Main Content */}
      <main className="flex-1 w-full relative z-0">
        <ResponsiveContainer padding="md">
          <div className="py-6">
            {children}
          </div>
        </ResponsiveContainer>
      </main>
    </div>
  );
}

export default AppLayout;