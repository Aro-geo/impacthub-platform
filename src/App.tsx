
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LoadingSpinner from "@/components/ui/loading-spinner";
import MobileNavigation from "@/components/MobileNavigation";
import ProtectedRoute from "./components/ProtectedRoute";
import { useOffline } from "@/hooks/useOffline";

// Lazy load all page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AIDashboard = lazy(() => import("./pages/AIDashboard"));
const ImpactLearnIndex = lazy(() => import("./pages/ImpactLearnIndex"));
const ImpactLearnAuth = lazy(() => import("./pages/ImpactLearnAuth"));
const ImpactLearnDashboard = lazy(() => import("./pages/ImpactLearnDashboard"));
const ImpactLearnGuest = lazy(() => import("./pages/ImpactLearnGuest"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AppContent = () => {
  const { isOnline, syncStatus } = useOffline();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Suspense fallback={<LoadingSpinner size="lg" text="Loading application..." />}>
        <Routes>
          <Route 
            path="/" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading home page..." />}>
                <Index />
              </Suspense>
            } 
          />
          <Route 
            path="/auth" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading authentication..." />}>
                <Auth />
              </Suspense>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading dashboard..." />}>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </Suspense>
            } 
          />
          <Route 
            path="/ai-dashboard" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading AI dashboard..." />}>
                <ProtectedRoute>
                  <AIDashboard />
                </ProtectedRoute>
              </Suspense>
            } 
          />
          
          {/* ImpactLearn Routes */}
          <Route 
            path="/impact-learn" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading ImpactLearn..." />}>
                <ImpactLearnIndex />
              </Suspense>
            } 
          />
          <Route 
            path="/impact-learn/auth" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading ImpactLearn authentication..." />}>
                <ImpactLearnAuth />
              </Suspense>
            } 
          />
          <Route 
            path="/impact-learn/dashboard" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading ImpactLearn dashboard..." />}>
                <ProtectedRoute>
                  <ImpactLearnDashboard />
                </ProtectedRoute>
              </Suspense>
            } 
          />
          <Route 
            path="/impact-learn/guest" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading guest mode..." />}>
                <ImpactLearnGuest />
              </Suspense>
            } 
          />
          
          {/* Catch-all route */}
          <Route 
            path="*" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading page..." />}>
                <NotFound />
              </Suspense>
            } 
          />
        </Routes>
      </Suspense>
      
      {/* Mobile Navigation */}
      <MobileNavigation isOnline={isOnline} syncStatus={syncStatus} />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
