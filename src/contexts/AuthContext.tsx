
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { serviceWorkerUtils } from '@/utils/serviceWorkerUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: any | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string, grade?: number) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
  updateUserGrade: (grade: number) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionCheckInterval, setSessionCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Optimized profile fetching with caching
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, grade, avatar_url, role, created_at, updated_at') // Include role
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Check and refresh session if needed
  const checkAndRefreshSession = async () => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        // Clear invalid session
        setSession(null);
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
        return;
      }

      if (currentSession) {
        // Check if session is about to expire (within 5 minutes)
        const expiresAt = currentSession.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;

        if (timeUntilExpiry < 300) { // Less than 5 minutes
          console.log('Session expiring soon, refreshing...');
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Session refresh failed:', refreshError);
            // Force sign out if refresh fails
            await signOut();
            return;
          }

          if (refreshedSession) {
            setSession(refreshedSession);
            setUser(refreshedSession.user);
          }
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initialize session on mount
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
            const isAdminUser = profile?.role === 'admin' || session.user.email === 'geokullo@gmail.com';
            setIsAdmin(isAdminUser);

            // Set up periodic session check
            const interval = setInterval(checkAndRefreshSession, 2 * 60 * 1000);
            setSessionCheckInterval(interval);
          } else {
            setUserProfile(null);
            setIsAdmin(false);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
              const profile = await fetchUserProfile(session.user.id);
              setUserProfile(profile);
              const isAdminUser = profile?.role === 'admin' || session.user.email === 'geokullo@gmail.com';
              setIsAdmin(isAdminUser);

              // Set up periodic session check
              if (sessionCheckInterval) {
                clearInterval(sessionCheckInterval);
              }
              const interval = setInterval(checkAndRefreshSession, 2 * 60 * 1000);
              setSessionCheckInterval(interval);
            }
            break;
          
          case 'SIGNED_OUT':
            setSession(null);
            setUser(null);
            setUserProfile(null);
            setIsAdmin(false);
            if (sessionCheckInterval) {
              clearInterval(sessionCheckInterval);
              setSessionCheckInterval(null);
            }
            break;
          
          default:
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
              const profile = await fetchUserProfile(session.user.id);
              setUserProfile(profile);
              const isAdminUser = profile?.role === 'admin' || session.user.email === 'geokullo@gmail.com';
              setIsAdmin(isAdminUser);
            } else {
              setUserProfile(null);
              setIsAdmin(false);
            }
        }
        
        // Notify service worker about auth state change
        try {
          serviceWorkerUtils.notifyAuthStateChanged(!!session, session);
        } catch (error) {
          console.warn('Service worker notification failed:', error);
        }
        
        setLoading(false);
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name?: string, grade?: number) => {
    const redirectUrl = `${window.location.origin}/dashboard`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name || 'New User',
          grade: grade?.toString() || null,
        }
      }
    });

    // Profile creation will be handled by database trigger

    return { error };
  };

  const signOut = async () => {
    try {
      // Clear session check interval
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
        setSessionCheckInterval(null);
      }

      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear user state immediately
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsAdmin(false);
      
      // Broadcast session update to other tabs
      serviceWorkerUtils.broadcastSessionUpdate();
      
      // Redirect to landing page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Clear state even if signOut fails
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsAdmin(false);
      
      // Force redirect even if there's an error
      window.location.href = '/';
    }
  };

  const updateUserGrade = async (grade: number) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          grade: grade,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (!error) {
        // Refresh the profile data
        const profile = await fetchUserProfile(user.id);
        setUserProfile(profile);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    return { error };
  };

  const updateProfile = async (updates: any) => {
    if (!user) return { error: 'No user logged in' };

    try {
      // Update auth user metadata if needed
      if (updates.name || updates.avatar_url) {
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            name: updates.name,
            avatar_url: updates.avatar_url
          }
        });
        if (authError) return { error: authError };
      }

      // Update profile table
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (!error) {
        // Refresh the profile data
        const profile = await fetchUserProfile(user.id);
        setUserProfile(profile);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
      // Update admin status
      const isAdminUser = profile?.role === 'admin' || user.email === 'geokullo@gmail.com';
      setIsAdmin(isAdminUser);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    updateUserGrade,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
