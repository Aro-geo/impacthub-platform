
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import LoadingSpinner from "@/components/ui/loading-spinner";
import MobileNavigation from "@/components/MobileNavigation";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { useOffline } from "@/hooks/useOffline";
import { aiLearningObserver } from "@/services/aiLearningObserver";

// Lazy load all page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AIDashboard = lazy(() => import("./pages/AIDashboard"));
const ImpactLearnIndex = lazy(() => import("./pages/ImpactLearnIndex"));
const ImpactLearnAuth = lazy(() => import("./pages/ImpactLearnAuth"));
const ImpactLearnDashboard = lazy(() => import("./pages/ImpactLearnDashboard"));
const ImpactLearnGuest = lazy(() => import("./pages/ImpactLearnGuest"));
const SimpleLessonDashboard = lazy(() => import("./pages/SimpleLessonDashboard"));
const Community = lazy(() => import("./pages/Community"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const IncidentAnalysis = lazy(() => import("./pages/IncidentAnalysis"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminDashboardTest = lazy(() => import("./pages/AdminDashboardTest"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AppContent = () => {
  const { isOnline, syncStatus } = useOffline();

  // Initialize AI learning observer when app starts
  React.useEffect(() => {
    aiLearningObserver.initializeAutoConnection();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
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
          <Route 
            path="/simple-lessons" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading Simple Lesson Dashboard..." />}>
                <ProtectedRoute>
                  <SimpleLessonDashboard />
                </ProtectedRoute>
              </Suspense>
            } 
          />
          <Route 
            path="/community" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading Community..." />}>
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              </Suspense>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading Profile..." />}>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </Suspense>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading Settings..." />}>
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              </Suspense>
            } 
          />
          <Route 
            path="/incident-analysis" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading Incident Analysis..." />}>
                <ProtectedRoute>
                  <IncidentAnalysis />
                </ProtectedRoute>
              </Suspense>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading Admin Panel..." />}>
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              </Suspense>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading Admin Dashboard..." />}>
                <ProtectedRoute>
                  <AdminDashboardTest />
                </ProtectedRoute>
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
  <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
