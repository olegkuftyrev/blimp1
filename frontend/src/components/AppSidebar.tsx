'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { User, Users, Target, BarChart3 } from 'lucide-react';
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
} from "@/components/ui/sidebar";
import { useAuth } from '@/contexts/AuthContextSWR';
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'admin': return 'Administrator';
    case 'ops_lead': return 'Operations Lead';
    case 'black_shirt': return 'Black Shirt';
    case 'associate': return 'Associate';
    default: return role;
  }
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin': return 'destructive';
    case 'ops_lead': return 'secondary';
    case 'black_shirt': return 'outline';
    case 'associate': return 'default';
    default: return 'default';
  }
};

export function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'my-profile';

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
    <Sidebar>
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


        {/* Removed IDP Section - not needed on IDP pages */}
        {false && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>IDP Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {idpItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathname === item.url}>
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

            {/* IDP Summary */}
            <SidebarGroup>
              <SidebarGroupLabel>Assessment Summary</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  {idpData.loading ? (
                    <div className="text-xs text-sidebar-foreground/60">Loading...</div>
                  ) : idpData.error ? (
                    <div className="text-xs text-red-500">Error loading data</div>
                  ) : !idpData.assessment ? (
                    <div className="text-xs text-sidebar-foreground/60">No assessment started</div>
                  ) : (
                    <>
                      {/* Assessment Status */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-sidebar-foreground/60">Status</span>
                          <Badge variant="outline" className="text-xs">
                            {idpData.assessment.status === 'completed' ? 'Complete' : 
                             idpData.assessment.status === 'in_progress' ? 'In Progress' : 'Draft'}
                          </Badge>
                        </div>
                      </div>

                      {/* Progress */}
                      {idpData.assessment.status !== 'completed' && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-sidebar-foreground/60">Progress</span>
                            <span className="text-sidebar-foreground">{Math.round(idpData.progress)}%</span>
                          </div>
                          <Progress value={idpData.progress} className="h-1" />
                        </div>
                      )}

                      {/* Expert Competencies */}
                      {idpData.assessment.status === 'completed' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <Award className="h-3 w-3 text-green-600" />
                            <span className="text-sidebar-foreground/60">Expert Areas</span>
                            <span className="ml-auto text-sidebar-foreground font-medium">{idpData.expertCompetencies}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs">
                            <AlertTriangle className="h-3 w-3 text-yellow-600" />
                            <span className="text-sidebar-foreground/60">Development</span>
                            <span className="ml-auto text-sidebar-foreground font-medium">{idpData.developmentAreas}</span>
                          </div>
                        </div>
                      )}

                      {/* Last Assessment Date */}
                      {idpData.lastAssessmentDate && (
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="h-3 w-3 text-sidebar-foreground/40" />
                          <span className="text-sidebar-foreground/60">
                            {idpData.assessment.status === 'completed' ? 'Completed' : 'Updated'}
                          </span>
                          <span className="ml-auto text-sidebar-foreground/80 text-xs">
                            {new Date(idpData.lastAssessmentDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  );
}
