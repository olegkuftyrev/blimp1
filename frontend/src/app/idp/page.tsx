'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Award, AlertTriangle, Trash2, Edit, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextSWR';
import { useIDPAssessment, useCompetencies, useResetAssessment, IDPUtils } from '@/hooks/useSWRIDP';
import { StatsCard } from '@/components/idp/StatsCard';
import { CompetencyCard } from '@/components/idp/CompetencyCard';
import { AssessmentStatus } from '@/components/idp/AssessmentStatus';
import { CompetencyRadarChart } from '@/components/idp/CompetencyRadarChart';
import { EditableDevelopmentPlanTable } from '@/components/idp/EditableDevelopmentPlanTable';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

function IDPPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    assessment, 
    answers, 
    loading: assessmentLoading, 
    error: assessmentError,
    mutate: mutateAssessment
  } = useIDPAssessment();
  const { competencies, loading: competenciesLoading, error: competenciesError, mutate: mutateCompetencies } = useCompetencies(user?.role);
  const { resetAssessment, isResetting } = useResetAssessment();

  const loading = assessmentLoading || competenciesLoading;
  const error = assessmentError || competenciesError;

  // Redirect to questions if assessment is not completed
  useEffect(() => {
    if (!loading && !error && user && competencies.length > 0) {
      // If no assessment exists, go to questions
      if (!assessment) {
        router.push('/idp/questions');
        return;
      }
      
      // If assessment is draft (no answers yet), go to questions
      if (assessment.status === 'draft') {
        router.push('/idp/questions');
        return;
      }
      
      // If assessment is in progress but no questions answered yet, go to questions
      if (assessment.status === 'in_progress' && Object.keys(answers).length === 0) {
        router.push('/idp/questions');
        return;
      }
      
      // If assessment is in progress but user has answered some questions, let them stay on /idp
      // They can choose to continue or view partial results
    }
  }, [loading, error, assessment, user, router, competencies.length, answers]);

  // Calculate statistics
  const totalCompetencies = competencies.length;
  const completedCompetencies = competencies.filter((comp: any) => 
    IDPUtils.isCompetencyComplete(comp, answers)
  ).length;
  const overallProgress = IDPUtils.getOverallProgress(competencies, answers);

  // Calculate competency scores
  const competencyScores = competencies.map((comp: any) => ({
    ...comp,
    score: IDPUtils.calculateCompetencyScore(comp, answers),
    status: IDPUtils.getCompetencyStatus(
      IDPUtils.calculateCompetencyScore(comp, answers),
      comp.questions?.length || 0
    )
  }));

  const masterCompetencies = competencyScores.filter((comp: any) => comp.status === 'master').length;
  const needsDevelopment = competencyScores.filter((comp: any) => comp.status === 'needs-development').length;

  const handleStartAssessment = () => {
    router.push('/idp/questions');
  };

  const handleResetAssessment = async () => {
    try {
      await resetAssessment();
      // Invalidate assessment cache to get fresh data
      await mutateAssessment();
      await mutateCompetencies();
      // After reset, user will be redirected to questions by the useEffect
    } catch (error) {
      console.error('Failed to reset assessment:', error);
    }
  };

  const handleContinueAssessment = () => {
    router.push('/idp/questions');
  };


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="h-6 w-48 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-80 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-5 w-32 bg-muted animate-pulse rounded mb-3" />
                  <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access IDP module.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Individual Development Plant</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Assess your competencies and create personalized development plans to advance your career
          </p>
        </div>
      </div>

      {/* Radar Chart and Stats - Two Column Layout */}
      {assessment?.status === 'completed' && competencies.length > 0 && Object.keys(answers).length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 items-stretch">
          {/* Left Column - Radar Chart */}
          <Card className="flex flex-col">
            <CardContent className="flex flex-col">
              <CompetencyRadarChart 
                competencies={competencies}
                answers={answers}
                className="mx-auto"
              />
            </CardContent>
          </Card>

          {/* Right Column - Statistics Overview */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Assessment Statistics
              </CardTitle>
              <CardDescription>
                Overview of your competency assessment results
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 flex flex-col justify-center">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center space-y-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center">
                    <Award className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Master Areas</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{masterCompetencies}</div>
                  <div className="text-xs text-green-600/80">Master level</div>
                </div>
                
                <div className="text-center space-y-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Development</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{needsDevelopment}</div>
                  <div className="text-xs text-yellow-600/80">Areas to improve</div>
                </div>
              </div>

              {/* Competency Levels Distribution */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-center">Proficiency Distribution</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center space-y-1 p-2 bg-muted/30 rounded">
                    <div className="text-xl font-bold text-green-600">{masterCompetencies}</div>
                    <div className="text-xs text-muted-foreground">Master</div>
                  </div>
                  <div className="text-center space-y-1 p-2 bg-muted/30 rounded">
                    <div className="text-xl font-bold text-blue-600">
                      {competencyScores.filter((comp: any) => comp.status === 'skilled').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Skilled</div>
                  </div>
                  <div className="text-center space-y-1 p-2 bg-muted/30 rounded">
                    <div className="text-xl font-bold text-yellow-600">
                      {competencyScores.filter((comp: any) => comp.status === 'in-development').length}
                    </div>
                    <div className="text-xs text-muted-foreground">In Development</div>
                  </div>
                  <div className="text-center space-y-1 p-2 bg-muted/30 rounded">
                    <div className="text-xl font-bold text-red-600">{needsDevelopment}</div>
                    <div className="text-xs text-muted-foreground">Needs Development</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Stats Overview for non-completed assessments */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Master Competencies"
            value={masterCompetencies}
            description="Master level competencies"
            icon={Award}
            color="green"
            trend={masterCompetencies > 0 ? 'up' : 'neutral'}
          />
          
          <StatsCard
            title="Development Areas"
            value={needsDevelopment}
            description="Areas for improvement"
            icon={AlertTriangle}
            color={needsDevelopment > 0 ? 'yellow' : 'gray'}
            trend={needsDevelopment > 0 ? 'neutral' : 'neutral'}
          />
          
          <StatsCard
            title="Assessment Progress"
            value={`${Math.round(overallProgress)}%`}
            description={`${completedCompetencies} of ${totalCompetencies} competencies`}
            icon={Target}
            color={overallProgress === 100 ? 'green' : overallProgress > 0 ? 'blue' : 'gray'}
            trend={overallProgress > 50 ? 'up' : 'neutral'}
          />
        </div>
      )}

      {/* Assessment Status */}
      <div id="development-plan">
        {error ? (
          <Card className="border-red-200 bg-red-50/30">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                <p className="text-red-600 mb-4">{(error as Error)?.message || 'Unexpected error'}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : assessment?.status === 'completed' && competencies.length > 0 && Object.keys(answers).length > 0 ? (
          <EditableDevelopmentPlanTable
            competencyScores={competencyScores}
            answers={answers}
          />
        ) : (
          <AssessmentStatus
            assessment={assessment}
            overallProgress={overallProgress}
            totalCompetencies={totalCompetencies}
            userRole={user?.role}
            loading={loading}
            competencyScores={competencyScores}
            answers={answers}
            onStartAssessment={handleStartAssessment}
            onContinueAssessment={handleContinueAssessment}
          />
        )}
      </div>

      {/* Competencies Overview */}
      {competencies.length > 0 && !loading && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Your Competencies
                </CardTitle>
                <CardDescription>
                  Based on your role as <strong>{user?.role}</strong>, you'll be assessed on these {totalCompetencies} core competencies
                </CardDescription>
              </div>
              <div className="text-right">
                {assessment?.status === 'completed' && competencyScores.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                    <div className="text-2xl font-bold text-foreground">
                      {(() => {
                        const totalScore = competencyScores.reduce((sum: number, comp: any) => sum + (comp.score || 0), 0);
                        const percent = totalCompetencies > 0 ? Math.round((totalScore / (totalCompetencies * 5)) * 100) : 0;
                        return `${percent}%`;
                      })()}
                    </div>
                  </div>
                )}
                {assessment?.status === 'completed' && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleContinueAssessment} 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Answers
                    </Button>
                    <Button 
                      onClick={handleResetAssessment} 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {assessment?.status === 'completed' ? (
              // Group competencies by status for completed assessments
              <div className="space-y-8">
                {[
                  { status: 'needs-development', title: 'Needs Development', color: 'red' },
                  { status: 'in-development', title: 'In Development', color: 'yellow' },
                  { status: 'skilled', title: 'Skilled', color: 'blue' },
                  { status: 'master', title: 'Master', color: 'green' }
                ].map(({ status, title, color }) => {
                  const statusCompetencies = competencies.filter((comp: any) => {
                    const score = IDPUtils.calculateCompetencyScore(comp, answers);
                    const compStatus = IDPUtils.getCompetencyStatus(score, comp.questions?.length || 0);
                    return compStatus === status;
                  });

                  if (statusCompetencies.length === 0) return null;

                  return (
                    <div key={status} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          color === 'red' ? 'bg-red-500' :
                          color === 'yellow' ? 'bg-yellow-500' :
                          color === 'blue' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`} />
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <span className="text-sm text-muted-foreground">({statusCompetencies.length})</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {statusCompetencies.map((competency: any) => (
                          <CompetencyCard
                            key={competency.id}
                            competency={competency}
                            answers={answers}
                            assessmentStatus={assessment?.status}
                            className="hover:shadow-lg transition-all duration-200"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Original grid layout for non-completed assessments
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {competencies
                  .sort((a: any, b: any) => {
                    // Sort by completion status, then by score (if completed)
                    const aComplete = IDPUtils.isCompetencyComplete(a, answers);
                    const bComplete = IDPUtils.isCompetencyComplete(b, answers);
                    
                    if (aComplete && !bComplete) return -1;
                    if (!aComplete && bComplete) return 1;
                    
                    if (assessment?.status === 'completed') {
                      const aScore = IDPUtils.calculateCompetencyScore(a, answers);
                      const bScore = IDPUtils.calculateCompetencyScore(b, answers);
                      return bScore - aScore; // Higher scores first
                    }
                    
                    return 0;
                  })
                  .map((competency: any) => (
                    <CompetencyCard
                      key={competency.id}
                      competency={competency}
                      answers={answers}
                      assessmentStatus={assessment?.status}
                      className="hover:shadow-lg transition-all duration-200"
                    />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function IDPPage() {
  return (
    <ProtectedRoute>
      <IDPPageContent />
    </ProtectedRoute>
  );
}
