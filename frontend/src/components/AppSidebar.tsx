'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useSWRRecipeBookItems } from '@/hooks/useSWRMenuItems';
import { useAuth } from '@/contexts/AuthContextSWR';
import { User, Users, Target, BarChart3, BookOpen, ChevronDown } from 'lucide-react';
import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'admin': return 'Administrator';
    case 'ops_lead': return 'Operations Lead';
    case 'black_shirt': return 'Black Shirt';
    case 'associate': return 'Associate';
    case 'tablet': return 'Tablet';
    default: return role;
  }
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin': return 'destructive';
    case 'ops_lead': return 'secondary';
    case 'black_shirt': return 'outline';
    case 'associate': return 'default';
    case 'tablet': return 'outline';
    default: return 'default';
  }
};

export function AppSidebar() {
  const { user } = useAuth();
  const { menuItems: recipeItems, isLoading: recipeLoading } = useSWRRecipeBookItems();
  const { state } = useSidebar();
  
  // Group recipes by category
  const recipesByCategory = recipeItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof recipeItems>);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'my-profile';
  const [openCategory, setOpenCategory] = React.useState<string | null>('Chicken') // Default to Chicken being open

  // Apply smooth transition classes based on sidebar state
  const sidebarClasses = state === 'collapsed' 
    ? 'w-0 opacity-0 pointer-events-none overflow-hidden' 
    : 'w-[--sidebar-width] opacity-100 pointer-events-auto';

  // Profile navigation items
  const profileItems = [
    {
      title: "My Profile",
      url: "/profile?tab=my-profile",
      icon: User,
      isActive: pathname === '/profile' && tab === 'my-profile'
    },
    {
      title: "My Performance",
      url: "/profile?tab=performance",
      icon: BarChart3,
      isActive: pathname === '/profile' && tab === 'performance'
    },
    {
      title: "IDP",
      url: "/profile?tab=idp",
      icon: Target,
      isActive: pathname === '/profile' && tab === 'idp'
    },
    ...(user?.role !== 'associate' ? [{
      title: "Team",
      url: "/profile?tab=team",
      icon: Users,
      isActive: pathname === '/profile' && tab === 'team'
    }] : [])
  ];


  return (
    <Sidebar 
      collapsible="icon" 
      className={`transition-all duration-300 ease-in-out ${sidebarClasses}`}
    >
      {/* Hide header (logo/profile) on recipe-book pages per request */}
      {!pathname.startsWith('/recipe-book') && (
        <SidebarHeader className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-sidebar-accent rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-sidebar-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-sidebar-foreground">
                {user?.fullName || 'User'}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={getRoleBadgeColor(user?.role || '') as any} className="text-xs">
                  {getRoleDisplayName(user?.role || '')}
                </Badge>
              </div>
            </div>
          </div>
        </SidebarHeader>
      )}
      
      <SidebarContent>
        {/* Profile Section */}
        {pathname.startsWith('/profile') && (
          <SidebarGroup>
            <SidebarGroupLabel>Profile</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {profileItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Recipe Book Section */}
        {pathname.startsWith('/recipe-book') && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm font-medium">Recipe Book</SidebarGroupLabel>
            <SidebarGroupContent>

              {/* Recipe Book Categories */}
              {Object.entries(recipesByCategory).map(([category, items]) => {
                const categorySlug = category.toLowerCase();
                const isOpen = openCategory === category;
                
                const handleToggle = () => {
                  setOpenCategory(isOpen ? null : category);
                };

                return (
                  <div key={category} className="px-2 mt-1">
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      onClick={handleToggle}
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>{category}</span>
                      <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                    </button>
                    {isOpen && (
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuSub>
                            {recipeLoading ? (
                              <SidebarMenuSubItem>
                                <span className="text-sm text-muted-foreground">Loading recipes...</span>
                              </SidebarMenuSubItem>
                            ) : items.length === 0 ? (
                              <SidebarMenuSubItem>
                                <span className="text-sm text-muted-foreground">No {category.toLowerCase()} recipes found</span>
                              </SidebarMenuSubItem>
                            ) : (
                              items.map((item) => {
                                // Extract code from item title (e.g., "C1 Orange Chicken" -> "C1")
                                const code = item.itemTitle.split(' ')[0];
                                const title = item.itemTitle.replace(code + ' ', '');
                                const slug = code.toLowerCase();
                                
                                return (
                                  <SidebarMenuSubItem key={item.id}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={pathname === `/recipe-book/${categorySlug}/${slug}`}
                                    >
                                      <Link href={`/recipe-book/${categorySlug}/${slug}`}>
                                        <span>{code} - {title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })
                            )}
                          </SidebarMenuSub>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    )}
                  </div>
                );
              })}

            </SidebarGroupContent>
          </SidebarGroup>
        )}


      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  );
}
