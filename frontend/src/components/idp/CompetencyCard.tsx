import { Card, CardContent } from '@/components/ui/card';
import { IDPCompetency } from '@/lib/api';
import { IDPUtils } from '@/hooks/useIDP';

interface CompetencyCardProps {
  competency: IDPCompetency;
  answers: { [questionId: number]: 'yes' | 'no' };
  assessmentStatus?: 'draft' | 'in_progress' | 'completed';
  className?: string;
}

export function CompetencyCard({ 
  competency, 
  answers, 
  assessmentStatus = 'draft',
  className = '' 
}: CompetencyCardProps) {
  const score = IDPUtils.calculateCompetencyScore(competency, answers);
  const status = IDPUtils.getCompetencyStatus(score, competency.questions?.length || 0);
  const progress = IDPUtils.getCompetencyProgress(competency, answers);
  
  // Color schemes for different statuses
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expert': return 'text-green-600';
      case 'proficient': return 'text-blue-600';
      case 'developing': return 'text-yellow-600';
      case 'needs-development': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressBarColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Competency Name */}
          <h4 className="font-semibold text-sm leading-tight">{competency.label}</h4>
          
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressBarColor(progress)}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Score Section (only show if assessment is completed) */}
          {assessmentStatus === 'completed' && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Score</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${getStatusColor(status)}`}>
                  {score}/{competency.questions?.length || 0}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  status === 'expert' ? 'bg-green-100 text-green-800' :
                  status === 'proficient' ? 'bg-blue-100 text-blue-800' :
                  status === 'developing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {status === 'expert' ? 'Expert' :
                   status === 'proficient' ? 'Proficient' :
                   status === 'developing' ? 'Developing' :
                   'Needs Dev.'}
                </span>
              </div>
            </div>
          )}

          {/* Questions count */}
          <div className="text-xs text-muted-foreground">
            {competency.questions?.length || 0} questions
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
