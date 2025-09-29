'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  ChefHat, 
  Home, 
  Settings, 
  History, 
  Clock, 
  User, 
  Users, 
  BarChart3, 
  Calendar,
  DollarSign,
  Truck,
  ClipboardList,
  MessageSquare,
  Shield,
  Banknote,
  BookOpen,
  LogOut,
  TrendingUp,
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContextSWR';
import { InlineThemeToggle } from '@/components/ui/theme-toggle';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

const ImprovedNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const isBohActive = () => pathname.startsWith('/boh');
  const isManagementActive = () => pathname.startsWith('/kitchen') || pathname.startsWith('/staff') || pathname.startsWith('/pay-structure');
  const isProfitLossActive = () => pathname.startsWith('/analytics') || pathname.startsWith('/area-pl');
  const isLearningActive = () => pathname.startsWith('/idp') || pathname.startsWith('/roles-performance') || pathname.startsWith('/inventory') || pathname.startsWith('/compliance') || pathname.startsWith('/pl-practice-tests');
  const isOthersActive = () => pathname.startsWith('/delivery') || pathname.startsWith('/customer') || pathname.startsWith('/scheduling');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  // Handle navigation menu positioning
  const onNavChange = () => {
    setTimeout(() => {
      const triggers = document.querySelectorAll(
        '.submenu-trigger[data-state="open"]'
      );
      if (triggers.length === 0) return;

      const firstTrigger = triggers[0] as HTMLElement;
      
      document.documentElement.style.setProperty(
        "--menu-left-position",
        `${firstTrigger.offsetLeft}px`
      );
    });
  };


  // Get display name for user
  const getUserDisplayName = () => {
    if (!user) return 'Profile';
    return user.fullName || (user.email ? user.email.split('@')[0] : '') || 'User';
  };

  // ListItem component following official documentation pattern
  const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & { title: string; href: string; icon?: React.ReactNode }
  >(({ className, title, children, href, icon, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            href={href}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="flex items-center gap-2">
              {icon}
              <div className="text-sm font-medium leading-none">{title}</div>
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </Link>
        </NavigationMenuLink>
      </li>
    )
  });
  ListItem.displayName = "ListItem";

  // Don't render navigation if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background border-b shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-1">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                BLIMP.ONE
              </span>
            </Link>
          </div>
          
          {/* Desktop Menu - Centered */}
          <div className="hidden md:block">
            <NavigationMenu className="relative" onValueChange={onNavChange}>
              <NavigationMenuList className="space-x-2">
                {/* Dashboard */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link 
                      href="/dashboard"
                      className={cn(
                        "flex items-center gap-2",
                        isActive('/dashboard') && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Home className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Management */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={cn(
                      "submenu-trigger flex items-center gap-2",
                      isManagementActive() && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    Management
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 p-4">
                      <ListItem 
                        href="/kitchen" 
                        title="Kitchen Management"
                        icon={<ChefHat className="h-4 w-4" />}
                        className={cn(pathname.startsWith('/kitchen') && "bg-accent text-accent-foreground")}
                      >
                        Order tracking, timers, and kitchen operations
                      </ListItem>
                      <ListItem 
                        href="/staff" 
                        title="Staff Management"
                        icon={<Users className="h-4 w-4" />}
                        className={cn(isActive('/staff') && "bg-accent text-accent-foreground")}
                      >
                        User creation, role assignment, and restaurant access
                      </ListItem>
                      {user && ['admin', 'ops_lead'].includes(user.role) && (
                        <ListItem 
                          href="/pay-structure" 
                          title="Pay Structure"
                          icon={<Banknote className="h-4 w-4" />}
                          className={cn(isActive('/pay-structure') && "bg-accent text-accent-foreground")}
                        >
                          Manage hourly pay rates across all regions and roles
                        </ListItem>
                      )}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>


                {/* Profit & Loss */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={cn(
                      "submenu-trigger flex items-center gap-2",
                      isProfitLossActive() && "bg-accent text-accent-foreground"
                    )}
                  >
                    <BarChart3 className="h-4 w-4" />
                    P&L
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[350px] gap-2 p-4">
                      {user && user.role !== 'associate' && (
                        <ListItem 
                          href="/analytics" 
                          title="Analytics & Reports"
                          icon={<BarChart3 className="h-4 w-4" />}
                          className={cn(isActive('/analytics') && "bg-accent text-accent-foreground")}
                        >
                          Sales reports, performance metrics
                        </ListItem>
                      )}
                      {user && ['admin', 'ops_lead'].includes(user.role) && (
                        <ListItem 
                          href="/area-pl" 
                          title="Area P&L"
                          icon={<DollarSign className="h-4 w-4" />}
                          className={cn(isActive('/area-pl') && "bg-accent text-accent-foreground")}
                        >
                          Comprehensive profit and loss analysis for your area
                        </ListItem>
                      )}
                      
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Learning */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={cn(
                      "submenu-trigger flex items-center gap-2",
                      isLearningActive() && "bg-accent text-accent-foreground"
                    )}
                  >
                    <BookOpen className="h-4 w-4" />
                    Learning
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 p-4">
                      <ListItem 
                        href="/idp" 
                        title="Individual Development Plan"
                        icon={<BookOpen className="h-4 w-4" />}
                        className={cn(isActive('/idp') && "bg-accent text-accent-foreground")}
                      >
                        Personal and professional development planning
                      </ListItem>
                      <ListItem 
                        href="/pl-practice-tests" 
                        title="P&L Practice Tests"
                        icon={<Calculator className="h-4 w-4" />}
                        className={cn(isActive('/pl-practice-tests') && "bg-accent text-accent-foreground")}
                      >
                        Test your knowledge of Profit & Loss calculations and financial metrics
                      </ListItem>
                      <ListItem 
                        href="/roles-performance" 
                        title="Roles Performance"
                        icon={<ClipboardList className="h-4 w-4" />}
                        className={cn(isActive('/roles-performance') && "bg-accent text-accent-foreground")}
                      >
                        Performance tracking, role assessment, and team analytics
                      </ListItem>
                      <ListItem 
                        href="/compliance" 
                        title="Grow Camp"
                        icon={<Shield className="h-4 w-4" />}
                        className={cn("opacity-50", isActive('/compliance') && "bg-accent text-accent-foreground")}
                      >
                        Training programs, skill development (Coming Soon)
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Others */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={cn(
                      "submenu-trigger flex items-center gap-2",
                      isOthersActive() && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Calendar className="h-4 w-4" />
                    More
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[350px] gap-2 p-4">
                      <ListItem 
                        href="/delivery" 
                        title="1k Usage"
                        icon={<Truck className="h-4 w-4" />}
                        className={cn("opacity-50", isActive('/delivery') && "bg-accent text-accent-foreground")}
                      >
                        Usage analytics, metrics tracking (Coming Soon)
                      </ListItem>
                      <ListItem 
                        href="/customer" 
                        title="SMG Analytics"
                        icon={<MessageSquare className="h-4 w-4" />}
                        className={cn("opacity-50", isActive('/customer') && "bg-accent text-accent-foreground")}
                      >
                        Service management analytics (Coming Soon)
                      </ListItem>
                      <ListItem 
                        href="/scheduling" 
                        title="Blimp Store"
                        icon={<Calendar className="h-4 w-4" />}
                        className={cn("opacity-50", isActive('/scheduling') && "bg-accent text-accent-foreground")}
                      >
                        Store management, inventory (Coming Soon)
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>


              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side - Profile & Theme Toggle */}
          <div className="flex-1 flex justify-end items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              {/* Profile with dropdown */}
              <NavigationMenu onValueChange={onNavChange}>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className={cn(
                        "submenu-trigger flex items-center gap-2 px-3 py-2 text-sm font-medium",
                        isActive('/profile') && "bg-accent text-accent-foreground"
                      )}
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden lg:inline">
                        {isLoading ? 'Loading...' : getUserDisplayName()}
                      </span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[280px] gap-2 p-4">
                        <ListItem 
                          href="/profile?tab=my-profile" 
                          title="My Profile"
                          icon={<User className="h-4 w-4" />}
                          className={cn(isActive('/profile') && "bg-accent text-accent-foreground")}
                        >
                          View and edit your personal information
                        </ListItem>
                        <ListItem 
                          href="/profile?tab=idp" 
                          title="Individual Development Plan"
                          icon={<BookOpen className="h-4 w-4" />}
                          className={cn(isActive('/profile') && "bg-accent text-accent-foreground")}
                        >
                          Track your professional development goals
                        </ListItem>
                        <ListItem 
                          href="/profile?tab=performance" 
                          title="My Performance"
                          icon={<TrendingUp className="h-4 w-4" />}
                          className={cn(isActive('/profile') && "bg-accent text-accent-foreground")}
                        >
                          View your competency mastery and performance metrics
                        </ListItem>
                        <ListItem 
                          href="/profile?tab=team" 
                          title="Team Management"
                          icon={<Users className="h-4 w-4" />}
                          className={cn(isActive('/profile') && "bg-accent text-accent-foreground")}
                        >
                          Manage your team and staff members
                        </ListItem>
                        <li>
                          <div className="border-t my-2"></div>
                          <div className="px-1">
                            <InlineThemeToggle />
                          </div>
                          <div className="px-1 mt-2">
                            <button
                              onClick={logout}
                              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors text-red-600 hover:text-red-700 w-full"
                            >
                              <LogOut className="h-4 w-4" />
                              <span className="text-sm font-medium">Sign Off</span>
                            </button>
                          </div>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background max-h-[80vh] overflow-y-auto">
            {/* Dashboard */}
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors",
                isActive('/dashboard')
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={closeMobileMenu}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>

            {/* Management Section */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-base font-medium text-muted-foreground flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Management
              </div>
              <div className="pl-6 space-y-1">
                <Link
                  href="/kitchen"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    pathname.startsWith('/kitchen')
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={closeMobileMenu}
                >
                  <ChefHat className="h-4 w-4" />
                  Kitchen Management
                </Link>
                <Link
                  href="/staff"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive('/staff')
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={closeMobileMenu}
                >
                  <Users className="h-4 w-4" />
                  Staff Management
                </Link>
                {user && ['admin', 'ops_lead'].includes(user.role) && (
                  <Link
                    href="/pay-structure"
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive('/pay-structure')
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={closeMobileMenu}
                  >
                    <Banknote className="h-4 w-4" />
                    Pay Structure
                  </Link>
                )}
              </div>
            </div>


            {/* Profit & Loss */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-base font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Profit & Loss
              </div>
              <div className="pl-6 space-y-1">
                {user && (
                  <Link
                    href="/analytics"
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive('/analytics')
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={closeMobileMenu}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics & Reports
                  </Link>
                )}
                {user && ['admin', 'ops_lead'].includes(user.role) && (
                  <Link
                    href="/area-pl"
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive('/area-pl')
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={closeMobileMenu}
                  >
                    <DollarSign className="h-4 w-4" />
                    Area P&L
                  </Link>
                )}
                
              </div>
            </div>

            {/* Learning */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-base font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Continuous Learning
              </div>
              <div className="pl-6 space-y-1">
                <Link
                  href="/idp"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive('/idp')
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={closeMobileMenu}
                >
                  <BookOpen className="h-4 w-4" />
                  Individual Development Plan
                </Link>
                <Link
                  href="/pl-practice-tests"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive('/pl-practice-tests')
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={closeMobileMenu}
                >
                  <Calculator className="h-4 w-4" />
                  P&L Practice Tests
                </Link>
                <Link
                  href="/roles-performance"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive('/roles-performance')
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={closeMobileMenu}
                >
                  <ClipboardList className="h-4 w-4" />
                  Roles Performance
                </Link>
                <Link
                  href="/compliance"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors opacity-50",
                    isActive('/compliance')
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={closeMobileMenu}
                >
                  <Shield className="h-4 w-4" />
                  Grow Camp
                </Link>
              </div>
            </div>

            {/* Others */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-base font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                More
              </div>
              <div className="pl-6 space-y-1">
                <Link
                  href="/delivery"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors opacity-50",
                    isActive('/delivery')
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={closeMobileMenu}
                >
                  <Truck className="h-4 w-4" />
                  1k Usage
                </Link>
                <Link
                  href="/customer"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors opacity-50",
                    isActive('/customer')
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={closeMobileMenu}
                >
                  <MessageSquare className="h-4 w-4" />
                  SMG Analytics
                </Link>
                <Link
                  href="/scheduling"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors opacity-50",
                    isActive('/scheduling')
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={closeMobileMenu}
                >
                  <Calendar className="h-4 w-4" />
                  Blimp Store
                </Link>
              </div>
            </div>

            {/* Profile */}
            <div className="border-t pt-2 mt-4 space-y-1">
              <Link
                href="/profile?tab=my-profile"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors",
                  isActive('/profile')
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={closeMobileMenu}
              >
                <User className="h-4 w-4" />
                {isLoading ? 'Loading...' : getUserDisplayName()}
              </Link>
              
              <Link
                href="/profile?tab=idp"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive('/profile')
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={closeMobileMenu}
              >
                <BookOpen className="h-4 w-4" />
                Individual Development Plan
              </Link>
              
              <Link
                href="/profile?tab=performance"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive('/profile')
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={closeMobileMenu}
              >
                <TrendingUp className="h-4 w-4" />
                My Performance
              </Link>
              
              <Link
                href="/profile?tab=team"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive('/profile')
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={closeMobileMenu}
              >
                <Users className="h-4 w-4" />
                Team Management
              </Link>
              
              {/* Theme Toggle */}
              <div className="px-1">
                <InlineThemeToggle />
              </div>
              
              {/* Sign Off */}
              <div className="px-1 mt-2">
                <button
                  onClick={logout}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors text-red-600 hover:text-red-700 w-full"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Sign Off</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
};

export default ImprovedNavigation;
