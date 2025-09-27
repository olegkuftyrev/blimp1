'use client';

import { Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContextSWR';
import { useIDPAssessment, useCompetencies, IDPUtils } from '@/hooks/useSWRIDP';
import { IndividualDevelopmentPlanCard } from '@/components/idp/IndividualDevelopmentPlanCard';
import { IDPDevelopmentPlanTable } from '@/components/idp/IDPDevelopmentPlanTable';
import Link from 'next/link';

export default function IDPDevelopmentPlan() {
  const { user } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
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

  // Redirect to main IDP page if no data to display
  useEffect(() => {
    if (!loading && !error && assessment) {
      // Check if there are competencies that need development (score < 4)
      const needsDevelopment = competencyScores.some(comp => comp.score < 4);
      if (!needsDevelopment || competencyScores.length === 0) {
        router.push('/idp');
      }
    }
  }, [loading, error, assessment, competencyScores, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <IndividualDevelopmentPlanCard 
          title="Individual Development Plan"
          description="Loading your development plan..."
          content={
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <IndividualDevelopmentPlanCard 
          title="Individual Development Plan"
          description="Error loading your development plan"
          content={
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="space-y-6">
        <IndividualDevelopmentPlanCard 
          title="Individual Development Plan"
          description="Complete your assessment to view your development plan"
          content={
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
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
       
            
    {assessment.status === 'completed' && competencyScores.length > 0 && (
      <IndividualDevelopmentPlanCard 
        title="Development Plan Details"
        description="Switch between table and cards view"
        showSwitch={true}
        switchEnabled={viewMode === 'cards'}
        onSwitchChange={(enabled) => {
          setViewMode(enabled ? 'cards' : 'table');
        }}
        switchLabels={{ left: "Cards", right: "Table" }}
        content={
          viewMode === 'table' ? (
            <IDPDevelopmentPlanTable 
              competencyScores={competencyScores}
              answers={answers}
            />
          ) : (
            <div className="space-y-4">
              {competencyScores
                .filter(comp => comp.score < 4)
                .map((comp) => (
                  <div key={comp.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comp.label}</span>
                        <span className="text-sm text-muted-foreground">
                          Score: {comp.score}/{comp.questions?.length || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {comp.questions?.filter((q: any) => answers[q.id] === 'no').map((question: any, index: number) => {
                        const actionIndex = comp.questions?.findIndex((q: any) => q.id === question.id) || 0;
                        const action = comp.actions?.[actionIndex];
                        if (!action) return null;
                        
                        return (
                          <div key={index} className="border rounded-lg p-4 bg-muted/50">
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium text-muted-foreground">Measurement:</span>
                                <p className="text-sm">{action.measurement || 'No measurement defined'}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-muted-foreground">Action Steps:</span>
                                <p className="text-sm">{action.action || 'No action steps defined'}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-muted-foreground">Timeline:</span>
                                <p className="text-sm">
                                  {action.startDate || 'Not set'} - {action.endDate || 'Not set'}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )
        }
      />
    )}
  </div>
  );
}