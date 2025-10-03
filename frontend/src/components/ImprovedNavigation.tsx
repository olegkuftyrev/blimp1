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
import { getItemsBySection, type IconName } from '@/data/navigationItems';
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
  const isActiveOrStartsWith = (path: string) => pathname === path || pathname.startsWith(path);
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
      const root = firstTrigger.closest('.blimp-nav-root, .blimp-profile-nav-root') as HTMLElement | null;
      if (!root) return;
      const viewport = root.querySelector('.blimp-nav-viewport') as HTMLElement | null;
      const viewportWidth = viewport?.offsetWidth && viewport.offsetWidth > 0 ? viewport.offsetWidth : 350; // fallback
      const containerWidth = root.clientWidth || (document.documentElement.clientWidth || window.innerWidth);

      const padding = 8; // small safety padding
      const maxLeft = Math.max(0, containerWidth - viewportWidth - padding);
      const clampedLeft = Math.min(firstTrigger.offsetLeft, maxLeft);

      root.style.setProperty(
        "--menu-left-position",
        `${clampedLeft}px`
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

  const renderDescription = (desc: string, comingSoon?: boolean) =>
    comingSoon ? `${desc} (Coming Soon)` : desc;

  const iconMap: Record<IconName, React.ReactNode> = {
    home: <Home className="h-4 w-4" />,
    settings: <Settings className="h-4 w-4" />,
    chefHat: <ChefHat className="h-4 w-4" />,
    users: <Users className="h-4 w-4" />,
    banknote: <Banknote className="h-4 w-4" />,
    barChart3: <BarChart3 className="h-4 w-4" />,
    dollarSign: <DollarSign className="h-4 w-4" />,
    bookOpen: <BookOpen className="h-4 w-4" />,
    calculator: <Calculator className="h-4 w-4" />,
    clipboardList: <ClipboardList className="h-4 w-4" />,
    shield: <Shield className="h-4 w-4" />,
    calendar: <Calendar className="h-4 w-4" />,
    truck: <Truck className="h-4 w-4" />,
    messageSquare: <MessageSquare className="h-4 w-4" />,
    trendingUp: <TrendingUp className="h-4 w-4" />,
    user: <User className="h-4 w-4" />,
  };

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
            <NavigationMenu className="relative blimp-nav-root" onValueChange={onNavChange}>
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
                {(() => {
                  const managementItems = getItemsBySection('management', user?.role).filter((i) => !i.comingSoon)
                  if (managementItems.length === 0) return null
                  return (
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
                          {managementItems.map((item) => (
                            <ListItem
                              key={item.id}
                              href={item.href}
                              title={item.title}
                              icon={iconMap[item.icon]}
                              className={cn(
                                item.comingSoon && 'opacity-50',
                                isActiveOrStartsWith(item.href) && 'bg-accent text-accent-foreground'
                              )}
                            >
                              {renderDescription(item.description, item.comingSoon)}
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )
                })()}


                {/* Profit & Loss */}
                {(() => {
                  const pAndLItems = getItemsBySection('p_and_l', user?.role).filter((i) => !i.comingSoon)
                  if (pAndLItems.length === 0) return null
                  return (
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
                          {pAndLItems.map((item) => (
                            <ListItem
                              key={item.id}
                              href={item.href}
                              title={item.title}
                              icon={iconMap[item.icon]}
                              className={cn(
                                item.comingSoon && 'opacity-50',
                                isActiveOrStartsWith(item.href) && 'bg-accent text-accent-foreground'
                              )}
                            >
                              {renderDescription(item.description, item.comingSoon)}
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )
                })()}

                {/* Learning */}
                {(() => {
                  const learningItems = getItemsBySection('learning', user?.role).filter((i) => !i.comingSoon)
                  if (learningItems.length === 0) return null
                  return (
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
                          {learningItems.map((item) => (
                            <ListItem
                              key={item.id}
                              href={item.href}
                              title={item.title}
                              icon={iconMap[item.icon]}
                              className={cn(
                                item.comingSoon && 'opacity-50',
                                isActiveOrStartsWith(item.href) && 'bg-accent text-accent-foreground'
                              )}
                            >
                              {renderDescription(item.description, item.comingSoon)}
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )
                })()}

                {/* Others */}
                {(() => {
                  const moreItems = getItemsBySection('more', user?.role).filter((i) => !i.comingSoon)
                  if (moreItems.length === 0) return null
                  return (
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
                          {moreItems.map((item) => (
                            <ListItem
                              key={item.id}
                              href={item.href}
                              title={item.title}
                              icon={iconMap[item.icon]}
                              className={cn(
                                item.comingSoon && 'opacity-50',
                                isActiveOrStartsWith(item.href) && 'bg-accent text-accent-foreground'
                              )}
                            >
                              {renderDescription(item.description, item.comingSoon)}
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )
                })()}


              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side - Profile & Theme Toggle */}
          <div className="flex-1 flex justify-end items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              {/* Profile direct link */}
              <Link
                href="/profile?tab=my-profile"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive('/profile') && "bg-accent text-accent-foreground"
                )}
              >
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">
                  {isLoading ? 'Loading...' : getUserDisplayName()}
                </span>
              </Link>
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
            {(() => {
              const managementItems = getItemsBySection('management', user?.role).filter((i) => !i.comingSoon)
              if (managementItems.length === 0) return null
              return (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-base font-medium text-muted-foreground flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Management
                  </div>
                  <div className="pl-6 space-y-1">
                    {managementItems.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                          isActiveOrStartsWith(item.href)
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground",
                          item.comingSoon && 'opacity-50'
                        )}
                        onClick={closeMobileMenu}
                      >
                        {iconMap[item.icon]}
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })()}


            {/* Profit & Loss */}
            {(() => {
              const pAndLItems = getItemsBySection('p_and_l', user?.role).filter((i) => !i.comingSoon)
              if (pAndLItems.length === 0) return null
              return (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-base font-medium text-muted-foreground flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Profit & Loss
                  </div>
                  <div className="pl-6 space-y-1">
                    {pAndLItems.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                          isActiveOrStartsWith(item.href)
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground",
                          item.comingSoon && 'opacity-50'
                        )}
                        onClick={closeMobileMenu}
                      >
                        {iconMap[item.icon]}
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Learning */}
            {(() => {
              const learningItems = getItemsBySection('learning', user?.role).filter((i) => !i.comingSoon)
              if (learningItems.length === 0) return null
              return (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-base font-medium text-muted-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Continuous Learning
                  </div>
                  <div className="pl-6 space-y-1">
                    {learningItems.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                          isActiveOrStartsWith(item.href)
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground",
                          item.comingSoon && 'opacity-50'
                        )}
                        onClick={closeMobileMenu}
                      >
                        {iconMap[item.icon]}
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Others */}
            {(() => {
              const moreItems = getItemsBySection('more', user?.role).filter((i) => !i.comingSoon)
              if (moreItems.length === 0) return null
              return (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-base font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    More
                  </div>
                  <div className="pl-6 space-y-1">
                    {moreItems.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                          isActiveOrStartsWith(item.href)
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground",
                          item.comingSoon && 'opacity-50'
                        )}
                        onClick={closeMobileMenu}
                      >
                        {iconMap[item.icon]}
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Profile */}
            <div className="border-t pt-2 mt-4 space-y-1">
              {(() => {
                const profileItems = getItemsBySection('profile', user?.role);
                const myProfile = profileItems.find((i) => i.id === 'profile-my-profile');
                return (
                  <Link
                    href={myProfile?.href || '/profile?tab=my-profile'}
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
                );
              })()}
              {getItemsBySection('profile', user?.role)
                .filter((i) => i.id !== 'profile-my-profile')
                .map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive('/profile')
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground",
                      item.comingSoon && 'opacity-50'
                    )}
                    onClick={closeMobileMenu}
                  >
                    {iconMap[item.icon]}
                    {item.title}
                  </Link>
                ))}
              
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
