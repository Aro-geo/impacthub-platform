import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'white' | 'gradient';
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className, 
  showText = false,
  variant = 'default'
}) => {
  const logoSize = sizeClasses[size];
  const textSize = textSizeClasses[size];
  
  const getLogoColors = () => {
    switch (variant) {
      case 'white':
        return {
          primary: '#ffffff',
          secondary: '#f1f5f9',
          accent: '#e2e8f0'
        };
      case 'gradient':
        return {
          primary: 'url(#logo-gradient)',
          secondary: 'url(#logo-gradient-2)',
          accent: 'url(#logo-gradient-3)'
        };
      default:
        return {
          primary: '#1e40af', // blue-700
          secondary: '#7c3aed', // violet-600
          accent: '#059669'    // emerald-600
        };
    }
  };

  const colors = getLogoColors();

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <div className={cn('relative flex-shrink-0', logoSize)}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="logo-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="logo-gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            
            {/* Drop Shadow Filter */}
            <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.1)" />
            </filter>
          </defs>

          {/* Main Circle Background */}
          <circle
            cx="32"
            cy="32"
            r="30"
            fill={colors.primary}
            filter="url(#drop-shadow)"
          />
          
          {/* Inner Design - Represents Impact Waves */}
          <g transform="translate(32, 32)">
            {/* Center Core - The Source of Impact */}
            <circle
              cx="0"
              cy="0"
              r="6"
              fill={variant === 'white' ? '#ffffff' : '#ffffff'}
            />
            
            {/* Impact Waves - Concentric Elements */}
            <circle
              cx="0"
              cy="0"
              r="12"
              fill="none"
              stroke={colors.secondary}
              strokeWidth="2"
              opacity="0.8"
            />
            
            <circle
              cx="0"
              cy="0"
              r="18"
              fill="none"
              stroke={colors.accent}
              strokeWidth="1.5"
              opacity="0.6"
            />
            
            {/* Directional Impact Arrows */}
            <g opacity="0.9">
              {/* Top Arrow */}
              <path
                d="M0,-20 L-3,-15 L-1,-15 L-1,-10 L1,-10 L1,-15 L3,-15 Z"
                fill={variant === 'white' ? '#ffffff' : '#ffffff'}
              />
              
              {/* Right Arrow */}
              <path
                d="M20,0 L15,3 L15,1 L10,1 L10,-1 L15,-1 L15,-3 Z"
                fill={variant === 'white' ? '#ffffff' : '#ffffff'}
              />
              
              {/* Bottom Arrow */}
              <path
                d="M0,20 L3,15 L1,15 L1,10 L-1,10 L-1,15 L-3,15 Z"
                fill={variant === 'white' ? '#ffffff' : '#ffffff'}
              />
              
              {/* Left Arrow */}
              <path
                d="M-20,0 L-15,-3 L-15,-1 L-10,-1 L-10,1 L-15,1 L-15,3 Z"
                fill={variant === 'white' ? '#ffffff' : '#ffffff'}
              />
            </g>
            
            {/* Corner Accent Dots */}
            <circle cx="14" cy="-14" r="2" fill={colors.accent} opacity="0.7" />
            <circle cx="14" cy="14" r="2" fill={colors.secondary} opacity="0.7" />
            <circle cx="-14" cy="14" r="2" fill={colors.primary} opacity="0.7" />
            <circle cx="-14" cy="-14" r="2" fill={colors.accent} opacity="0.7" />
          </g>
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className={cn(
            'font-heading font-bold leading-none',
            textSize,
            variant === 'white' ? 'text-white' : 'text-gray-900 dark:text-white'
          )}>
            Impact<span className={cn(
              variant === 'white' ? 'text-blue-200' : 'text-blue-600 dark:text-blue-400'
            )}>Hub</span>
          </h1>
          {size === 'xl' && (
            <p className={cn(
              'text-xs font-medium mt-1',
              variant === 'white' ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
            )}>
              Empowering Change
            </p>
          )}
        </div>
      )}
    </div>
  );
};