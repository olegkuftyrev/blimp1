// Centralized navigation metadata derived from ImprovedNavigation.tsx

export type UserRole = 'admin' | 'ops_lead' | 'black_shirt' | 'associate' | 'tablet';

export type NavSection =
  | 'dashboard'
  | 'management'
  | 'p_and_l'
  | 'learning'
  | 'more'
  | 'profile';

// Icon identifiers to be mapped to actual components in the renderer
export type IconName =
  | 'home'
  | 'settings'
  | 'chefHat'
  | 'users'
  | 'banknote'
  | 'barChart3'
  | 'dollarSign'
  | 'bookOpen'
  | 'calculator'
  | 'clipboardList'
  | 'shield'
  | 'calendar'
  | 'truck'
  | 'messageSquare'
  | 'trendingUp'
  | 'user';

export interface NavigationItem {
  id: string;
  section: NavSection;
  title: string;
  href: string;
  description: string;
  icon: IconName;
  color: string; // Tailwind color token (e.g., "blue-600") from shadcn colors
  rolesAllowed?: UserRole[]; // if omitted, visible to all roles
  rolesExcluded?: UserRole[]; // optional explicit exclusions
  comingSoon?: boolean;
  order?: number;
}

export const navigationItems: NavigationItem[] = [
  // Dashboard
  {
    id: 'dashboard',
    section: 'dashboard',
    title: 'Dashboard',
    href: '/dashboard',
    description: 'Overview and quick access to key areas',
    icon: 'home',
    color: 'blue-600',
    order: 0,
  },

  // Management
  {
    id: 'kitchen',
    section: 'management',
    title: 'Kitchen Management',
    href: '/kitchen',
    description: 'Order tracking, timers, and kitchen operations',
    icon: 'chefHat',
    color: 'emerald-600',
    rolesAllowed: ['admin', 'ops_lead', 'black_shirt'],
    order: 1,
  },
  {
    id: 'staff',
    section: 'management',
    title: 'Staff Management',
    href: '/staff',
    description: 'User creation, role assignment, and restaurant access',
    icon: 'users',
    color: 'teal-600',
    rolesAllowed: ['admin', 'ops_lead',  'black_shirt'],
    order: 2,
  },
  {
    id: 'pay-structure',
    section: 'management',
    title: 'Pay Structure',
    href: '/pay-structure',
    description: 'Manage hourly pay rates across all regions and roles',
    icon: 'banknote',
    color: 'cyan-600',
    rolesAllowed: ['admin', 'ops_lead'],
    order: 3,
  },

  // P&L
  {
    id: 'analytics',
    section: 'p_and_l',
    title: 'Analytics & Reports',
    href: '/analytics',
    description: 'Sales reports, performance metrics',
    icon: 'barChart3',
    color: 'sky-600',
    // rolesExcluded: ['associate'], hidden for associate
    order: 1,
  },
  {
    id: 'area-pl',
    section: 'p_and_l',
    title: 'Area P&L',
    href: '/area-pl',
    description: 'Comprehensive profit and loss analysis for your area',
    icon: 'dollarSign',
    color: 'indigo-600',
    rolesAllowed: ['admin', 'ops_lead'],
    order: 2,
  },

  // Learning
  {
    id: 'idp',
    section: 'learning',
    title: 'Individual Development Plan',
    href: '/idp',
    description: 'Personal and professional development planning',
    icon: 'bookOpen',
    color: 'violet-600',
    order: 1,
  },
  {
    id: 'pl-practice-tests',
    section: 'learning',
    title: 'P&L Practice Tests',
    href: '/pl-practice-tests',
    description: 'Test your knowledge of P&L calculations and financial metrics',
    icon: 'calculator',
    color: 'purple-600',
    order: 2,
  },
  {
    id: 'roles-performance',
    section: 'learning',
    title: 'Roles Performance',
    href: '/roles-performance',
    description: 'Performance tracking, role assessment, and team analytics',
    icon: 'clipboardList',
    color: 'fuchsia-600',
    order: 3,
  },
  {
    id: 'compliance',
    section: 'learning',
    title: 'Grow Camp',
    href: '/compliance',
    description: 'Training programs, skill development',
    icon: 'shield',
    color: 'pink-600',
    comingSoon: true,
    order: 4,
  },

  // More
  {
    id: 'delivery',
    section: 'more',
    title: '1k Usage',
    href: '/delivery',
    description: 'Usage analytics, metrics tracking',
    icon: 'truck',
    color: 'rose-600',
    comingSoon: true,
    order: 1,
  },
  {
    id: 'customer',
    section: 'more',
    title: 'SMG Analytics',
    href: '/customer',
    description: 'Service management analytics',
    icon: 'messageSquare',
    color: 'red-600',
    comingSoon: true,
    order: 2,
  },
  {
    id: 'scheduling',
    section: 'more',
    title: 'Blimp Store',
    href: '/scheduling',
    description: 'Store management, inventory',
    icon: 'calendar',
    color: 'orange-600',
    comingSoon: true,
    order: 3,
  },
  {
    id: 'todo',
    section: 'more',
    title: 'Personal Agenda',
    href: '/agenda',
    description: 'Tasks, notes, and personal agenda',
    icon: 'calendar',
    color: 'orange-600',
    comingSoon: true,
    order: 3,
  },
  {
    id: 'changelog',
    section: 'more',
    title: 'Project Updates',
    href: '/changelog',
    description: 'Track all updates, improvements, and new features',
    icon: 'bookOpen',
    color: 'lime-600',
    order: 4,
  },

  // Profile dropdown (right side)
  {
    id: 'profile-my-profile',
    section: 'profile',
    title: 'My Profile',
    href: '/profile?tab=my-profile',
    description: 'View and edit your personal information',
    icon: 'user',
    color: 'amber-600',
    order: 1,
  },
  {
    id: 'profile-idp',
    section: 'profile',
    title: 'Individual Development Plan',
    href: '/profile?tab=idp',
    description: 'Track your professional development goals',
    icon: 'bookOpen',
    color: 'lime-600',
    order: 2,
  },
  {
    id: 'profile-performance',
    section: 'profile',
    title: 'My Performance',
    href: '/profile?tab=performance',
    description: 'View your competency mastery and performance metrics',
    icon: 'trendingUp',
    color: 'green-600',
    order: 3,
  },
  {
    id: 'profile-team',
    section: 'profile',
    title: 'Team Management',
    href: '/profile?tab=team',
    description: 'Manage your team and staff members',
    icon: 'users',
    color: 'slate-600',
    rolesAllowed: ['admin', 'ops_lead', 'black_shirt'],
    order: 4,
  },
];

export function isItemVisibleForRole(item: NavigationItem, role?: UserRole | null): boolean {
  if (!role) return true;
  if (item.rolesExcluded && item.rolesExcluded.includes(role)) return false;
  if (item.rolesAllowed && !item.rolesAllowed.includes(role)) return false;
  return true;
}

export function getItemsBySection(section: NavSection, role?: UserRole | null): NavigationItem[] {
  return navigationItems
    .filter((i) => i.section === section)
    .filter((i) => isItemVisibleForRole(i, role))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}


