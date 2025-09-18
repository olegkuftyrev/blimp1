'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChefHat, Home, Settings, History, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ColorModeButton } from '@/components/ui/color-mode';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBohSubmenuOpen, setIsBohSubmenuOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const isBohActive = () => pathname.startsWith('/boh');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleBohSubmenu = () => {
    setIsBohSubmenuOpen(!isBohSubmenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsBohSubmenuOpen(false);
  };

  // Get display name for user
  const getUserDisplayName = () => {
    if (!user) return 'Profile';
    return user.fullName || (user.email ? user.email.split('@')[0] : '') || 'User';
  };

  // Don't render navigation if user is not authenticated (even while checking)
  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white text-gray-900 shadow-lg dark:bg-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold">BLIMP</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {/* Home - only show for authenticated users */}
              {user && (
                <Link
                  href="/dashboard"
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive('/dashboard')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  )}
                >
                  <Home className="h-4 w-4 inline mr-2" />
                  Dashboard
                </Link>
              )}

              {/* BOH with submenu */}
              <div className="relative">
                <button
                  onClick={toggleBohSubmenu}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center',
                    isBohActive()
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  )}
                >
                  <ChefHat className="h-4 w-4 inline mr-2" />
                  Kitchen
                </button>

                {/* BOH submenu */}
                {isBohSubmenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 dark:bg-gray-800">
                    <div className="py-1">
                      <Link
                        href="/boh"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                        onClick={closeMobileMenu}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Active Orders
                      </Link>
                      <Link
                        href="/boh/history"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                        onClick={closeMobileMenu}
                      >
                        <History className="h-4 w-4 mr-2" />
                        History
                      </Link>
                      <Link
                        href="/boh/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                        onClick={closeMobileMenu}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <Link
                href="/profile"
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive('/profile')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                )}
              >
                <User className="h-4 w-4 inline mr-2" />
                {isLoading ? 'Loading...' : getUserDisplayName()}
              </Link>

              {/* Test (hide in production) */}
              {process.env.NODE_ENV === 'development' && (
                <Link
                  href="/test"
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive('/test')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  )}
                >
                  Test
                </Link>
              )}

              {/* Theme Toggle */}
              <div className="ml-4">
                <ColorModeButton />
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
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
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800">
            {/* Home - only show for authenticated users */}
            {user && (
              <Link
                href="/dashboard"
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                  isActive('/dashboard')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                )}
                onClick={closeMobileMenu}
              >
                <Home className="h-4 w-4 inline mr-2" />
                Dashboard
              </Link>
            )}

            {/* BOH submenu for mobile - only show for authenticated users */}
            {user && (
              <div>
              <button
                onClick={toggleBohSubmenu}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center justify-between',
                  isBohActive()
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                )}
              >
                <div className="flex items-center">
                  <ChefHat className="h-4 w-4 mr-2" />
                  Kitchen
                </div>
                <span className={cn('transform transition-transform', isBohSubmenuOpen ? 'rotate-180' : '')}>
                  ▼
                </span>
              </button>

              {isBohSubmenuOpen && (
                <div className="pl-6 space-y-1">
                  <Link
                    href="/boh"
                    className="flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    onClick={closeMobileMenu}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Active Orders
                  </Link>
                  <Link
                    href="/boh/history"
                    className="flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    onClick={closeMobileMenu}
                  >
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Link>
                  <Link
                    href="/boh/settings"
                    className="flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    onClick={closeMobileMenu}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </div>
              )}
              </div>
            )}

            {/* Profile for mobile - only show for authenticated users */}
            {user && (
            <Link
              href="/profile"
              className={cn(
                'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                isActive('/profile')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              )}
              onClick={closeMobileMenu}
            >
              <User className="h-4 w-4 inline mr-2" />
              {isLoading ? 'Loading...' : getUserDisplayName()}
            </Link>
            )}

            {/* Test for mobile - only show for authenticated users */}
            {user && process.env.NODE_ENV === 'development' && (
              <Link
                href="/test"
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                  isActive('/test')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                )}
                onClick={closeMobileMenu}
              >
                Test
              </Link>
            )}

            {/* Theme Toggle for Mobile */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="px-3 py-2">
                <ColorModeButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
