import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-avatar',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group'
          ],
          'chart-vendor': ['recharts'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'utility-vendor': [
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
            'date-fns',
            'lucide-react'
          ],
          'ui-enhancement-vendor': [
            'cmdk',
            'sonner',
            'vaul',
            'embla-carousel-react',
            'input-otp',
            'react-day-picker',
            'react-resizable-panels',
            'next-themes'
          ],
          // Feature-specific chunks
          'incident-analysis': [
            './src/services/incidentAnalysisService',

            './src/components/shared/SystemHealthMonitor',
            './src/utils/checkDatabaseSetup',
            './src/utils/testIncidentAnalysis'
          ]
        }
      }
    },
    // Increase chunk size warning limit to 500kb
    chunkSizeWarningLimit: 500,
    // Enable source maps for better debugging
    sourcemap: false,
    // Optimize for production
    minify: 'esbuild',
    target: 'es2020'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query'
    ],
    exclude: [
      'recharts' // Exclude heavy chart library from pre-bundling
    ]
  }
});