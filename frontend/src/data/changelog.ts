export interface ChangelogEntry {
  date: string;
  version: string;
  author: string;
  changes: {
    type: 'feature' | 'improvement' | 'fix' | 'ui' | 'backend';
    title: string;
    description: string;
    pages?: string[];
  }[];
}

export const changelogData: ChangelogEntry[] = [
  {
    date: 'December 18, 2024',
    version: 'v1.4.0.1',
    author: 'Oleg',
    changes: [
      {
        type: 'improvement',
        title: 'Changelog ',
        description: 'Added search, filtering, pagination, and page-based filtering to the changelog for better user experience',
        pages: ['Changelog']
      },
      {
        type: 'ui',
        title: 'Data Structure Improvements',
        description: 'Extracted changelog data to separate file for better maintainability and added page categorization',
        pages: ['Changelog', 'General UI']
      },
      {
        type: 'fix',
        title: 'Navigation State Management',
        description: 'Improved navigation state handling and user preference persistence across page refreshes',
        pages: ['Navigation']
      }
    ]
  },
  {
    date: 'December 15, 2024',
    version: 'v1.4.0',
    author: 'Oleg',
    changes: [
      {
        type: 'ui',
        title: 'Dashboard Module Visibility',
        description: 'Hidden restricted and coming soon modules from dashboard to provide cleaner interface',
        pages: ['Dashboard']
      },
      {
        type: 'improvement',
        title: 'Quick Actions Filtering',
        description: 'Quick actions now only show modules that users have access to based on their role',
        pages: ['Dashboard', 'Navigation']
      },
      {
        type: 'ui',
        title: 'Simplified Module Cards',
        description: 'Removed badges and complex conditional rendering from module cards',
        pages: ['Dashboard', 'General UI']
      }
    ]
  },
  {
    date: 'December 10, 2024',
    version: 'v1.3.2',
    author: 'Oleg',
    changes: [
      {
        type: 'feature',
        title: 'P&L Practice Tests',
        description: 'Added comprehensive practice test system for P&L calculations and financial metrics',
        pages: ['P&L Practice Tests']
      },
      {
        type: 'improvement',
        title: 'User Role Management',
        description: 'Enhanced role-based access control across all modules',
        pages: ['Staff Management', 'Authentication']
      },
      {
        type: 'fix',
        title: 'Navigation Bug Fixes',
        description: 'Fixed issues with navigation state management and user preferences',
        pages: ['Navigation']
      }
    ]
  },
  {
    date: 'December 5, 2024',
    version: 'v1.3.1',
    author: 'Oleg',
    changes: [
      {
        type: 'feature',
        title: 'Individual Development Plan',
        description: 'Launched IDP module for personal and professional development tracking',
        pages: ['Individual Development Plan']
      },
      {
        type: 'backend',
        title: 'Database Optimization',
        description: 'Improved query performance and added new indexes for better response times',
        pages: ['Database', 'API']
      },
      {
        type: 'ui',
        title: 'Profile Page Redesign',
        description: 'Updated profile interface with better organization and user experience',
        pages: ['Profile']
      }
    ]
  },
  {
    date: 'November 28, 2024',
    version: 'v1.2.0',
    author: 'Oleg',
    changes: [
      {
        type: 'feature',
        title: 'Analytics Dashboard',
        description: 'Added comprehensive analytics and reporting capabilities for store performance',
        pages: ['Analytics']
      },
      {
        type: 'feature',
        title: 'Staff Management System',
        description: 'Implemented user creation, role assignment, and restaurant access management',
        pages: ['Staff Management']
      },
      {
        type: 'improvement',
        title: 'Kitchen Management',
        description: 'Enhanced order tracking, timers, and kitchen operations workflow',
        pages: ['Kitchen Management']
      }
    ]
  },
  {
    date: 'November 20, 2024',
    version: 'v1.1.0',
    author: 'Oleg',
    changes: [
      {
        type: 'feature',
        title: 'Area P&L Analysis',
        description: 'Launched comprehensive profit and loss analysis tools for area management',
        pages: ['Area P&L']
      },
      {
        type: 'backend',
        title: 'API Improvements',
        description: 'Enhanced backend API with better error handling and response formatting',
        pages: ['API']
      },
      {
        type: 'ui',
        title: 'Mobile Responsiveness',
        description: 'Improved mobile experience across all modules and pages',
        pages: ['General UI']
      }
    ]
  },
  {
    date: 'November 10, 2024',
    version: 'v1.0.0',
    author: 'Oleg',
    changes: [
      {
        type: 'feature',
        title: 'Initial Launch',
        description: 'Blimp Smart Table platform launched with core restaurant management features',
        pages: ['General UI']
      },
      {
        type: 'feature',
        title: 'User Authentication',
        description: 'Implemented secure user authentication and role-based access control',
        pages: ['Authentication']
      },
      {
        type: 'feature',
        title: 'Dashboard Overview',
        description: 'Created central dashboard with quick actions and module overview',
        pages: ['Dashboard']
      }
    ]
  }
];

export const changeTypes = [
  { value: 'feature', label: 'Feature', icon: 'FileText', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'improvement', label: 'Improvement', icon: 'Settings', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'fix', label: 'Fix', icon: 'BarChart3', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'ui', label: 'UI', icon: 'Users', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'backend', label: 'Backend', icon: 'BookOpen', color: 'bg-orange-100 text-orange-800 border-orange-200' }
] as const;

export const availablePages = [
  'Dashboard',
  'Staff Management',
  'Analytics',
  'Kitchen Management',
  'Area P&L',
  'P&L Practice Tests',
  'Individual Development Plan',
  'Profile',
  'Navigation',
  'Authentication',
  'API',
  'Database',
  'General UI',
  'Changelog'
] as const;
