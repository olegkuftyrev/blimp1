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
  BookOpen,
  Home,
  Calculator,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContextSWR';
import { getItemsBySection, isItemVisibleForRole, type UserRole, type IconName } from '@/data/navigationItems';

// Map IconName to lucide-react components
const iconMap: Record<IconName, React.ComponentType<any>> = {
  home: Home,
  settings: Settings,
  chefHat: ChefHat,
  users: Users,
  banknote: Banknote,
  barChart3: BarChart3,
  dollarSign: DollarSign,
  bookOpen: BookOpen,
  calculator: Calculator,
  clipboardList: ClipboardList,
  shield: Shield,
  calendar: Calendar,
  truck: Truck,
  messageSquare: MessageSquare,
  trendingUp: TrendingUp,
  user: UserIcon,
};

function DashboardContent() {
  const { user } = useAuth();

  const role = (user?.role as UserRole | undefined) ?? undefined;

  // Safe Tailwind class mapping for background colors referenced in navigationItems
  const colorBgClass: Record<string, string> = {
    'blue-600': 'bg-blue-600',
    'emerald-600': 'bg-emerald-600',
    'teal-600': 'bg-teal-600',
    'cyan-600': 'bg-cyan-600',
    'sky-600': 'bg-sky-600',
    'indigo-600': 'bg-indigo-600',
    'violet-600': 'bg-violet-600',
    'purple-600': 'bg-purple-600',
    'fuchsia-600': 'bg-fuchsia-600',
    'pink-600': 'bg-pink-600',
    'rose-600': 'bg-rose-600',
    'red-600': 'bg-red-600',
    'orange-600': 'bg-orange-600',
    'amber-600': 'bg-amber-600',
    'lime-600': 'bg-lime-600',
    'green-600': 'bg-green-600',
    'slate-600': 'bg-slate-600',
  };

  // Role hierarchy helpers
  const roleRank: Record<UserRole, number> = {
    associate: 0,
    tablet: 1,
    black_shirt: 2,
    ops_lead: 3,
    admin: 4,
  };
  const formatRole = (r: UserRole) => {
    switch (r) {
      case 'ops_lead':
        return 'ACO';
      case 'black_shirt':
        return 'Store Manager';
      case 'admin':
        return 'Admin';
      case 'associate':
        return 'Associate';
      case 'tablet':
        return 'Tablet';
      default:
        return r;
    }
  };
  const getLowestAllowedRole = (allowed?: UserRole[]) => {
    if (!allowed || allowed.length === 0) return undefined;
    const sorted = [...allowed].sort((a, b) => roleRank[a] - roleRank[b]);
    return sorted[0];
  };

  // Show all items regardless of permissions; mark restricted visually
  const managementItems = getItemsBySection('management');
  const profitLossItems = getItemsBySection('p_and_l');
  const learningItems = getItemsBySection('learning');
  const moreItems = getItemsBySection('more');

  const allVisible = [...managementItems, ...profitLossItems, ...learningItems, ...moreItems];
  const activeCount = allVisible.filter((i) => !i.comingSoon && isItemVisibleForRole(i, role ?? null)).length;
  const totalCount = allVisible.length;

  const isKitchenAuthorized = user ? ['admin', 'ops_lead', 'black_shirt'].includes(user.role) : false;
  
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

        {/* Quick Actions - moved to top - COMMENTED OUT FOR LATER WORK */}
        {/* 
        <div className="bg-card rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {isKitchenAuthorized ? (
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
            ) : (
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 opacity-70 cursor-not-allowed">
                <ChefHat className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="font-medium text-foreground">Kitchen Management</p>
                  <p className="text-sm text-muted-foreground">Restricted - Black Shirt and above</p>
                </div>
              </div>
            )}

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
        */}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
              <p className="text-xs text-muted-foreground">
                of {totalCount} total modules
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
            {managementItems.map((item) => {
              const IconComponent = iconMap[item.icon];
              const isAllowed = isItemVisibleForRole(item, role ?? null);
              const isActive = !item.comingSoon && isAllowed;
              const lowestAllowed = getLowestAllowedRole(item.rolesAllowed);
              const badgeLabel = !isAllowed ? 'Restricted' : (item.comingSoon ? 'Coming Soon' : 'Active');
              return (
                <Card 
                  key={item.id} 
                  className={`transition-all hover:shadow-lg ${
                    isActive 
                      ? 'ring-2 ring-blue-500 hover:ring-blue-600' 
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${colorBgClass[item.color] ?? 'bg-primary'}`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </div>
                      <Badge className={isActive ? "bg-green-500" : (!isAllowed ? "bg-yellow-500" : "")} variant={isActive ? "default" : "secondary"}>
                        {badgeLabel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{item.description}</p>
                    {isAllowed && !item.comingSoon ? (
                      <Link
                        href={item.href}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                      >
                        Open Module
                      </Link>
                    ) : (
                      <div className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground h-10 px-4 py-2 w-full cursor-not-allowed opacity-80">
                        {!isAllowed
                          ? `Allowed for ${lowestAllowed ? formatRole(lowestAllowed) : 'Authorized'} and Above`
                          : 'Coming Soon'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Profit & Loss */}
        {(profitLossItems && profitLossItems.length > 0) && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Profit & Loss</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profitLossItems?.map((item) => {
                const IconComponent = iconMap[item.icon];
                const isAllowed = isItemVisibleForRole(item, role ?? null);
                const isActive = !item.comingSoon && isAllowed;
                const lowestAllowed = getLowestAllowedRole(item.rolesAllowed);
                const badgeLabel = !isAllowed ? 'Restricted' : (item.comingSoon ? 'Coming Soon' : 'Active');
                return (
                  <Card 
                    key={item.id} 
                    className={`transition-all hover:shadow-lg ${
                      isActive 
                        ? 'ring-2 ring-blue-500 hover:ring-blue-600' 
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${colorBgClass[item.color] ?? 'bg-primary'}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </div>
                        <Badge className={isActive ? "bg-green-500" : (!isAllowed ? "bg-yellow-500" : "")} variant={isActive ? "default" : "secondary"}>
                          {badgeLabel}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{item.description}</p>
                      {isAllowed && !item.comingSoon ? (
                        <Link
                          href={item.href}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                        >
                          Open Module
                        </Link>
                      ) : (
                        <div className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground h-10 px-4 py-2 w-full cursor-not-allowed opacity-80">
                          {!isAllowed
                            ? `Allowed for ${lowestAllowed ? formatRole(lowestAllowed) : 'Authorized'} and Above`
                            : 'Coming Soon'}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Continuous Learning */}
        {learningItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Continuous Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningItems.map((item) => {
                const IconComponent = iconMap[item.icon];
                const isAllowed = isItemVisibleForRole(item, role ?? null);
                const isActive = !item.comingSoon && isAllowed;
                const lowestAllowed = getLowestAllowedRole(item.rolesAllowed);
                const badgeLabel = !isAllowed ? 'Restricted' : (item.comingSoon ? 'Coming Soon' : 'Active');
                return (
                  <Card 
                    key={item.id} 
                    className={`transition-all hover:shadow-lg ${
                      isActive 
                        ? 'ring-2 ring-blue-500 hover:ring-blue-600' 
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${colorBgClass[item.color] ?? 'bg-primary'}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </div>
                        <Badge className={isActive ? "bg-green-500" : (!isAllowed ? "bg-yellow-500" : "")} variant={isActive ? "default" : "secondary"}>
                          {badgeLabel}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{item.description}</p>
                      {isAllowed && !item.comingSoon ? (
                        <Link
                          href={item.href}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                        >
                          Access Module
                        </Link>
                      ) : (
                        <div className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground h-10 px-4 py-2 w-full cursor-not-allowed opacity-80">
                          {!isAllowed
                            ? `Allowed for ${lowestAllowed ? formatRole(lowestAllowed) : 'Authorized'} and Above`
                            : 'Coming Soon'}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* More */}
        {moreItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">More</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moreItems.map((item) => {
                const IconComponent = iconMap[item.icon];
                const isAllowed = isItemVisibleForRole(item, role ?? null);
                const isActive = !item.comingSoon && isAllowed;
                const lowestAllowed = getLowestAllowedRole(item.rolesAllowed);
                const badgeLabel = !isAllowed ? 'Restricted' : (item.comingSoon ? 'Coming Soon' : 'Active');
                return (
                  <Card 
                    key={item.id} 
                    className={`transition-all hover:shadow-lg ${
                      isActive 
                        ? 'ring-2 ring-blue-500 hover:ring-blue-600' 
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${colorBgClass[item.color] ?? 'bg-primary'}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </div>
                        <Badge className={isActive ? "bg-green-500" : (!isAllowed ? "bg-yellow-500" : "")} variant={isActive ? "default" : "secondary"}>
                          {badgeLabel}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{item.description}</p>
                      {isAllowed && !item.comingSoon ? (
                        <Link
                          href={item.href}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                        >
                          Access Module
                        </Link>
                      ) : (
                        <div className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground h-10 px-4 py-2 w-full cursor-not-allowed opacity-80">
                          {!isAllowed
                            ? `Allowed for ${lowestAllowed ? formatRole(lowestAllowed) : 'Authorized'} and Above`
                            : 'Coming Soon'}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        
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