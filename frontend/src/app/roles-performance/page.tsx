'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Circle
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
          <div className="space-y-4">
            {roles.map((role) => {
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
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{role.displayName}</h3>
                          {roleProgress?.isCompleted && (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {roleProgress && !roleProgress.isCompleted && roleProgress.progressPercentage > 0 && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800">
                              <Clock className="h-3 w-3 mr-1" />
                              In Progress
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{role.description}</p>
                        
                        {role.trainingTimeFrame && (
                          <p className="text-sm text-muted-foreground mb-3">
                            <Clock className="h-4 w-4 inline mr-1" />
                            Training Time: {role.trainingTimeFrame}
                          </p>
                        )}

                        {roleProgress && (
                          <div className="flex items-center gap-4 text-sm">
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
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {roleProgress && (
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${RolesPerformanceUtils.getProgressColor(roleProgress.progressPercentage)}`}>
                              {roleProgress.progressPercentage}%
                            </div>
                            <div className="text-xs text-muted-foreground">Complete</div>
                          </div>
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
