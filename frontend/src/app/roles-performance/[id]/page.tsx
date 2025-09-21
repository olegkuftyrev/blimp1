'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  Clock,
  Award,
  Target,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextSWR';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSWRRolePerformance, RolesPerformanceUtils } from '@/hooks/useSWRRolesPerformance';

function RoleDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const roleId = parseInt(params.id as string);
  const { role, answers, progress, loading, error, savingAnswer, saveAnswer } = useSWRRolePerformance(roleId);

  // Auto-expand sections with unanswered questions when data loads
  useEffect(() => {
    if (role && answers) {
      const autoExpanded = RolesPerformanceUtils.getAutoExpandedSections(role.sections, answers);
      setExpandedSections(autoExpanded);
    }
  }, [role, answers]);

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };


  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading role data...</p>
        </div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/20">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
              <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Role not found'}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => router.back()} variant="outline">
                  Go Back
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roles
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{role.displayName}</h1>
            <p className="text-muted-foreground mt-1">{role.description}</p>
            {role.trainingTimeFrame && (
              <p className="text-sm text-muted-foreground mt-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Training Time: {role.trainingTimeFrame}
              </p>
            )}
          </div>
          
          {progress && (
            <div className="text-right">
              <div className={`text-3xl font-bold ${
                progress.progressPercentage === 100 ? 'text-green-600' : 
                progress.progressPercentage >= 50 ? 'text-blue-600' : 
                progress.progressPercentage > 0 ? 'text-yellow-600' : 'text-gray-400'
              }`}>
                {progress.progressPercentage}%
              </div>
              <p className="text-sm text-muted-foreground">
                {progress.answeredItems} of {progress.totalItems} completed
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Stats */}
      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card text-card-foreground">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">{progress.progressPercentage}%</p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card text-card-foreground">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Yes Answers</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{progress.yesAnswers}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card text-card-foreground">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">No Answers</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{progress.noAnswers}</p>
                </div>
                <Circle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card text-card-foreground">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mastery Rate</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{progress.yesPercentage}%</p>
                </div>
                <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {role.sections.map((section) => {
          const sectionProgress = RolesPerformanceUtils.getSectionProgress(section, answers);
          const isExpanded = expandedSections.has(section.id);
          
          return (
            <Card key={section.id} className="bg-card text-card-foreground">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3">
                      {section.title}
                      <Badge variant={sectionProgress.percentage === 100 ? "default" : "secondary"}>
                        {sectionProgress.answeredItems}/{sectionProgress.totalItems}
                      </Badge>
                    </CardTitle>
                    {section.description && (
                      <CardDescription className="mt-1">{section.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-medium">
                      {sectionProgress.yesAnswers}/{sectionProgress.totalItems}
                    </Badge>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent>
                  <div className="space-y-4">
                    {section.items.map((item) => {
                      const userAnswer = answers[item.id];
                      const isLoading = savingAnswer === item.id;
                      
                      return (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="font-medium mb-1">{item.text}</p>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              )}
                            </div>
                            {userAnswer && (
                              <Badge variant={userAnswer === 'yes' ? 'default' : 'destructive'}>
                                {userAnswer === 'yes' ? 'Yes' : 'No'}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant={userAnswer === 'yes' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => saveAnswer(item.id, 'yes')}
                              disabled={isLoading}
                              className="flex-1"
                            >
                              {isLoading && userAnswer !== 'yes' ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Yes
                            </Button>
                            <Button
                              variant={userAnswer === 'no' ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => saveAnswer(item.id, 'no')}
                              disabled={isLoading}
                              className="flex-1"
                            >
                              {isLoading && userAnswer !== 'no' ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                              ) : (
                                <Circle className="h-4 w-4 mr-2" />
                              )}
                              No
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function RoleDetailPage() {
  return (
    <ProtectedRoute>
      <RoleDetailPageContent />
    </ProtectedRoute>
  );
}
