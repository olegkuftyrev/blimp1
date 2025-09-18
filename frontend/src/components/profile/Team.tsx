'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface TeamMember {
  id: number;
  email: string;
  fullName?: string | null;
  role: 'admin' | 'ops_lead' | 'black_shirt' | 'associate';
  job_title?: string;
}

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

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Create API endpoint to get team members
      // For now, we'll use a placeholder with empty array
      setTeamMembers([]);
      
    } catch (err: any) {
      console.error('Failed to load team members:', err);
      setError('Failed to load team members');
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
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
                {member.job_title && (
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Job Title</p>
                      <p className="text-sm text-muted-foreground">{member.job_title}</p>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
