'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthAPI } from '@/lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setIsAuthenticated(false);
          router.push('/auth');
          return;
        }

        // Проверяем валидность токена
        await AuthAPI.me();
        setIsAuthenticated(true);
      } catch (error) {
        // Токен недействителен
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        router.push('/auth');
      }
    };

    checkAuth();
  }, [router]);

  // Показываем загрузку пока проверяем авторизацию
  if (isAuthenticated === null) {
    return (
      fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Проверка авторизации...</p>
          </div>
        </div>
      )
    );
  }

  // Если не авторизован, не показываем контент (происходит редирект)
  if (!isAuthenticated) {
    return null;
  }

  // Показываем защищенный контент
  return <>{children}</>;
}
