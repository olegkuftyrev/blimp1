'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Shield, Briefcase, BarChart3, TrendingUp, Target, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthAPI, TeamMember, RolesPerformanceAPI, RoleProgress, OverallProgress } from '@/lib/api';

export default function UserPerformance() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');

  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [overallProgress, setOverallProgress] = useState<OverallProgress | null>(null);
  const [roleProgress, setRoleProgress] = useState<RoleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserData();
    } else {
      setError('No user ID provided');
      setLoading(false);
    }
  }, [userId]);

  const loadUserData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Load team members to find the specific user
      const teamResponse = await AuthAPI.getTeamMembers();
      if (teamResponse.success) {
        const user = teamResponse.data.find(member => member.id.toString() === userId);
        if (user) {
          setTeamMember(user);
        } else {
          throw new Error('User not found in your team');
        }
      } else {
        throw new Error('Failed to load team members');
      }

      // Load user's overall performance progress
      const overallResponse = await RolesPerformanceAPI.getOverallProgress();
      if (overallResponse.success) {
        setOverallProgress(overallResponse.data);
        
        // Filter progress for the specific user (assuming we can get user-specific data)
        // For now, we'll show overall progress - in a real app, you'd have user-specific endpoints
        setRoleProgress(overallResponse.data.roles);
      }

    } catch (err: any) {
      console.error('Failed to load user performance data:', err);
      setError(err.message || 'Failed to load user performance data');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'ops_lead': return 'Operations Lead';
      case 'black_shirt': return 'Black Shirt';
      case 'associate': return 'Associate';
      default: return role;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage > 0) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-400 dark:text-gray-500';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-100 border-green-200 dark:bg-green-950/20 dark:border-green-800';
    if (percentage >= 80) return 'bg-blue-100 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800';
    if (percentage >= 50) return 'bg-yellow-100 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800';
    if (percentage > 0) return 'bg-orange-100 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800';
    return 'bg-card text-card-foreground border-border';
  };

  const handleBackToTeam = () => {
    router.push('/profile?tab=team');
  };

  const handleRoleClick = (roleId: number) => {
    router.push(`/profile?tab=user-role-questions&userId=${userId}&roleId=${roleId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading user performance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToTeam}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Button>
        </div>
        
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg text-destructive mb-2">Error loading user performance</p>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToTeam}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Roles Performance</h1>
            <p className="text-muted-foreground">View team member's performance progress</p>
          </div>
        </div>
      </div>

      {/* User Information */}
      {teamMember && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <User className="h-6 w-6" />
              <span>Team Member Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Full Name</p>
                    <p className="text-sm text-muted-foreground">{teamMember.fullName || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{teamMember.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <Badge variant="outline">{getRoleDisplayName(teamMember.role)}</Badge>
                  </div>
                </div>

                {teamMember.jobTitle && (
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Job Title</p>
                      <p className="text-sm text-muted-foreground">{teamMember.jobTitle}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Restaurants */}
            {teamMember.restaurants && teamMember.restaurants.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Assigned Restaurants</p>
                <div className="flex flex-wrap gap-2">
                  {teamMember.restaurants.map((restaurant, index) => (
                    <Badge key={index} variant="secondary">
                      {restaurant.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overall Progress */}
      {overallProgress && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getProgressColor(overallProgress.overall.overallProgressPercentage)}`}>
                {overallProgress.overall.overallProgressPercentage}%
              </div>
              <p className="text-xs text-muted-foreground">
                {overallProgress.overall.totalAnsweredAcrossRoles} of {overallProgress.overall.totalItemsAcrossRoles} skills
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Roles</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallProgress.overall.completedRoles} / {overallProgress.overall.totalRoles}
              </div>
              <p className="text-xs text-muted-foreground">
                Roles completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mastery Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getProgressColor((overallProgress.overall.totalYesAnswers / overallProgress.overall.totalAnsweredAcrossRoles) * 100)}`}>
                {overallProgress.overall.totalAnsweredAcrossRoles > 0 
                  ? Math.round((overallProgress.overall.totalYesAnswers / overallProgress.overall.totalAnsweredAcrossRoles) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Skills mastered
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role Progress */}
      {roleProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6" />
              <span>Role Performance Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {roleProgress.map((role) => (
                <div key={role.roleId} className={`p-4 rounded-lg border ${getProgressBgColor(role.progressPercentage)} hover:shadow-md transition-shadow cursor-pointer`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{role.roleName}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getProgressColor(role.progressPercentage)}`}>
                        {role.progressPercentage}%
                      </span>
                      {role.isCompleted && (
                        <Badge variant="default" className="text-xs">Completed</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 mb-2">
                    <div 
                      className="h-full transition-all duration-300 ease-in-out"
                      style={{ 
                        width: `${role.progressPercentage}%`,
                        backgroundColor: role.progressPercentage === 100 
                          ? '#16a34a' // green-600
                          : role.progressPercentage >= 80 
                          ? '#2563eb' // blue-600
                          : role.progressPercentage >= 50 
                          ? '#eab308' // yellow-600
                          : role.progressPercentage > 0 
                          ? '#f97316' // orange-500
                          : '#6b7280' // gray-500
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Items</p>
                      <p className="font-medium">{role.totalItems}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Answered</p>
                      <p className="font-medium">{role.answeredItems}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Yes Answers</p>
                      <p className="font-medium text-green-600">{role.yesAnswers}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mastery</p>
                      <p className="font-medium">{role.yesPercentage}%</p>
                    </div>
                  </div>
                  
                  {/* Edit Questions Button */}
                  <div className="mt-4 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleClick(role.roleId);
                      }}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Questions</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {roleProgress.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              No performance data available for this user.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Performance data will appear once the user starts completing their role assessments.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
