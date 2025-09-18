import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Play, RotateCcw } from 'lucide-react';
import { IDPDevelopmentPlanTable } from './IDPDevelopmentPlanTable';
import { IDPAssessment } from '@/lib/api';

interface AssessmentStatusProps {
  assessment: IDPAssessment | null;
  overallProgress: number;
  totalCompetencies: number;
  userRole?: string;
  loading?: boolean;
  competencyScores?: Array<{
    status: string;
    score: number;
    id: number;
    label: string;
    questions?: any[];
    actions?: any[];
  }>;
  answers?: { [questionId: number]: 'yes' | 'no' };
  onStartAssessment: () => void;
  onContinueAssessment: () => void;
}

export function AssessmentStatus({
  assessment,
  overallProgress,
  totalCompetencies,
  userRole,
  loading = false,
  competencyScores = [],
  answers = {},
  onStartAssessment,
  onContinueAssessment
}: AssessmentStatusProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Your Competency Assessment
          </CardTitle>
          <CardDescription>
            Evaluate your skills and create personalized development plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // New user or draft assessment
  if (!assessment || assessment.status === 'draft') {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/25">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Your Competency Assessment
          </CardTitle>
          <CardDescription>
            Evaluate your skills and create personalized development plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Ready to start your assessment?</h3>
                <p className="text-sm text-muted-foreground">
                  Evaluate {totalCompetencies} core competencies for your role
                </p>
              </div>
            </div>
            <Button onClick={onStartAssessment} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start Your Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Assessment in progress
  if (assessment.status === 'in_progress') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Assessment in Progress
          </CardTitle>
          <CardDescription>
            Continue your competency evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Assessment in Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {Math.round(overallProgress)}% complete - continue where you left off
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto mb-4">
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={onContinueAssessment} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Continue Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use the reusable table component
  return (
    <IDPDevelopmentPlanTable 
      competencyScores={competencyScores}
      answers={answers}
    />
  );
}
