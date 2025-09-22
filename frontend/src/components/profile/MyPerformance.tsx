'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Award, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextSWR';
import { useSWRRolesPerformance } from '@/hooks/useSWRRolesPerformance';

export default function MyPerformance() {
  const { user } = useAuth();
  const { progress, loading, error } = useSWRRolesPerformance();
  
  // Extract overall progress data
  const rolesData = progress?.roles || [];
  const overallStats = progress?.overall || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (!rolesData || rolesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">No Performance Data</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            You haven't completed any performance assessments yet.
          </p>
          <Button onClick={() => window.location.href = '/roles-performance'}>
            Start Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Use data from API response
  const totalItems = overallStats.totalItemsAcrossRoles || 0;
  const totalYesAnswers = overallStats.totalYesAnswers || 0;
  const overallMasteryPercentage = overallStats.overallProgressPercentage || 0;


  const getMasteryColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981'; // Green
    if (percentage >= 60) return '#3b82f6'; // Blue
    if (percentage >= 40) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getMasteryLabel = (percentage: number) => {
    if (percentage >= 80) return 'Expert';
    if (percentage >= 60) return 'Proficient';
    if (percentage >= 40) return 'Developing';
    return 'Needs Development';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Performance</h2>
          <p className="text-muted-foreground">
            Track your competency mastery across all roles
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {getMasteryLabel(overallMasteryPercentage)}
        </Badge>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Mastery</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMasteryPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {totalYesAnswers} of {totalItems} items mastered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles Assessed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalRoles || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total roles evaluated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Competency items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mastered Items</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalYesAnswers}</div>
            <p className="text-xs text-muted-foreground">
              Items marked as "Yes"
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rolesData.map((role) => {
          const masteryPercentage = Math.round((role.yesAnswers / role.totalItems) * 100);
          const masteryColor = getMasteryColor(masteryPercentage);
          const masteryLabel = getMasteryLabel(masteryPercentage);

          return (
            <Card key={role.roleId} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{role.roleName}</CardTitle>
                  <Badge 
                    variant="outline" 
                    style={{ 
                      color: masteryColor,
                      borderColor: masteryColor 
                    }}
                  >
                    {masteryLabel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Mastery Level</span>
                      <span className="font-medium">{masteryPercentage}%</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div 
                        className="h-full transition-all duration-300 ease-in-out"
                        style={{ 
                          width: `${masteryPercentage}%`,
                          backgroundColor: masteryColor
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Mastered</p>
                      <p className="font-semibold text-green-600">{role.yesAnswers}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Items</p>
                      <p className="font-semibold">{role.totalItems}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-6">
        <Button 
          onClick={() => window.location.href = '/roles-performance'}
          className="flex items-center gap-2"
        >
          <Target className="h-4 w-4" />
          View Detailed Assessment
        </Button>
      </div>
    </div>
  );
}
