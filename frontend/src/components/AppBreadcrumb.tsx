'use client';

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronRight, Home, ChefHat, Users, BarChart3, Settings, History, Edit, Table, BookOpen } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface BreadcrumbConfig {
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
}

// Route configuration for breadcrumbs
const routeConfig: Record<string, BreadcrumbConfig> = {
  '/': { label: 'Landing', icon: Home },
  '/dashboard': { label: 'Dashboard', icon: Home },
  '/kitchen': { label: 'Kitchen Management', icon: ChefHat },
  '/kitchen/[id]': { label: 'Restaurant Kitchen', icon: ChefHat },
  '/kitchen/[id]/edit': { label: 'Edit Restaurant', icon: Edit },
  '/boh': { label: 'Back of House', icon: ChefHat },
  '/boh/history': { label: 'Order History', icon: History },
  '/boh/settings': { label: 'Kitchen Settings', icon: Settings },
  '/table': { label: 'Table Management', icon: Table },
  '/table/[id]': { label: 'Table Section', icon: Table },
  '/staff': { label: 'Staff Management', icon: Users },
  '/analytics': { label: 'Analytics', icon: BarChart3 },
  '/profile': { label: 'Profile', icon: Users },
  '/auth': { label: 'Authentication', icon: Users },
  '/idp': { label: 'IDP - Individual Development Plant', icon: BookOpen },
  '/pay-structure': { label: 'Pay Structure', icon: BarChart3 },
};

interface AppBreadcrumbProps {
  customItems?: BreadcrumbConfig[];
  className?: string;
}

export default function AppBreadcrumb({ customItems, className = "" }: AppBreadcrumbProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<any[]>([]);

  // Fetch restaurants for context
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await apiFetch<{data: any[]}>('simple-auth/restaurants');
        setRestaurants(response.data || []);
      } catch (error) {
        console.error('Error fetching restaurants for breadcrumb:', error);
        // Set empty array on error to prevent breadcrumb issues
        setRestaurants([]);
      }
    };

    if (user) {
      fetchRestaurants();
    }
  }, [user]);

  // Don't show breadcrumbs on landing page or auth page
  if (pathname === '/' || pathname === '/auth') {
    return null;
  }

  // Don't show breadcrumbs if user is not authenticated
  if (!user) {
    return null;
  }

  const generateBreadcrumbs = (): BreadcrumbConfig[] => {
    // If custom items provided, use them
    if (customItems) {
      return [{ label: 'Dashboard', href: '/dashboard', icon: Home }, ...customItems];
    }

    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbConfig[] = [];

    // Always start with Dashboard for authenticated pages
    breadcrumbs.push({ label: 'Dashboard', href: '/dashboard', icon: Home });

    // Special handling for BOH pages with restaurant_id parameter
    const restaurantId = searchParams.get('restaurant_id');
    if ((pathname.startsWith('/boh') || pathname.startsWith('/table')) && restaurantId && restaurants.length > 0) {
      const restaurant = restaurants.find(r => r.id === parseInt(restaurantId));
      
      // Add Kitchen Management
      breadcrumbs.push({ 
        label: 'Kitchen Management', 
        href: '/kitchen', 
        icon: ChefHat 
      });
      
      // Add Restaurant name if found
      if (restaurant) {
        breadcrumbs.push({
          label: restaurant.name,
          href: `/kitchen/${restaurantId}`,
          icon: ChefHat,
        });
      }
      
      // Add current page
      if (pathname === '/boh') {
        breadcrumbs.push({ label: 'Back of House', icon: ChefHat });
      } else if (pathname === '/boh/history') {
        breadcrumbs.push({ label: 'Order History', icon: History });
      } else if (pathname === '/boh/settings') {
        breadcrumbs.push({ label: 'Kitchen Settings', icon: Settings });
      } else if (pathname.startsWith('/table/')) {
        const tableId = pathname.split('/')[2];
        breadcrumbs.push({ label: `Table ${tableId}`, icon: Table });
      }
      
      return breadcrumbs;
    }

    // Regular path-based breadcrumb generation
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      // Skip if this is just '/dashboard' since we already added it
      if (currentPath === '/dashboard') {
        return;
      }
      
      // Handle dynamic routes
      let routeKey = currentPath;
      if (segment.match(/^\d+$/)) {
        // Replace numeric segments with [id] for dynamic routes
        routeKey = currentPath.replace(/\/\d+/g, '/[id]');
        
        // Try to get restaurant name for kitchen routes
        if (currentPath.includes('/kitchen/') && restaurants.length > 0) {
          const restaurantId = parseInt(segment);
          const restaurant = restaurants.find(r => r.id === restaurantId);
          if (restaurant) {
            breadcrumbs.push({
              label: restaurant.name,
              href: isLast ? undefined : currentPath,
              icon: ChefHat,
            });
            return; // Skip the default handling
          }
        }
      }

      const config = routeConfig[routeKey];
      if (config) {
        breadcrumbs.push({
          label: config.label,
          href: isLast ? undefined : currentPath,
          icon: config.icon,
        });
      } else {
        // Fallback for unknown routes
        breadcrumbs.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          href: isLast ? undefined : currentPath,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't render if only one item (Dashboard)
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <div className={`mb-6 ${className}`}>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const IconComponent = item.icon;

            return (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="flex items-center space-x-2">
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href || '#'} className="flex items-center space-x-2 hover:text-foreground transition-colors">
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                        <span>{item.label}</span>
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                )}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

// Specialized breadcrumb for restaurant-specific pages
interface RestaurantBreadcrumbProps {
  restaurantName?: string;
  restaurantId?: string;
  currentPage: string;
  className?: string;
}

export function RestaurantBreadcrumb({ 
  restaurantName, 
  restaurantId, 
  currentPage,
  className = "" 
}: RestaurantBreadcrumbProps) {
  const breadcrumbs: BreadcrumbConfig[] = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Kitchen Management', href: '/kitchen', icon: ChefHat },
  ];

  if (restaurantName && restaurantId) {
    breadcrumbs.push({
      label: restaurantName,
      href: `/kitchen/${restaurantId}`,
      icon: ChefHat,
    });
  }

  // Add current page as last item
  const pageConfig: Record<string, { label: string; icon: React.ComponentType<any> }> = {
    'boh': { label: 'Back of House', icon: ChefHat },
    'history': { label: 'Order History', icon: History },
    'settings': { label: 'Kitchen Settings', icon: Settings },
    'edit': { label: 'Edit Restaurant', icon: Edit },
    'table': { label: 'Table Management', icon: Table },
  };

  if (pageConfig[currentPage]) {
    breadcrumbs.push({
      label: pageConfig[currentPage].label,
      icon: pageConfig[currentPage].icon,
    });
  }

  return (
    <div className={`mb-6 ${className}`}>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const IconComponent = item.icon;

            return (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="flex items-center space-x-2">
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href || '#'} className="flex items-center space-x-2 hover:text-foreground transition-colors">
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                        <span>{item.label}</span>
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                )}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
