'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Briefcase, Shield, Eye, BarChart3, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthAPI, TeamMember } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContextSWR';

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

export default function Team() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleViewIDP = (userId: number) => {
    router.push(`/profile?tab=user-idp&userId=${userId}`);
  };

  const handleViewPerformance = (userId: number) => {
    router.push(`/profile?tab=user-performance&userId=${userId}`);
  };

  const handleViewPLTests = (userId: number) => {
    router.push(`/profile?tab=user-pl-tests&userId=${userId}`);
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

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewIDP(member.id)}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View IDP
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPerformance(member.id)}
                    className="w-full"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Performance
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPLTests(member.id)}
                    className="w-full"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    View P&L Tests
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
    </div>
  );
}
