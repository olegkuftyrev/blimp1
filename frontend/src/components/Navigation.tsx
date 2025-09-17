'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChefHat, Home, Settings, History, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthAPI } from '@/lib/api';
import { ColorModeButton } from '@/components/ui/color-mode';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBohSubmenuOpen, setIsBohSubmenuOpen] = useState(false);
  const [user, setUser] = useState<{ fullName?: string; email: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
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

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const response = await AuthAPI.me();
          setUser(response.user);
        }
      } catch (error) {
        // User is not authenticated or token is invalid
        setUser(null);
        localStorage.removeItem('auth_token');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Get display name for user
  const getUserDisplayName = () => {
    if (!user) return 'Профиль';
    return user.fullName || (user.email ? user.email.split('@')[0] : '') || 'Пользователь';
  };

  return (
    <nav className="bg-white text-gray-900 shadow-lg dark:bg-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Логотип */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold">BLIMP</span>
            </Link>
          </div>

          {/* Десктопное меню */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {/* Главная */}
              <Link
                href="/"
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive('/')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                )}
              >
                <Home className="h-4 w-4 inline mr-2" />
                Главная
              </Link>

              {/* BOH с подменю */}
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
                  BOH
                </button>

                {/* BOH подменю */}
                {isBohSubmenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 dark:bg-gray-800">
                    <div className="py-1">
                      <Link
                        href="/boh"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                        onClick={closeMobileMenu}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Активные заказы
                      </Link>
                      <Link
                        href="/boh/history"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                        onClick={closeMobileMenu}
                      >
                        <History className="h-4 w-4 mr-2" />
                        История
                      </Link>
                      <Link
                        href="/boh/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                        onClick={closeMobileMenu}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Настройки
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Профиль */}
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
                {isCheckingAuth ? 'Загрузка...' : getUserDisplayName()}
              </Link>

              {/* Тест (скрыть в продакшене) */}
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
                  Тест
                </Link>
              )}

              {/* Theme Toggle */}
              <div className="ml-4">
                <ColorModeButton />
              </div>
            </div>
          </div>

          {/* Мобильное меню кнопка */}
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

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800">
            {/* Главная */}
            <Link
              href="/"
              className={cn(
                'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                isActive('/')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              )}
              onClick={closeMobileMenu}
            >
              <Home className="h-4 w-4 inline mr-2" />
              Главная
            </Link>

            {/* BOH подменю для мобильных */}
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
                  BOH
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
                    Активные заказы
                  </Link>
                  <Link
                    href="/boh/history"
                    className="flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    onClick={closeMobileMenu}
                  >
                    <History className="h-4 w-4 mr-2" />
                    История
                  </Link>
                  <Link
                    href="/boh/settings"
                    className="flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    onClick={closeMobileMenu}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Настройки
                  </Link>
                </div>
              )}
            </div>

            {/* Профиль для мобильных */}
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
              {isCheckingAuth ? 'Загрузка...' : getUserDisplayName()}
            </Link>

            {/* Тест для мобильных */}
            {process.env.NODE_ENV === 'development' && (
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
                Тест
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
