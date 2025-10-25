
import React, { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";

import LoadingSpinner from "@/components/ui/loading-spinner";
import { AppLayout } from "@/components/layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { useOffline } from "@/hooks/useOffline";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import { aiLearningObserver } from "@/services/aiLearningObserver";
import runDatabaseChecks from "@/utils/subjectDebugger";
import debugSimpleLessons from "@/utils/lessonDebugger";
import DatabaseOptimizer from "@/components/shared/DatabaseOptimizer";
import AppOptimizer from "@/components/shared/AppOptimizer";
import SessionStatusIndicator from "@/components/shared/SessionStatusIndicator";
import { serviceWorkerUtils } from "@/utils/serviceWorkerUtils";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useConnectionRecovery } from "@/hooks/useConnectionRecovery";
import EmergencyCacheClear from "@/components/shared/EmergencyCacheClear";

// Lazy load all page components for code splitting
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
const AdminTest = lazy(() => import("./pages/AdminTest"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AppContent = () => {
  const { isOnline, syncStatus } = useOffline();
  const { user } = useAuth();
  
  // Monitor page visibility for session validation
  usePageVisibility();
  
  // Enable session persistence
  useSessionPersistence();
  
  // Enable connection recovery
  useConnectionRecovery();

  // Run database checks when app starts in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Running database checks for debugging...');
      runDatabaseChecks();
      // Run specific lesson debugging
      debugSimpleLessons();
    }

    // Initialize session sync across tabs
    serviceWorkerUtils.syncSessionAcrossTabs();
  }, []);

  // AI Learning Observer will be initialized when user opens lessons

  // Include both database optimizers for enhanced performance
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {user && <DatabaseOptimizer />}
      {user && <AppOptimizer />}
      <SessionStatusIndicator />
      <Suspense fallback={<LoadingSpinner size="lg" text="Loading application..." />}>
        <AppLayout>
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
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
          <Route 
            path="/admin-test" 
            element={
              <Suspense fallback={<LoadingSpinner text="Loading Admin Test..." />}>
                <ProtectedRoute>
                  <AdminTest />
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
        </AppLayout>
      </Suspense>
      
      {/* Emergency cache clear for development */}
      {process.env.NODE_ENV === 'development' && <EmergencyCacheClear />}
    </div>
  );
};

const App = () => (
  <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
    <ThemeProvider defaultTheme="system" storageKey="impacthub-ui-theme">
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
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
