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
  role: 'admin' | 'ops_lead' | 'black_shirt' | 'associate' | 'tablet';
  job_title?: string;
};

export type TeamMember = {
  id: number;
  email: string;
  fullName?: string | null;
  role: 'admin' | 'ops_lead' | 'black_shirt' | 'associate' | 'tablet';
  jobTitle?: string;
  restaurants?: Restaurant[];
  createdAt: string;
  updatedAt: string;
};

export type Restaurant = {
  id: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  ownerUserId?: number | null;
  createdAt: string;
  updatedAt: string;
};

// Roles Performance Types
export type RolePerformance = {
  id: number;
  name: string;
  displayName: string;
  description: string;
  trainingTimeFrame?: string | null;
  sortOrder: number;
};

export type PerformanceSection = {
  id: number;
  title: string;
  description?: string | null;
  sortOrder: number;
  items: PerformanceItem[];
};

export type PerformanceItem = {
  id: number;
  text: string;
  description?: string | null;
  sortOrder: number;
  globalQuestionId: string;
};

export type RolePerformanceWithSections = RolePerformance & {
  sections: PerformanceSection[];
};

export type UserPerformanceAnswer = {
  [itemId: number]: 'yes' | 'no';
};

export type RoleProgress = {
  roleId: number;
  roleName: string;
  totalItems: number;
  answeredItems: number;
  progressPercentage: number;
  yesAnswers: number;
  noAnswers: number;
  yesPercentage: number;
  isCompleted: boolean;
};

export type OverallProgress = {
  roles: RoleProgress[];
  overall: {
    totalRoles: number;
    completedRoles: number;
    totalItemsAcrossRoles: number;
    totalAnsweredAcrossRoles: number;
    totalYesAnswers: number;
    overallProgressPercentage: number;
  };
};

// IDP Types
export type IDPRole = {
  id: number;
  label: string;
  title: string;
  description?: string | null;
  userRole: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  competencies?: IDPCompetency[];
};

export type IDPCompetency = {
  id: number;
  roleId: number;
  competencyId: string;
  label: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: IDPQuestion[];
  actions?: IDPAction[];
  descriptions?: IDPDescription[];
};

export type IDPQuestion = {
  id: number;
  competencyId: number;
  questionId: string;
  question: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type IDPAction = {
  id: number;
  competencyId: number;
  actionId: string;
  action: string;
  measurement: string;
  startDate?: string | null;
  endDate?: string | null;
  responsible?: string[] | null;
  resources?: string[] | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type IDPDescription = {
  id: number;
  competencyId: number;
  type: 'overview' | 'definition' | 'examples' | 'behaviors';
  title: string;
  content: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type IDPAssessment = {
  id: number;
  userId: number;
  roleId: number;
  version: number;
  status: 'draft' | 'in_progress' | 'completed';
  isActive: boolean;
  startedAt?: string | null;
  completedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  role?: IDPRole;
  answers?: IDPAssessmentAnswer[];
};

export type IDPAssessmentAnswer = {
  id: number;
  assessmentId: number;
  questionId: number;
  answer: 'yes' | 'no';
  createdAt: string;
  updatedAt: string;
  question?: IDPQuestion;
};

export type IDPCompetencyScores = {
  [competencyId: string]: number;
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
    let responseText = '';
    try { 
      responseText = await res.text();
      err = JSON.parse(responseText);
    } catch (e) {
      console.log('Failed to parse response as JSON:', responseText);
    }
    console.error('API Error:', { 
      status: res.status, 
      statusText: res.statusText, 
      error: err,
      responseText: responseText,
      url: url,
      method: init?.method || 'GET'
    });
    throw new Error(err?.error || `Request failed: ${res.status}`);
  }
  try { return (await res.json()) as T; } catch { return undefined as unknown as T; }
}

export const AuthAPI = {
  signIn: (email: string, password: string) =>
    apiFetch<{ user: AuthUser; token: string }>('auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiFetch<void>('auth/logout', { method: 'POST' }),
  me: () => apiFetch<{ user: AuthUser; restaurant_ids: number[] }>('auth/me'),
  updateProfile: (data: { fullName?: string; jobTitle?: string; email?: string }) =>
    apiFetch<{ user: AuthUser }>('auth/profile', {
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
  getTeamMembers: () =>
    apiFetch<{ success: boolean; data: TeamMember[]; message?: string }>('users/team'),
};

export const IDPAPI = {
  // Get all available roles
  getRoles: () =>
    apiFetch<{ data: IDPRole[]; message: string }>('idp/roles'),

  // Get role by user role with competencies, questions, actions, and descriptions
  getRoleByUserRole: (userRole: string) =>
    apiFetch<{ data: IDPRole; message: string }>(`idp/roles/${userRole}`),

  // Get current user's role (automatically uses their role)
  getCurrentUserRole: () =>
    apiFetch<{ data: IDPRole; message: string }>('idp/role/current'),

  // Get current user's active assessment or create new one
  getCurrentAssessment: () =>
    apiFetch<{ data: IDPAssessment; message: string }>('idp/assessment/current'),

  // Get a specific user's assessment (with permission check)
  getUserAssessment: (userId: number) =>
    apiFetch<{ data: { user: AuthUser; assessment: IDPAssessment | null; scores?: IDPCompetencyScores }; message: string }>(`idp/assessment/user/${userId}`),

  // Save assessment answers
  saveAnswers: (answers: { [questionId: number]: 'yes' | 'no' }) =>
    apiFetch<{ message: string }>('idp/assessment/answers', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  // Complete assessment and get results
  completeAssessment: () =>
    apiFetch<{ data: { assessment: IDPAssessment; scores: IDPCompetencyScores }; message: string }>('idp/assessment/complete', {
      method: 'POST',
    }),

  // Reset assessment (delete current assessment and all answers)
  resetAssessment: () =>
    apiFetch<{ message: string }>('idp/assessment/reset', {
      method: 'POST',
    }),
};

export const RolesPerformanceAPI = {
  // Get all available roles
  getRoles: () =>
    apiFetch<{ success: boolean; data: RolePerformance[] }>('roles-performance'),

  // Get role details with sections and items
  getRole: (roleId: number) =>
    apiFetch<{ success: boolean; data: RolePerformanceWithSections }>(`roles-performance/${roleId}`),

  // Get user's answers for a specific role
  getUserAnswers: (roleId: number) =>
    apiFetch<{ success: boolean; data: { roleId: number; userId: number; answers: UserPerformanceAnswer } }>(`roles-performance/${roleId}/answers`),

  // Save user's answer to a performance item
  saveAnswer: (roleId: number, answer: 'yes' | 'no') =>
    apiFetch<{ success: boolean; data: { message: string; answer: any; syncedGlobally: boolean } }>(`roles-performance/${roleId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }),

  // Save multiple answers for a role (for manager editing)
  saveAnswersBulk: (roleId: number, answers: { [itemId: number]: 'yes' | 'no' }, targetUserId?: number) =>
    apiFetch<{ success: boolean; data: { message: string; savedAnswers: any[]; errors?: string[]; totalProcessed: number } }>(`roles-performance/${roleId}/answers/bulk`, {
      method: 'POST',
      body: JSON.stringify({ answers, targetUserId }),
    }),

  // Get user's progress for a specific role
  getUserProgress: (roleId: number) =>
    apiFetch<{ success: boolean; data: RoleProgress }>(`roles-performance/${roleId}/progress`),

  // Get user's overall progress across all roles
  getOverallProgress: () =>
    apiFetch<{ success: boolean; data: OverallProgress }>('roles-performance/progress/overall'),
};
