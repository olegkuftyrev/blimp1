'use client';

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChefHat, 
  Users, 
  BarChart3, 
  Settings, 
  Calendar,
  DollarSign,
  Truck,
  ClipboardList,
  MessageSquare,
  Shield,
  Banknote,
  BookOpen
} from "lucide-react";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

interface ModuleCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  badge?: string;
  isActive: boolean;
}

const modules: ModuleCard[] = [
  {
    id: 'kitchen',
    title: 'Kitchen Management',
    description: 'Order tracking, timers, and kitchen operations',
    icon: ChefHat,
    href: '/kitchen',
    color: 'bg-orange-500',
    badge: 'Active',
    isActive: true
  },
  {
    id: 'staff',
    title: 'Staff Management',
    description: 'User creation, role assignment, and restaurant access',
    icon: Users,
    href: '/staff',
    color: 'bg-blue-500',
    badge: 'Active',
    isActive: true
  },
  {
    id: 'pay-structure',
    title: 'Pay Structure',
    description: 'Manage hourly pay rates across all regions and roles',
    icon: Banknote,
    href: '/pay-structure',
    color: 'bg-cyan-500',
    badge: 'Active',
    isActive: true
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    description: 'Sales reports, performance metrics, and insights',
    icon: BarChart3,
    href: '/analytics',
    color: 'bg-green-500',
    badge: 'Coming Soon',
    isActive: false
  },
  {
    id: 'roles-performance',
    title: 'Roles Performance',
    description: 'Performance tracking, role assessment, and team analytics',
    icon: ClipboardList,
    href: '/roles-performance',
    color: 'bg-purple-500',
    badge: 'Active',
    isActive: true
  },
  {
    id: 'finance',
    title: 'P&L Practice Tests',
    description: 'Revenue tracking, expenses, and financial reports',
    icon: DollarSign,
    href: '/finance',
    color: 'bg-emerald-500',
    badge: 'Coming Soon',
    isActive: false
  },
  {
    id: 'idp',
    title: 'Individual Development Plant',
    description: 'Personal and professional development planning and tracking',
    icon: BookOpen,
    href: '/idp',
    color: 'bg-teal-500',
    badge: 'Active',
    isActive: true
  },
  {
    id: 'delivery',
    title: '1k Usage',
    description: 'Usage analytics, metrics tracking, and performance insights',
    icon: Truck,
    href: '/delivery',
    color: 'bg-yellow-500',
    badge: 'Coming Soon',
    isActive: false
  },
  {
    id: 'customer',
    title: 'SMG Analytics',
    description: 'Service management analytics, customer insights, and feedback analysis',
    icon: MessageSquare,
    href: '/customer',
    color: 'bg-pink-500',
    badge: 'Coming Soon',
    isActive: false
  },
  {
    id: 'compliance',
    title: 'Grow Camp',
    description: 'Training programs, skill development, and growth initiatives',
    icon: Shield,
    href: '/compliance',
    color: 'bg-red-500',
    badge: 'Coming Soon',
    isActive: false
  },
  {
    id: 'scheduling',
    title: 'Blimp Store',
    description: 'Store management, inventory, and product catalog',
    icon: Calendar,
    href: '/scheduling',
    color: 'bg-indigo-500',
    badge: 'Coming Soon',
    isActive: false
  }
];

