import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, TrendingUp, Play, RotateCcw } from 'lucide-react';
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

  // Assessment completed - show full development plan table
  const developmentCompetencies = competencyScores.filter(comp => comp.score < 4);
  
  // Generate development plan rows - ONE ROW PER COMPETENCY
  const developmentPlanRows = developmentCompetencies.map((comp) => {
    // Get questions answered "No" for this competency
    const noAnswerQuestions = comp.questions?.filter(q => answers[q.id] === 'no') || [];
    
    if (noAnswerQuestions.length === 0) return null;

    // Get corresponding actions for "No" answers
    const relevantActions = noAnswerQuestions.map(question => {
      const actionIndex = comp.questions?.findIndex(q => q.id === question.id) || 0;
      return comp.actions?.[actionIndex];
    }).filter(Boolean);

    if (relevantActions.length === 0) return null;

    // Collect all measurements, actions, responsible, resources from relevant actions
    const measurements = relevantActions.map(action => action.measurement).filter(Boolean);
    const actionSteps = relevantActions.map(action => action.action).filter(Boolean);
    
    // Combine all responsible and resources
    const allResponsible = new Set<string>();
    const allResources = new Set<string>();
    
    relevantActions.forEach(action => {
      action.responsible?.forEach(person => allResponsible.add(person));
      action.resources?.forEach(resource => allResources.add(resource));
    });
    
    const responsibleArray = Array.from(allResponsible);
    const resourcesArray = Array.from(allResources);
    const combinedResponsibleResources = [...responsibleArray, ...resourcesArray].join(', ') || 'Myself, My Supervisor';

    // Get date ranges
    const startDates = relevantActions.map(action => action.startDate).filter(Boolean);
    const endDates = relevantActions.map(action => action.endDate).filter(Boolean);
    
    const formatDate = (dateStr: string) => {
      if (dateStr.endsWith('d')) {
        const days = parseInt(dateStr.replace('d', ''));
        return days === 1 ? '1 Day' : `${days} Days`;
      }
      return dateStr;
    };

    // Find earliest start and latest end
    const earliestStart = startDates.length > 0 ? 
      Math.min(...startDates.map(d => parseInt(d.replace('d', '')))) : null;
    const latestEnd = endDates.length > 0 ? 
      Math.max(...endDates.map(d => parseInt(d.replace('d', '')))) : null;

    return {
      id: comp.id,
      competencyName: comp.label,
      currentScore: `${comp.score}/${comp.questions?.length || 0}`,
      measurements, // Array of measurements
      actionSteps, // Array of action steps
      responsibleResources: combinedResponsibleResources,
      startDate: earliestStart ? formatDate(`${earliestStart}d`) : 'Not set',
      completionDate: latestEnd ? formatDate(`${latestEnd}d`) : 'Not set'
    };
  }).filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Individual Development Plan
            </CardTitle>
            <CardDescription>
              Development objectives based on your assessment results
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {developmentPlanRows.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Excellent Performance!</h3>
            <p className="text-muted-foreground">
              All competencies scored 4 or higher. No development objectives needed at this time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-sm">#</th>
                  <th className="text-left p-3 font-semibold text-sm min-w-[200px]">
                    Specific Development Objective
                  </th>
                  <th className="text-left p-3 font-semibold text-sm min-w-[150px]">Measurement</th>
                  <th className="text-left p-3 font-semibold text-sm min-w-[200px]">Actionable Steps</th>
                  <th className="text-left p-3 font-semibold text-sm min-w-[150px]">Responsible/Resources</th>
                  <th className="text-left p-3 font-semibold text-sm">Start Date</th>
                  <th className="text-left p-3 font-semibold text-sm">Completion Date</th>
                </tr>
              </thead>
              <tbody>
                {developmentPlanRows.map((row, index) => (
                  <tr key={row.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 text-center font-medium">{index + 1}</td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{row.competencyName}</div>
                        <div className="text-sm text-muted-foreground">Current Score: {row.currentScore}</div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="space-y-1">
                        {row.measurements.map((measurement, idx) => (
                          <div key={idx} className="text-sm">
                            {measurement}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="space-y-1">
                        {row.actionSteps.map((action, idx) => (
                          <div key={idx} className="text-sm">
                            {action}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-sm">{row.responsibleResources}</td>
                    <td className="p-3 text-sm">{row.startDate}</td>
                    <td className="p-3 text-sm">{row.completionDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
