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

export type AuthUser = {
  id: number;
  email: string;
  fullName?: string | null;
  role: 'admin' | 'ops_lead' | 'black_shirt' | 'associate';
  job_title?: string;
};

export async function apiFetch<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const url = getApiUrl(endpoint);
  // Read token from localStorage on client to attach Authorization header
  let authHeader: Record<string, string> = {}
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('auth_token')
    if (token) authHeader = { Authorization: `Bearer ${token}` }
  }
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...(init?.headers || {}),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    let err: any = null;
    try { err = await res.json(); } catch {}
    throw new Error(err?.error || `Request failed: ${res.status}`);
  }
  try { return (await res.json()) as T; } catch { return undefined as unknown as T; }
}

export const AuthAPI = {
  signIn: (email: string, password: string) =>
    apiFetch<{ user: AuthUser; token: string }>('simple-auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiFetch<void>('auth/logout', { method: 'POST' }),
  me: () => apiFetch<{ user: AuthUser; restaurant_ids: number[] }>('simple-auth/me'),
  updateProfile: (data: { fullName?: string; jobTitle?: string; email?: string }) =>
    apiFetch<{ user: AuthUser }>('simple-auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  signUpInvite: (code: string, email: string, password: string, fullName?: string) =>
    apiFetch<{ user: AuthUser; token?: unknown }>('auth/sign-up-invite', {
      method: 'POST',
      body: JSON.stringify({ code, email, password, full_name: fullName }),
    }),
  createInvite: (role: 'black_shirt' | 'associate', restaurantId?: number) =>
    apiFetch<{ code: string; role: string; restaurant_id?: number }>('invites', {
      method: 'POST',
      body: JSON.stringify({ role, restaurant_id: restaurantId }),
    }),
};
