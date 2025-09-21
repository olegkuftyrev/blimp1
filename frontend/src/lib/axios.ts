import axios from 'axios';

// API configuration
// In development, Next.js proxies /api/* to the backend
// In production, use the full backend URL
export const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL || '/api'
    : '/api';

export const getApiUrl = (endpoint: string) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // If we have a full URL (production), append /api prefix
  if (API_BASE_URL.startsWith('http')) {
    return `${API_BASE_URL}/api/${cleanEndpoint}`;
  }
  
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? (process.env.NEXT_PUBLIC_API_URL || '/api')
    : '/api', // Use Next.js proxy in development
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Read token from localStorage on client
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Debug logging (only for errors or important info)
      if (process.env.NODE_ENV === 'development' && process.env.DEBUG_API) {
        console.log('Axios request:', {
          url: config.url,
          baseURL: config.baseURL,
          hasToken: !!token,
          fullUrl: `${config.baseURL}${config.url}`
        });
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Only log successful responses if DEBUG_API is enabled
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_API) {
      console.log('Axios response:', {
        status: response.status,
        url: response.config.url,
        dataLength: JSON.stringify(response.data).length
      });
    }
    return response;
  },
  (error) => {
    // Always log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Axios API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        error: error.response?.data?.error || error.message,
        method: error.config?.method?.toUpperCase()
      });
    }
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('auth_token');
        // Optionally redirect to login
        // window.location.href = '/auth';
      }
    }
    
    // Extract error message from response
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'An error occurred';
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
