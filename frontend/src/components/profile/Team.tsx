'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Shield, Eye, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthAPI, TeamMember, IDPAPI, IDPAssessment, IDPCompetencyScores } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { IDPDevelopmentPlanTable } from '@/components/idp/IDPDevelopmentPlanTable';

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

export default function Team() {
  const { user: currentUser } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // IDP view state
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);
  const [idpAssessment, setIdpAssessment] = useState<IDPAssessment | null>(null);
  const [idpScores, setIdpScores] = useState<IDPCompetencyScores>({});
  const [idpLoading, setIdpLoading] = useState(false);
  const [idpError, setIdpError] = useState<string | null>(null);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AuthAPI.getTeamMembers();
      
      if (response.success) {
        setTeamMembers(response.data);
      } else {
        throw new Error(response.message || 'Failed to load team members');
      }
      
    } catch (err: any) {
      console.error('Failed to load team members:', err);
      setError('Failed to load team members');
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserIDP = async (userId: number) => {
    try {
      setIdpLoading(true);
      setIdpError(null);
      
      const response = await IDPAPI.getUserAssessment(userId);
      
      if (response.data) {
        setIdpAssessment(response.data.assessment);
        setIdpScores(response.data.scores || {});
        
        // Find the user from team members
        const user = teamMembers.find(member => member.id === userId);
        setSelectedUser(user || null);
        setSelectedUserId(userId);
      } else {
        throw new Error(response.message || 'Failed to load user IDP');
      }
      
    } catch (err: any) {
      console.error('Failed to load user IDP:', err);
      setIdpError(err.message || 'Failed to load user IDP');
      setIdpAssessment(null);
      setIdpScores({});
    } finally {
      setIdpLoading(false);
    }
  };

  const closeIDPView = () => {
    setSelectedUserId(null);
    setSelectedUser(null);
    setIdpAssessment(null);
    setIdpScores({});
    setIdpError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading team...</p>
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
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Team Members</h2>
        <p className="text-muted-foreground">View your team members and their information</p>
      </div>

      {teamMembers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">No Team Members Found</p>
            <p className="text-muted-foreground">There are currently no other team members in the system.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {member.fullName || 'Name not specified'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">ID: {member.id}</p>
                  </div>
                </div>
                <Badge variant={getRoleBadgeColor(member.role) as any}>
                  {getRoleDisplayName(member.role)}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Email */}
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>

                {/* Job Title */}
                {member.jobTitle && (
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Job Title</p>
                      <p className="text-sm text-muted-foreground">{member.jobTitle}</p>
                    </div>
                  </div>
                )}

                {/* Role */}
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-sm text-muted-foreground">{getRoleDisplayName(member.role)}</p>
                  </div>
                </div>

                {/* View IDP Button */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadUserIDP(member.id)}
                    className="w-full"
                    disabled={idpLoading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View IDP
                  </Button>
                </div>

                {/* Restaurants */}
                {member.restaurants && member.restaurants.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Restaurants</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.restaurants.map((restaurant, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {restaurant.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* IDP View Section */}
      {selectedUserId && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                IDP for {selectedUser?.fullName || 'Unknown User'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedUser?.role && getRoleDisplayName(selectedUser.role)} • {selectedUser?.email}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={closeIDPView}
            >
              <X className="h-4 w-4 mr-2" />
              Close IDP View
            </Button>
          </div>

          {idpLoading ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg text-muted-foreground">Loading IDP data...</p>
              </CardContent>
            </Card>
          ) : idpError ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-lg text-destructive mb-2">Error loading IDP</p>
                <p className="text-muted-foreground">{idpError}</p>
              </CardContent>
            </Card>
          ) : idpAssessment ? (
            <div className="space-y-4">
              {/* Assessment Info */}
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
      )}
    </div>
  );
}
