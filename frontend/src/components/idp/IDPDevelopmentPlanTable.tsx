'use client';

import { TrendingUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface IDPDevelopmentPlanTableProps {
  competencyScores: any[];
  answers: { [questionId: number]: 'yes' | 'no' };
  className?: string;
}

export function IDPDevelopmentPlanTable({ 
  competencyScores, 
  answers, 
  className = '' 
}: IDPDevelopmentPlanTableProps) {
  
  const formatDate = (dateStr: string) => {
    if (dateStr.endsWith('d')) {
      const days = parseInt(dateStr.replace('d', ''));
      return days === 1 ? '1 Day' : `${days} Days`;
    }
    return dateStr;
  };

  // Assessment completed - show full development plan table
  const developmentCompetencies = competencyScores.filter(comp => comp.score < 4);
  
  // Generate development plan rows - ONE ROW PER COMPETENCY
  const developmentPlanRows = developmentCompetencies.map((comp) => {
    // Get questions answered "No" for this competency
    const noAnswerQuestions = comp.questions?.filter((q: any) => answers[q.id] === 'no') || [];
    
    if (noAnswerQuestions.length === 0) return null;

    // Get corresponding actions for "No" answers
    const relevantActions = noAnswerQuestions.map((question: any) => {
      const actionIndex = comp.questions?.findIndex((q: any) => q.id === question.id) || 0;
      return comp.actions?.[actionIndex];
    }).filter(Boolean);

    if (relevantActions.length === 0) return null;

    // Aggregate measurements and action steps
    const measurements = relevantActions.map((action: any) => action.measurement).filter(Boolean);
    const actionSteps = relevantActions.map((action: any) => action.action).filter(Boolean);
    
    // Combine responsible and resources
    const allResponsible = relevantActions.flatMap((action: any) => action.responsible || []);
    const allResources = relevantActions.flatMap((action: any) => action.resources || []);
    const combinedResponsibleResources = [...new Set([...allResponsible, ...allResources])].join(', ');
    
    // Get date range
    const startDates = relevantActions.map((action: any) => action.startDate).filter(Boolean);
    const endDates = relevantActions.map((action: any) => action.endDate).filter(Boolean);
    
    // Convert "Xd" format to numbers for comparison
    const earliestStart = startDates.length > 0 ? 
      Math.min(...startDates.map((d: string) => parseInt(d.replace('d', '')))) : null;
    const latestEnd = endDates.length > 0 ? 
      Math.max(...endDates.map((d: string) => parseInt(d.replace('d', '')))) : null;

    return {
      id: comp.id,
      competencyName: comp.label,
      currentScore: `${comp.score}/${comp.questions?.length || 0}`,
      measurements,
      actionSteps,
      responsibleResources: combinedResponsibleResources,
      startDate: earliestStart ? formatDate(`${earliestStart}d`) : 'Not set',
      completionDate: latestEnd ? formatDate(`${latestEnd}d`) : 'Not set'
    };
  }).filter(Boolean);

  return (
    <div className={className}>
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
                  <th className="text-left p-3 font-semibold">Competency</th>
                  <th className="text-left p-3 font-semibold">Current Score</th>
                  <th className="text-left p-3 font-semibold">Measurement</th>
                  <th className="text-left p-3 font-semibold">Actionable Steps</th>
                  <th className="text-left p-3 font-semibold">Responsible/Resources</th>
                  <th className="text-left p-3 font-semibold">Start Date</th>
                  <th className="text-left p-3 font-semibold">Completion Date</th>
                </tr>
              </thead>
              <tbody>
                {developmentPlanRows.map((row: any) => (
                  <tr key={row.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{row.competencyName}</td>
                    <td className="p-3">
                      <Badge variant="outline">{row.currentScore}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {row.measurements.map((measurement: string, index: number) => (
                          <div key={index} className="text-sm">{measurement}</div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {row.actionSteps.map((action: string, index: number) => (
                          <div key={index} className="text-sm">{action}</div>
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
    </div>
  );
}
