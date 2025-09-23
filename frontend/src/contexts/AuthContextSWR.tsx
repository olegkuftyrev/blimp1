'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useSWRCurrentUser, useSWRLogin, logoutUser } from '@/hooks/useSWRAuth';
import { mutate } from 'swr';

// Keep the same interface as the old AuthContext
interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: 'admin' | 'ops_lead' | 'black_shirt' | 'associate' | 'tablet';
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProviderSWR({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  
  // Prevent hydration mismatch by only running SWR on client
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const { user, loading, error, mutate: mutateUser } = useSWRCurrentUser();
  const { login: loginMutation, isLogging, loginError } = useSWRLogin();

  // Combine loading states - show loading until mounted and SWR is ready
  const isLoading = !mounted || loading || isLogging;

  const login = async (email: string, password: string) => {
    try {
      const response = await loginMutation({ email, password });
      
      // After successful login, refresh user data
      await mutateUser();
      
      console.log('🎉 Login completed successfully');
      return response;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw new Error(loginError?.message || error.message || 'Login failed');
    }
  };

  const logout = () => {
    console.log('👋 Logging out...');
    
    // Clear SWR cache for auth-related data
    mutate(
      key => typeof key === 'string' && key.includes('//'),
      undefined,
      { revalidate: false }
    );
    
    // Use utility function to clear localStorage and redirect
    logoutUser();
  };

  const checkAuth = async () => {
    try {
      // SWR handles this automatically, but we can force a refresh
      await mutateUser();
    } catch (error) {
      console.error('Auth check failed:', error);
      // SWR will handle token cleanup automatically
    }
  };

  // Log auth state changes for debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Auth state changed:', {
        hasUser: !!user,
        userEmail: user?.email,
        userRole: user?.role,
        isLoading,
        hasError: !!error
      });
    }
  }, [user, isLoading, error]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthSWR() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthSWR must be used within an AuthProviderSWR');
  }
  return context;
}

// Alias for backward compatibility
export const useAuth = useAuthSWR;
