// API configuration
// In development, Next.js proxies /api/* to the backend
// In production, use the full backend URL
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || 'http://64.23.169.176:3333'
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
