'use client';

import { Target, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContextSWR';
import { useIDPAssessment, useCompetencies, IDPUtils } from '@/hooks/useSWRIDP';
import { IDPDevelopmentPlanTable } from '@/components/idp/IDPDevelopmentPlanTable';
import Link from 'next/link';

export default function IDPDevelopmentPlan() {
  const { user } = useAuth();
  const { 
    assessment, 
    answers, 
    loading: assessmentLoading, 
    error: assessmentError 
  } = useIDPAssessment();
  const { 
    role, 
    competencies, 
    loading: competenciesLoading, 
    error: competenciesError 
  } = useCompetencies(user?.role);

  const loading = assessmentLoading || competenciesLoading;
  const error = assessmentError || competenciesError;

  // Calculate competency scores
  const competencyScores = competencies.map(comp => {
    const score = IDPUtils.calculateCompetencyScore(comp, answers);
    
    return {
      ...comp,
      score,
      questions: comp.questions || [],
      actions: comp.actions || []
    };
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Individual Development Plan
            </CardTitle>
            <CardDescription>
              Loading your development plan...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Individual Development Plan
            </CardTitle>
            <CardDescription>
              Error loading your development plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Individual Development Plan
            </CardTitle>
            <CardDescription>
              Complete your assessment to view your development plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You haven't completed your IDP assessment yet.
              </p>
              <Link href="/idp/questions">
                <Button className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Assessment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Individual Development Plan
          </CardTitle>
          <CardDescription>
            Your personalized development plan based on your assessment results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Assessment Status</h3>
                <p className="text-sm text-muted-foreground">
                  {assessment.status === 'completed' ? 'Completed' : 'In Progress'}
                </p>
              </div>
              <Link href="/idp">
                <Button variant="outline">
                  View Full Assessment
                </Button>
              </Link>
            </div>
            
            {assessment.status === 'completed' && competencyScores.length > 0 && (
              <IDPDevelopmentPlanTable 
                competencyScores={competencyScores}
                answers={answers}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}