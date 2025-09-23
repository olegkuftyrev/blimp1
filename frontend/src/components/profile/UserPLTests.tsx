'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Shield, Briefcase, Calculator, CheckCircle, XCircle, Clock, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AuthAPI, TeamMember } from '@/lib/api';
import { usePLTestSetsForUser, usePLStatsForUser } from '@/hooks/useSWRPL';

export default function UserPLTests() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');

  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse userId to number
  const userIdNumber = userId ? parseInt(userId) : null;

  // Use user-specific hooks to fetch data for the selected user
  const { testSets, isLoading: testSetsLoading, error: testSetsError } = usePLTestSetsForUser(userIdNumber);
  const { stats, isLoading: statsLoading, error: statsError } = usePLStatsForUser(userIdNumber);

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

    } catch (err: any) {
      console.error('Failed to load user data:', err);
      setError(err.message || 'Failed to load user data');
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
      case 'tablet': return 'Tablet';
      default: return role;
    }
  };

  const getPassFailBadge = (testSet: any) => {
    if (testSet.progress.percentage === 100) {
      const isPass = testSet.progress.correct >= testSet.progress.total * 0.7;
      return (
        <Badge variant={isPass ? "default" : "destructive"}>
          {isPass ? 'Pass' : 'Fail'}
        </Badge>
      );
    }
    return <Badge variant="secondary">Incomplete</Badge>;
  };

  const handleBackToTeam = () => {
    router.push('/profile?tab=team');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading user data...</p>
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
          <Button onClick={handleBackToTeam} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!teamMember) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">User Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">The requested user could not be found.</p>
          <Button onClick={handleBackToTeam} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={handleBackToTeam} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              P&L Test Results
            </h2>
            <p className="text-muted-foreground">Performance data for {teamMember.fullName}</p>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Name</p>
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
        </CardContent>
      </Card>

      {/* Error Messages */}
      {(testSetsError || statsError) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {testSetsError?.message || statsError?.message || 'You do not have permission to view this user\'s P&L test data.'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Only admin users can view other users' P&L test results.
            </p>
            <Button onClick={handleBackToTeam} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Team
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Overall Stats */}
      {stats && !statsError && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Overall P&L Test Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalTestSets}</div>
                <div className="text-sm text-muted-foreground">Test Sets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.incorrectAnswers}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.percentage.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Accuracy</span>
                <span>{stats.percentage.toFixed(1)}%</span>
              </div>
              <Progress value={stats.percentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Sets */}
      {!testSetsError && (
        <Card>
          <CardHeader>
            <CardTitle>P&L Test Sets</CardTitle>
          </CardHeader>
          <CardContent>
            {testSetsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading test sets...</p>
            </div>
          ) : testSetsError ? (
            <div className="text-center py-8">
              <p className="text-destructive">Failed to load test sets</p>
            </div>
          ) : testSets.length === 0 ? (
            <div className="text-center py-8">
              <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">No Test Sets Found</p>
              <p className="text-muted-foreground">This user hasn't completed any P&L practice tests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testSets.map((testSet) => (
                <div key={testSet.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{testSet.name}</h3>
                      <p className="text-sm text-muted-foreground">{testSet.description}</p>
                    </div>
                    {getPassFailBadge(testSet)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{testSet.progress.correct}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">{testSet.progress.answered - testSet.progress.correct}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Incorrect</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">{testSet.progress.answered}/{testSet.progress.total}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Answered</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">{testSet.progress.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${testSet.progress.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}
