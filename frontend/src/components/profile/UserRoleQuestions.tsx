'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, RefreshCw, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthAPI, TeamMember, RolesPerformanceAPI, RolePerformanceWithSections, UserPerformanceAnswer } from '@/lib/api';

export default function UserRoleQuestions() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');
  const roleId = searchParams.get('roleId');

  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [roleData, setRoleData] = useState<RolePerformanceWithSections | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserPerformanceAnswer>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const AUTO_SAVE_DELAY = 1000; // 1 second delay

  useEffect(() => {
    if (userId && roleId) {
      loadUserData();
    } else {
      setError('Missing user ID or role ID');
      setLoading(false);
    }
  }, [userId, roleId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const loadUserData = async () => {
    if (!userId || !roleId) return;

    try {
      setLoading(true);
      setError(null);

      // Load team member info
      const teamResponse = await AuthAPI.getTeamMembers();
      if (teamResponse.success) {
        const user = teamResponse.data.find(member => member.id.toString() === userId);
        if (user) {
          setTeamMember(user);
        } else {
          throw new Error('User not found in your team');
        }
      }

      // Load role data with sections and questions
      const roleResponse = await RolesPerformanceAPI.getRole(parseInt(roleId));
      if (roleResponse.success) {
        setRoleData(roleResponse.data);
      } else {
        throw new Error('Failed to load role data');
      }

      // Load user's answers for this role
      const answersResponse = await RolesPerformanceAPI.getUserAnswers(parseInt(roleId));
      if (answersResponse.success) {
        setUserAnswers(answersResponse.data.answers);
      }

    } catch (err: any) {
      console.error('Failed to load user data:', err);
      setError(err.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-save function with debounce
  const autoSave = useCallback(async (answers: UserPerformanceAnswer) => {
    if (!roleId || !userId) return;

    try {
      setAutoSaveStatus('saving');
      console.log('Auto-saving answers:', answers);
      
      // Use the new bulk save API
      const response = await RolesPerformanceAPI.saveAnswersBulk(
        parseInt(roleId), 
        answers, 
        parseInt(userId)
      );
      
      if (response.success) {
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
        setHasChanges(false);
        
        // Reset status after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
        
        console.log('Auto-save successful:', response.data);
      } else {
        throw new Error('Save failed');
      }
      
    } catch (err: any) {
      console.error('Auto-save failed:', err);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  }, [roleId, userId]);

  const handleAnswerChange = (itemId: number, answer: 'yes' | 'no') => {
    const newAnswers = {
      ...userAnswers,
      [itemId]: answer
    };
    
    setUserAnswers(newAnswers);
    setHasChanges(true);
    setAutoSaveStatus('idle');
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout for auto-save
    debounceTimeoutRef.current = setTimeout(() => {
      autoSave(newAnswers);
    }, AUTO_SAVE_DELAY);
  };

  const handleSaveAnswers = async () => {
    if (!roleId) return;

    try {
      setSaving(true);
      
      // Clear any pending auto-save
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Trigger immediate save
      await autoSave(userAnswers);
      
    } catch (err: any) {
      console.error('Failed to save answers:', err);
      setError(err.message || 'Failed to save answers');
    } finally {
      setSaving(false);
    }
  };

  const handleBackToPerformance = () => {
    router.push(`/profile?tab=user-performance&userId=${userId}`);
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

  const getAnswerIcon = (answer: 'yes' | 'no' | undefined) => {
    if (answer === 'yes') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (answer === 'no') return <XCircle className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading role questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToPerformance}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Performance
          </Button>
        </div>
        
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg text-destructive mb-2">Error loading role questions</p>
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
          <Button variant="outline" onClick={handleBackToPerformance}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Performance
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Role Questions</h1>
            <div>
              <p className="text-muted-foreground">
                {teamMember?.fullName} - {roleData?.displayName}
              </p>
              {lastSaved && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Auto-save status */}
          {autoSaveStatus === 'saving' && (
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Clock className="h-3 w-3 mr-1 animate-spin" />
              Saving...
            </Badge>
          )}
          {autoSaveStatus === 'saved' && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
          {autoSaveStatus === 'error' && (
            <Badge variant="outline" className="text-red-600 border-red-600">
              <XCircle className="h-3 w-3 mr-1" />
              Save Failed
            </Badge>
          )}
          {hasChanges && autoSaveStatus === 'idle' && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Unsaved Changes
            </Badge>
          )}
          
          {/* Manual save button */}
          <Button 
            onClick={handleSaveAnswers} 
            disabled={!hasChanges || saving || autoSaveStatus === 'saving'}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Now'}</span>
          </Button>
        </div>
      </div>

      {/* User Information */}
      {teamMember && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Eye className="h-6 w-6" />
              <span>User Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{teamMember.fullName || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{teamMember.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Role</p>
                <Badge variant="outline">{getRoleDisplayName(teamMember.role)}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Job Title</p>
                <p className="text-sm text-muted-foreground">{teamMember.jobTitle || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Sections and Questions */}
      {roleData && (
        <div className="space-y-6">
          {roleData.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{section.title}</span>
                  <Badge variant="outline">
                    {section.items.length} questions
                  </Badge>
                </CardTitle>
                {section.description && (
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {section.items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getAnswerIcon(userAnswers[item.id])}
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <p className="font-medium mb-1 text-sm">{item.text}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mb-3">{item.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={userAnswers[item.id] === 'yes' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleAnswerChange(item.id, 'yes')}
                            className="flex items-center space-x-1 text-xs px-2 py-1 h-7"
                          >
                            <CheckCircle className="h-3 w-3" />
                            <span>Yes</span>
                          </Button>
                          
                          <Button
                            variant={userAnswers[item.id] === 'no' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleAnswerChange(item.id, 'no')}
                            className="flex items-center space-x-1 text-xs px-2 py-1 h-7"
                          >
                            <XCircle className="h-3 w-3" />
                            <span>No</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
