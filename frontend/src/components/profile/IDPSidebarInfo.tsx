'use client';

import { useState, useEffect } from 'react';
import { Target, Award, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContextSWR';
import { IDPAPI, IDPAssessment } from '@/lib/api';
import Link from 'next/link';

interface IDPSidebarData {
  assessment: IDPAssessment | null;
  progress: number;
  masterCompetencies: number;
  developmentAreas: number;
  lastAssessmentDate: string | null;
  loading: boolean;
  error: string | null;
}

export function IDPSidebarInfo() {
  const { user } = useAuth();
  const [data, setData] = useState<IDPSidebarData>({
    assessment: null,
    progress: 0,
    masterCompetencies: 0,
    developmentAreas: 0,
    lastAssessmentDate: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    loadIDPSummary();
  }, [user]);

  const loadIDPSummary = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      // Get current assessment - handle case when no assessment exists
      try {
        // First check if user has IDP role
        const roleResponse = await IDPAPI.getCurrentUserRole();
        if (!roleResponse.data) {
          // User doesn't have IDP role - show "no assessment" state
          setData(prev => ({
            ...prev,
            loading: false,
            assessment: null,
            progress: 0,
            masterCompetencies: 0,
            developmentAreas: 0,
            lastAssessmentDate: null
          }));
          return;
        }

        const competencies = roleResponse.data?.competencies || [];
        
        const assessmentResponse = await IDPAPI.getCurrentAssessment();
        const assessment = assessmentResponse.data;
        
        if (!assessment) {
          setData(prev => ({
            ...prev,
            loading: false,
            assessment: null,
            progress: 0,
            masterCompetencies: 0,
            developmentAreas: 0,
            lastAssessmentDate: null
          }));
          return;
        }
        
        // Calculate progress and stats
        const totalQuestions = competencies.reduce((total, comp) => 
          total + (comp.questions?.length || 0), 0
        );
        const answeredQuestions = assessment.answers?.length || 0;
        const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
        
        // Calculate competency scores if assessment is completed
        let masterCompetencies = 0;
        let developmentAreas = 0;
        
        if (assessment.status === 'completed' && assessment.answers) {
          const answersMap: { [questionId: number]: 'yes' | 'no' } = {};
          assessment.answers.forEach(answer => {
            answersMap[answer.questionId] = answer.answer;
          });

          competencies.forEach(comp => {
            const score = comp.questions?.reduce((total, question) => {
              return answersMap[question.id] === 'yes' ? total + 1 : total;
            }, 0) || 0;
            
            if (score >= 4) masterCompetencies++;
            else if (score < 3) developmentAreas++;
          });
        }

        setData(prev => ({
          ...prev,
          loading: false,
          assessment,
          progress,
          masterCompetencies,
          developmentAreas,
          lastAssessmentDate: assessment.completedAt || assessment.updatedAt
        }));
        
      } catch (assessmentErr: any) {
        // If assessment doesn't exist or role not found, that's fine - show "no assessment" state
        if (assessmentErr.message?.includes('No active assessment') || 
            assessmentErr.message?.includes('404') ||
            assessmentErr.message?.includes('Role not found')) {
          setData(prev => ({
            ...prev,
            loading: false,
            assessment: null,
            progress: 0,
            masterCompetencies: 0,
            developmentAreas: 0,
            lastAssessmentDate: null,
            error: assessmentErr.message?.includes('Role not found') ? 'Role not found' : null
          }));
          return;
        }
        throw assessmentErr; // Re-throw other errors
      }
      
    } catch (err: any) {
      console.error('Error loading IDP summary:', err);
      // Don't show error for "Role not found" - treat as normal state
      if (err.message?.includes('Role not found')) {
        setData(prev => ({
          ...prev,
          loading: false,
          assessment: null,
          progress: 0,
          masterCompetencies: 0,
          developmentAreas: 0,
          lastAssessmentDate: null,
          error: 'Role not found'
        }));
        return;
      }
      
      setData(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to load IDP summary'
      }));
    }
  };

  if (data.loading) {
    return (
      <div className="px-3 py-2 space-y-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-sidebar-foreground/40" />
          <span className="text-sm text-sidebar-foreground/60">Loading IDP...</span>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="px-3 py-2 space-y-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-500">Error loading IDP</span>
        </div>
      </div>
    );
  }

  if (!data.assessment) {
    return (
      <div className="px-3 py-2 space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-sidebar-foreground/40" />
          <span className="text-sm font-medium text-sidebar-foreground">IDP Assessment</span>
        </div>
        <div className="text-xs text-sidebar-foreground/60 mb-2">
          {data.error?.includes('Role not found') 
            ? 'IDP not available for your role'
            : 'No assessment started yet'
          }
        </div>
        {!data.error?.includes('Role not found') && (
          <Button asChild size="sm" className="w-full text-xs">
            <Link href="/idp">
              Start Assessment
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="px-3 py-2 space-y-3">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-sidebar-foreground" />
        <span className="text-sm font-medium text-sidebar-foreground">IDP Assessment</span>
      </div>
      
      {/* Assessment Status */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-sidebar-foreground/60">Status</span>
          <Badge variant="outline" className="text-xs">
            {data.assessment.status === 'completed' ? 'Complete' : 
             data.assessment.status === 'in_progress' ? 'In Progress' : 'Draft'}
          </Badge>
        </div>
      </div>

      {/* Progress for incomplete assessments */}
      {data.assessment.status !== 'completed' && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-sidebar-foreground/60">Progress</span>
            <span className="text-sidebar-foreground">{Math.round(data.progress)}%</span>
          </div>
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-full transition-all duration-300 ease-in-out bg-blue-500"
              style={{ width: `${data.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results for completed assessments */}
      {data.assessment.status === 'completed' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Award className="h-3 w-3 text-green-600" />
            <span className="text-sidebar-foreground/60">Master Areas</span>
            <span className="ml-auto text-sidebar-foreground font-medium">{data.masterCompetencies}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="h-3 w-3 text-yellow-600" />
            <span className="text-sidebar-foreground/60">Development</span>
            <span className="ml-auto text-sidebar-foreground font-medium">{data.developmentAreas}</span>
          </div>
        </div>
      )}

      {/* Last Assessment Date */}
      {data.lastAssessmentDate && (
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="h-3 w-3 text-sidebar-foreground/40" />
          <span className="text-sidebar-foreground/60">
            {data.assessment.status === 'completed' ? 'Completed' : 'Updated'}
          </span>
          <span className="ml-auto text-sidebar-foreground/80 text-xs">
            {new Date(data.lastAssessmentDate).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* View Full Results Button */}
      <Button asChild variant="outline" size="sm" className="w-full text-xs">
        <Link href="/idp">
          View Full IDP
          <ArrowRight className="h-3 w-3 ml-1" />
        </Link>
      </Button>
    </div>
  );
}
