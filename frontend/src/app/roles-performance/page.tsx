'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LabelList, RadialBar, RadialBarChart } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  Users, 
  ClipboardList, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  Target,
  ChevronRight,
  Clock,
  CheckCircle,
  Circle,
  Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useRolesPerformance, RolesPerformanceUtils } from '@/hooks/useRolesPerformance';

function RolesPerformancePageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { roles, progress, loading, error } = useRolesPerformance();

  const handleRoleClick = (roleId: number) => {
    router.push(`/roles-performance/${roleId}`);
  };

  // Define custom order for roles
  const roleOrder = {
    'counter_help': 1,
    'counter_help_cross_trained': 2,
    'kitchen_help': 3,
    'cook': 4,
    'shift_lead': 5,
  };

  // Sort roles according to custom order
  const sortedRoles = [...roles].sort((a, b) => {
    const orderA = roleOrder[a.name as keyof typeof roleOrder] || 999;
    const orderB = roleOrder[b.name as keyof typeof roleOrder] || 999;
    return orderA - orderB;
  });


  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access Roles Performance module.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading roles performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/20">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Roles Performance</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Assess your skills across different restaurant roles and track your professional development
          </p>
        </div>
      </div>

        {/* Overall Statistics */}
      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress.overall.totalRoles}</div>
              <p className="text-xs text-muted-foreground">
                Available positions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Roles</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{progress.overall.completedRoles}</div>
              <p className="text-xs text-muted-foreground">
                Fully assessed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${RolesPerformanceUtils.getProgressColor(progress.overall.overallProgressPercentage)}`}>
                {progress.overall.overallProgressPercentage}%
              </div>
              <p className="text-xs text-muted-foreground">
                {progress.overall.totalAnsweredAcrossRoles} of {progress.overall.totalItemsAcrossRoles} skills
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Mastered</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{progress.overall.totalYesAnswers}</div>
              <p className="text-xs text-muted-foreground">
                "Yes" responses
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      {progress && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Role Distribution Chart */}
          <Card className="bg-card text-card-foreground">
            <CardHeader className="items-center pb-2">
              <CardTitle className="text-sm font-medium">Role Progress</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <ChartContainer
                config={{
                  answeredItems: {
                    label: "Answered Items",
                    color: "var(--chart-1)",
                  },
                }}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <RadialBarChart
                  data={progress.roles.map((roleProgress, index) => {
                    // Use the same logic as card background colors
                    let color;
                    if (roleProgress.progressPercentage === 100) {
                      color = "#16a34a"; // green-600 for 100%
                    } else if (roleProgress.progressPercentage >= 50) {
                      color = "#2563eb"; // blue-600 for ≥ 50%
                    } else if (roleProgress.progressPercentage > 0) {
                      color = "#eab308"; // yellow-600 for > 0%
                    } else {
                      color = "#6b7280"; // gray-500 for 0%
                    }
                    
                    return {
                      role: roles.find(r => r.id === roleProgress.roleId)?.displayName || `Role ${roleProgress.roleId}`,
                      answeredItems: roleProgress.yesAnswers,
                      fill: color,
                    };
                  })}
                  startAngle={-90}
                  endAngle={270}
                  innerRadius={30}
                  outerRadius={110}
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="role" />}
                  />
                  <RadialBar dataKey="answeredItems" background>
                    <LabelList
                      position="insideStart"
                      dataKey="role"
                      className="fill-white capitalize mix-blend-luminosity"
                      fontSize={11}
                    />
                  </RadialBar>
                </RadialBarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Placeholder Card */}
          <Card className="bg-card text-card-foreground">
            <CardHeader className="items-center pb-2">
              <CardTitle className="text-sm font-medium">Coming Soon</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[250px]">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Additional insights</p>
                <p className="text-xs mt-1">Will be added here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Roles List */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Available Roles
          </CardTitle>
          <CardDescription>
            Select a role to begin or continue your performance assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedRoles.map((role) => {
              const roleProgress = progress?.roles.find(p => p.roleId === role.id);
              
              return (
                <Card
                  key={role.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    RolesPerformanceUtils.getProgressBgColor(roleProgress?.progressPercentage || 0)
                  }`}
                  onClick={() => handleRoleClick(role.id)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header with title and badge */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{role.displayName}</h3>
                        {(() => {
                          if (!roleProgress) return null;
                          const isCompleted = roleProgress.answeredItems === roleProgress.totalItems && roleProgress.answeredItems > 0;
                          
                          if (isCompleted) {
                            return (
                              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            );
                          } else if (roleProgress.progressPercentage > 0) {
                            return (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800">
                                <Clock className="h-3 w-3 mr-1" />
                                In Progress
                              </Badge>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      
                      {/* Description */}
                      <p className="text-muted-foreground text-sm">{role.description}</p>

                      {/* Progress stats */}
                      {roleProgress && (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Circle className="h-4 w-4" />
                            <span>{roleProgress.answeredItems} of {roleProgress.totalItems} skills assessed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span>{roleProgress.yesAnswers} skills mastered</span>
                          </div>
                        </div>
                      )}

                      {/* Progress percentage */}
                      {roleProgress && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-sm text-muted-foreground">Progress</div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${RolesPerformanceUtils.getProgressColor(roleProgress.progressPercentage)}`}>
                              {roleProgress.progressPercentage}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Hardcoded Black Shirt Role - Coming Soon */}
            <Card className="bg-gray-100 border-gray-200 dark:bg-gray-900 dark:border-gray-700 opacity-75 cursor-not-allowed">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header with title and badge */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Black Shirt</h3>
                    <Badge variant="outline" className="bg-gray-200 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">
                      <Lock className="h-3 w-3 mr-1" />
                      Coming Soon
                    </Badge>
                  </div>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-sm">Performance assessment for Black Shirts</p>

                  {/* Not available status */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-400 dark:text-gray-500">
                        —
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RolesPerformancePage() {
  return (
    <ProtectedRoute>
      <RolesPerformancePageContent />
    </ProtectedRoute>
  );
}
