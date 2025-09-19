'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Shield, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthAPI, TeamMember, IDPAPI, IDPAssessment, IDPCompetencyScores } from '@/lib/api';
import { IDPDevelopmentPlanTable } from '@/components/idp/IDPDevelopmentPlanTable';

export default function UserIDP() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');

  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [idpAssessment, setIdpAssessment] = useState<IDPAssessment | null>(null);
  const [idpScores, setIdpScores] = useState<IDPCompetencyScores>({});
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

      // Load user's IDP data
      const idpResponse = await IDPAPI.getUserAssessment(parseInt(userId));
      if (idpResponse.data) {
        setIdpAssessment(idpResponse.data.assessment);
        setIdpScores(idpResponse.data.scores || {});
      } else {
        throw new Error(idpResponse.message || 'Failed to load user IDP');
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
      default: return role;
    }
  };

  const handleBackToTeam = () => {
    router.push('/profile?tab=team');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading user IDP...</p>
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
            <p className="text-lg text-destructive mb-2">Error loading user IDP</p>
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
            <h1 className="text-2xl font-bold">Individual Development Plan</h1>
            <p className="text-muted-foreground">View team member's development progress</p>
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

      {/* IDP Assessment Information */}
      {idpAssessment ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assessment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={idpAssessment.status === 'completed' ? 'default' : 'secondary'}>
                    {idpAssessment.status.charAt(0).toUpperCase() + idpAssessment.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(idpAssessment.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Development Plan Table */}
          {idpAssessment.status === 'completed' && idpScores && idpAssessment.role?.competencies && (
            <IDPDevelopmentPlanTable
              competencyScores={idpAssessment.role.competencies.map(comp => ({
                id: comp.id,
                score: idpScores[comp.id.toString()] || 0,
                questions: comp.questions || [],
                actions: comp.actions || [],
                label: comp.label
              }))}
              answers={idpAssessment.answers?.reduce((acc, answer) => {
                acc[answer.questionId] = answer.answer;
                return acc;
              }, {} as { [questionId: number]: 'yes' | 'no' }) || {}}
            />
          )}

          {idpAssessment.status !== 'completed' && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  This user's IDP assessment is not yet completed.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  The development plan will be available once they complete their assessment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No active IDP assessment found for this user.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