function DashboardContent() {
  const { user } = useAuth();
  
  // Filter modules based on user role and organize by categories
  const getCategorizedModules = () => {
    if (!user) return { management: modules.slice(0, 3), helpers: [], others: [] };
    
    let filteredModules = modules;
    
    // Both Pay Structure and Staff Management are visible to all but with different properties based on role
    filteredModules = filteredModules.map(module => {
      if (module.id === 'pay-structure') {
        const isAuthorized = ['admin', 'ops_lead'].includes(user.role);
        return {
          ...module,
          badge: isAuthorized ? 'Active' : 'Restricted',
          description: isAuthorized ? 'Manage hourly pay rates across all regions and roles' : 'Unlocked for ACO and above',
          isActive: isAuthorized
        };
      }
      if (module.id === 'staff') {
        const isAuthorized = ['admin', 'ops_lead', 'black_shirt'].includes(user.role);
        return {
          ...module,
          badge: isAuthorized ? 'Active' : 'Unlocked for Store Manager and above',
          description: isAuthorized ? 'User creation, role assignment, and restaurant access' : 'Unlocked for Store Manager and above',
          isActive: true // Always active now since all users can access staff management
        };
      }
      return module;
    });
    
    // Organize modules into categories
    const managementModules = filteredModules.slice(0, 3); // First 3 modules
    const profitLossModules = filteredModules.filter(m => ['analytics', 'finance'].includes(m.id));
    const helpersModules = filteredModules.filter(m => ['idp', 'inventory', 'compliance'].includes(m.id));
    // Sort helpers modules to put IDP first
    helpersModules.sort((a, b) => {
      if (a.id === 'idp') return -1;
      if (b.id === 'idp') return 1;
      return 0;
    });
    const othersModules = filteredModules.filter(m => 
      !managementModules.includes(m) && !helpersModules.includes(m) && !profitLossModules.includes(m)
    );
    
    return {
      management: managementModules,
      profitLoss: profitLossModules,
      helpers: helpersModules,
      others: othersModules
    };
  };
  
  const categorizedModules = getCategorizedModules();
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Blimp.One - Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage all aspects of your restaurant operations from one central location
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[...categorizedModules.management, ...(categorizedModules.profitLoss || []), ...categorizedModules.helpers, ...categorizedModules.others].filter(m => m.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                of {[...categorizedModules.management, ...(categorizedModules.profitLoss || []), ...categorizedModules.helpers, ...categorizedModules.others].length} total modules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kitchen Status</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Coming soon with analytics
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Online</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Coming soon with staff module
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Modules */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Management Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorizedModules.management.map((module) => {
              const IconComponent = module.icon;
              return (
                <Card 
                  key={module.id} 
                  className={`transition-all hover:shadow-lg ${
                    module.isActive 
                      ? 'ring-2 ring-blue-500 hover:ring-blue-600' 
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${module.color}`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                      </div>
                      {module.badge && (
                        <Badge 
                          variant={module.badge === 'Restricted' ? "destructive" : (module.isActive ? "default" : "secondary")}
                          className={module.badge === 'Restricted' ? "bg-red-500" : (module.isActive ? "bg-green-500" : "")}
                        >
                          {module.badge}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{module.description}</p>
                    {module.isActive ? (
                      <Link
                        href={module.href}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                      >
                        Open Module
                      </Link>
                    ) : (
                      // Hide button for Pay Structure if restricted, show "Coming Soon" for others (Staff Management is always accessible now)
                      !['pay-structure'].includes(module.id) && (
                        <button
                          disabled
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                        >
                          Coming Soon
                        </button>
                      )
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Profit & Loss */}
        {(categorizedModules.profitLoss && categorizedModules.profitLoss.length > 0) && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Profit & Loss</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categorizedModules.profitLoss?.map((module) => {
                const IconComponent = module.icon;
                return (
                  <Card 
                    key={module.id} 
                    className={`transition-all hover:shadow-lg ${
                      module.isActive 
                        ? 'ring-2 ring-blue-500 hover:ring-blue-600' 
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${module.color}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                        </div>
                        {module.badge && (
                          <Badge 
                            variant={module.badge === 'Restricted' ? "destructive" : (module.isActive ? "default" : "secondary")}
                            className={module.badge === 'Restricted' ? "bg-red-500" : (module.isActive ? "bg-green-500" : "")}
                          >
                            {module.badge}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{module.description}</p>
                      {module.isActive ? (
                        <Link
                          href={module.href}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                        >
                          Open Module
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                        >
                          Coming Soon
                        </button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Continuous Learning */}
        {categorizedModules.helpers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Continuous Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categorizedModules.helpers.map((module) => {
                const IconComponent = module.icon;
                return (
                  <Card 
                    key={module.id} 
                    className={`transition-all hover:shadow-lg ${
                      module.isActive 
                        ? 'ring-2 ring-blue-500 hover:ring-blue-600' 
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${module.color}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                        </div>
                        {module.badge && (
                          <Badge 
                            variant={module.badge === 'Restricted' ? "destructive" : (module.isActive ? "default" : "secondary")}
                            className={module.badge === 'Restricted' ? "bg-red-500" : (module.isActive ? "bg-green-500" : "")}
                          >
                            {module.badge}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{module.description}</p>
                      {module.isActive ? (
                        <Link
                          href={module.href}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                        >
                          Access Module
                        </Link>
                      ) : (
                        <div className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground h-10 px-4 py-2 w-full cursor-not-allowed opacity-50">
                          Restricted Access
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Others */}
        {categorizedModules.others.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Others</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categorizedModules.others.map((module) => {
                const IconComponent = module.icon;
                return (
                  <Card 
                    key={module.id} 
                    className={`transition-all hover:shadow-lg ${
                      module.isActive 
                        ? 'ring-2 ring-blue-500 hover:ring-blue-600' 
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${module.color}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                        </div>
                        {module.badge && (
                          <Badge 
                            variant={module.badge === 'Restricted' ? "destructive" : (module.isActive ? "default" : "secondary")}
                            className={module.badge === 'Restricted' ? "bg-red-500" : (module.isActive ? "bg-green-500" : "")}
                          >
                            {module.badge}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{module.description}</p>
                      {module.isActive ? (
                        <Link
                          href={module.href}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                        >
                          Access Module
                        </Link>
                      ) : (
                        <div className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground h-10 px-4 py-2 w-full cursor-not-allowed opacity-50">
                          Restricted Access
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-card rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/kitchen"
              className="flex items-center space-x-3 p-4 rounded-lg bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 transition-colors"
            >
              <ChefHat className="h-8 w-8 text-orange-600" />
              <div>
                <p className="font-medium text-foreground">Kitchen Management</p>
                <p className="text-sm text-muted-foreground">Access kitchen operations</p>
              </div>
            </Link>

            <Link
              href="/boh/history"
              className="flex items-center space-x-3 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 transition-colors"
            >
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium text-foreground">Order History</p>
                <p className="text-sm text-muted-foreground">Review completed orders</p>
              </div>
            </Link>

            {user && ['admin', 'ops_lead'].includes(user.role) && (
              <Link
                href="/pay-structure"
                className="flex items-center space-x-3 p-4 rounded-lg bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/30 transition-colors"
              >
                <Banknote className="h-8 w-8 text-cyan-600" />
                <div>
                  <p className="font-medium text-foreground">Pay Structure</p>
                  <p className="text-sm text-muted-foreground">Manage regional pay rates</p>
                </div>
              </Link>
            )}

            <Link
              href="/profile"
              className="flex items-center space-x-3 p-4 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Settings className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium text-foreground">Settings</p>
                <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}