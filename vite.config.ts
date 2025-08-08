import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React vendor chunk
          'react-vendor': ['react', 'react-dom'],
          
          // Router vendor chunk
          'router-vendor': ['react-router-dom'],
          
          // Query vendor chunk
          'query-vendor': ['@tanstack/react-query'],
          
          // UI vendor chunk (Radix UI components)
          'ui-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip'
          ],
          
          // Supabase vendor chunk
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Form and validation vendor chunk
          'form-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          
          // Utility vendor chunk
          'utility-vendor': [
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
            'date-fns',
            'lucide-react'
          ],
          
          // Chart and visualization vendor chunk
          'chart-vendor': ['recharts'],
          
          // UI enhancement vendor chunk
          'ui-enhancement-vendor': [
            'cmdk',
            'sonner',
            'vaul',
            'next-themes',
            'embla-carousel-react',
            'react-day-picker',
            'react-resizable-panels',
            'input-otp',
            'tailwindcss-animate'
          ]
        }
      }
    },
    // Set chunk size warning limit to 300KB
    chunkSizeWarningLimit: 300,
    // Enable source maps for better debugging
    sourcemap: mode === 'development',
    // Optimize for production
    minify: mode === 'production' ? 'esbuild' : false,
    // Target modern browsers for better optimization
    target: 'es2020'
  }
}));
