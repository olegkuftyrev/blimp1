'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Briefcase, Shield, LogOut, Edit, Save, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AuthAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface UserProfile {
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

const JOB_TITLES = [
  'Hourly Associate',
  'AM',
  'Chef',
  'SM/GM/TL',
  'ACO',
  'RDO'
] as const;

function ProfilePageContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    job_title: '',
    email: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AuthAPI.me();
      setUser(response.user);
      setEditForm({
        fullName: response.user.fullName || '',
        job_title: response.user.job_title || '',
        email: response.user.email || ''
      });
    } catch (err: any) {
      console.error('Failed to load user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      fullName: user?.fullName || '',
      job_title: user?.job_title || '',
      email: user?.email || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      fullName: user?.fullName || '',
      job_title: user?.job_title || '',
      email: user?.email || ''
    });
  };

  const handleSave = async () => {
    try {
      const updateData: any = {
        fullName: editForm.fullName,
        jobTitle: editForm.job_title
      };
      
      // Only include email if user is admin and email has changed
      if (user?.role === 'admin' && editForm.email !== user.email) {
        updateData.email = editForm.email;
      }
      
      const response = await AuthAPI.updateProfile(updateData);
      
      setUser(response.user);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setError('Failed to save changes');
    }
  };

  const handleLogout = async () => {
    try {
      await AuthAPI.logout();
      localStorage.removeItem('auth_token');
      router.push('/auth');
    } catch (err) {
      console.error('Logout failed:', err);
      // Even if logout fails, clear local storage and redirect
      localStorage.removeItem('auth_token');
      router.push('/auth');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadUserProfile}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">Failed to load profile data</p>
            <Button onClick={() => router.push('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="text-muted-foreground">Manage your profile information</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {user.fullName || 'Name not specified'}
                </CardTitle>
                <p className="text-muted-foreground">ID: {user.id}</p>
              </div>
            </div>
            <Badge variant={getRoleBadgeColor(user.role) as any}>
              {getRoleDisplayName(user.role)}
            </Badge>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Email */}
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Email</p>
                {isEditing && user.role === 'admin' ? (
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="Enter email"
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <p className="text-muted-foreground">{user.email}</p>
                    {user.role === 'admin' && !isEditing && (
                       <Badge variant="outline" className="text-xs">
                         Editable
                       </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Full Name</p>
                {isEditing ? (
                  <Input
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {user.fullName || 'Not specified'}
                  </p>
                )}
              </div>
            </div>

            {/* Job Title */}
            <div className="flex items-center space-x-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Job Title</p>
                {isEditing ? (
                  <select
                    value={editForm.job_title}
                    onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select job title</option>
                    {JOB_TITLES.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-muted-foreground">
                    {user.job_title || 'Not specified'}
                  </p>
                )}
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Role</p>
                <p className="text-muted-foreground">{getRoleDisplayName(user.role)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              {isEditing ? (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              
              <Button onClick={handleLogout} variant="destructive" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
