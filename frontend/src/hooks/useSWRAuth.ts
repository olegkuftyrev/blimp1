import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import apiClient from '@/lib/axios';

// Types
interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: AuthUser;
  token: string;
}

// Fetcher functions for SWR
const fetcher = async (url: string) => {
  const response = await apiClient.get(url);
  return response.data;
};

// Mutation functions
const loginMutation = async (url: string, { arg }: { arg: LoginCredentials }) => {
  const response = await apiClient.post(url, arg);
  return response.data;
};

// Hook for checking current user (me endpoint)
export function useSWRCurrentUser() {
  const { 
    data: userData, 
    error, 
    isLoading,
    mutate
  } = useSWR(
    // Use a function to avoid hydration mismatch
    () => {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem('auth_token') ? '/simple-auth/me' : null;
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes - user data doesn't change often
      shouldRetryOnError: false, // Don't retry on 401 errors
      onSuccess: (data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR Auth User:', { 
            success: true, 
            user: data?.user?.email || 'unknown',
            role: data?.user?.role || 'unknown'
          });
        }
      },
      onError: (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR Auth Error:', error.message);
        }
        // On auth error, remove invalid token
        if (typeof window !== 'undefined' && error.message.includes('401')) {
          window.localStorage.removeItem('auth_token');
        }
      }
    }
  );

  return {
    user: userData?.user || null,
    loading: isLoading,
    error,
    mutate
  };
}

// Hook for login mutation
export function useSWRLogin() {
  const { 
    trigger: login, 
    isMutating: isLogging,
    error: loginError
  } = useSWRMutation(
    '/simple-auth/login',
    loginMutation,
    {
      onSuccess: (data: LoginResponse) => {
        console.log('✅ Login successful:', data.user.email);
        
        // Save token to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('auth_token', data.token);
        }
      },
      onError: (error) => {
        console.error('❌ Login failed:', error.message);
        
        // Clear any invalid tokens
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('auth_token');
        }
      }
    }
  );

  return {
    login,
    isLogging,
    loginError
  };
}

// Utility function for logout
export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('auth_token');
    // Redirect to login page
    window.location.href = '/auth';
  }
};
