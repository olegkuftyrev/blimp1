'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, FileText, Settings, BarChart3, Users, BookOpen } from "lucide-react";
import ProtectedRoute from '@/components/ProtectedRoute';

interface ChangelogEntry {
  date: string;
  version: string;
  author: string;
  changes: {
    type: 'feature' | 'improvement' | 'fix' | 'ui' | 'backend';
    title: string;
    description: string;
  }[];
}

const changelogData: ChangelogEntry[] = [
  {
    date: 'December 15, 2024',
    version: 'v1.4.0',
    author: 'Oleg',
    changes: [
      {
        type: 'ui',
        title: 'Dashboard Module Visibility',
        description: 'Hidden restricted and coming soon modules from dashboard to provide cleaner interface'
      },
      {
        type: 'improvement',
        title: 'Quick Actions Filtering',
        description: 'Quick actions now only show modules that users have access to based on their role'
      },
      {
        type: 'ui',
        title: 'Simplified Module Cards',
        description: 'Removed badges and complex conditional rendering from module cards'
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
        description: 'Added comprehensive practice test system for P&L calculations and financial metrics'
      },
      {
        type: 'improvement',
        title: 'User Role Management',
        description: 'Enhanced role-based access control across all modules'
      },
      {
        type: 'fix',
        title: 'Navigation Bug Fixes',
        description: 'Fixed issues with navigation state management and user preferences'
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
        description: 'Launched IDP module for personal and professional development tracking'
      },
      {
        type: 'backend',
        title: 'Database Optimization',
        description: 'Improved query performance and added new indexes for better response times'
      },
      {
        type: 'ui',
        title: 'Profile Page Redesign',
        description: 'Updated profile interface with better organization and user experience'
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
        description: 'Added comprehensive analytics and reporting capabilities for store performance'
      },
      {
        type: 'feature',
        title: 'Staff Management System',
        description: 'Implemented user creation, role assignment, and restaurant access management'
      },
      {
        type: 'improvement',
        title: 'Kitchen Management',
        description: 'Enhanced order tracking, timers, and kitchen operations workflow'
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
        description: 'Launched comprehensive profit and loss analysis tools for area management'
      },
      {
        type: 'backend',
        title: 'API Improvements',
        description: 'Enhanced backend API with better error handling and response formatting'
      },
      {
        type: 'ui',
        title: 'Mobile Responsiveness',
        description: 'Improved mobile experience across all modules and pages'
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
        description: 'Blimp Smart Table platform launched with core restaurant management features'
      },
      {
        type: 'feature',
        title: 'User Authentication',
        description: 'Implemented secure user authentication and role-based access control'
      },
      {
        type: 'feature',
        title: 'Dashboard Overview',
        description: 'Created central dashboard with quick actions and module overview'
      }
    ]
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'feature':
      return <FileText className="h-4 w-4" />;
    case 'improvement':
      return <Settings className="h-4 w-4" />;
    case 'fix':
      return <BarChart3 className="h-4 w-4" />;
    case 'ui':
      return <Users className="h-4 w-4" />;
    case 'backend':
      return <BookOpen className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'feature':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'improvement':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'fix':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'ui':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'backend':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

function ChangelogContent() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Project Changelog
          </h1>
          <p className="text-muted-foreground text-lg">
            Track all updates, improvements, and new features for Blimp Smart Table
          </p>
        </div>

        {/* Changelog Entries */}
        <div className="space-y-6">
          {changelogData.map((entry, index) => (
            <Card key={index} className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{entry.date}</span>
                    </div>
                    <Badge variant="outline" className="font-medium">
                      {entry.version}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{entry.author}</span>
                  </div>
                </div>
                <CardTitle className="text-xl mt-2">
                  Release {entry.version}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entry.changes.map((change, changeIndex) => (
                    <div key={changeIndex} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                      <div className={`p-2 rounded-lg border ${getTypeColor(change.type)}`}>
                        {getTypeIcon(change.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getTypeColor(change.type)}`}
                          >
                            {change.type.toUpperCase()}
                          </Badge>
                          <h4 className="font-semibold text-foreground">
                            {change.title}
                          </h4>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {change.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            For questions about updates or to report issues, contact{' '}
            <a 
              href="mailto:oleg@kuftyrev.us" 
              className="text-primary hover:underline"
            >
              oleg@kuftyrev.us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Changelog() {
  return (
    <ProtectedRoute>
      <ChangelogContent />
    </ProtectedRoute>
  );
}
