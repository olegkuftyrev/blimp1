import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { IDPAPI, IDPRole, IDPAssessment, IDPCompetencyScores } from '@/lib/api';
import { apiFetch } from '@/lib/api';

// Development Plan interfaces
interface DevelopmentPlanMeasurement {
  id: number;
  text: string;
  actionSteps: string;
  responsibleResources: string;
  startDate: string;
  completionDate: string;
}

interface DevelopmentPlanItem {
  competencyId: number;
  competencyName: string;
  measurements: DevelopmentPlanMeasurement[];
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await apiFetch(url);
  return response;
};

// Hook for fetching all IDP roles
export function useIDPRoles() {
  const { 
    data: rolesData, 
    error, 
    isLoading,
    mutate
  } = useSWR<any>(
    () => {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem('auth_token') ? 'idp/roles' : null;
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes - roles don't change often
      shouldRetryOnError: true,
      onSuccess: (data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR IDP Roles:', { 
            success: true, 
            count: data?.data?.length || 0
          });
        }
      },
      onError: (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR IDP Roles Error:', error.message);
        }
      }
    }
  );

  return {
    roles: rolesData?.data || [],
    loading: isLoading,
    error,
    mutate
  };
}

// Hook for fetching competencies by user role
export function useCompetencies(userRole?: string) {
  const { 
    data: roleData, 
    error, 
    isLoading,
    mutate
  } = useSWR<any>(
    () => {
      if (typeof window === 'undefined') return null;
      const token = window.localStorage.getItem('auth_token');
      if (!token) return null;
      return 'idp/role/current';
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes - competencies don't change often
      shouldRetryOnError: true,
      onSuccess: (data) => {
        if (process.env.NODE_ENV === 'development') {
          const roleMap: Record<string, string> = { tablet: 'associate' };
          const effectiveRole = userRole ? (roleMap[userRole] || userRole) : undefined;
          const competencies = data?.data?.competencies || [];
          console.log('✅ SWR Competencies Loaded', {
            requestedRole: userRole,
            effectiveRole,
            backendRoleLabel: data?.data?.label,
            backendUserRole: data?.data?.userRole,
            count: competencies.length,
            sample: competencies.slice(0, 5).map((c: any) => ({ id: c.id, competencyId: c.competencyId, label: c.label })),
          });
        }
      },
      onError: (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR Competencies Error:', error.message);
        }
      }
    }
  );

  return {
    role: roleData?.data || null,
    competencies: roleData?.data?.competencies || [],
    loading: isLoading,
    error,
    mutate
  };
}

// Hook for fetching current user's assessment
export function useIDPAssessment() {
  const { 
    data: assessmentData, 
    error, 
    isLoading,
    mutate
  } = useSWR<any>(
    () => {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem('auth_token') ? 'idp/assessment/current' : null;
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute - assessment can change
      shouldRetryOnError: (error) => {
        // Don't retry on 500 errors, they might be expected (no assessment)
        return error.status !== 500;
      },
      onSuccess: (data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR IDP Assessment:', { 
            success: true, 
            status: data?.data?.status,
            answersCount: data?.data?.answers?.length || 0
          });
        }
      },
      onError: (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR IDP Assessment Error:', error.message);
        }
      }
    }
  );

  // Convert answers to the format we need
  const answers = assessmentData?.data?.answers?.reduce((acc: { [questionId: number]: 'yes' | 'no' }, answer: any) => {
    acc[answer.questionId] = answer.answer;
    return acc;
  }, {}) || {};

  return {
    assessment: assessmentData?.data || null,
    answers,
    loading: isLoading,
    error,
    mutate
  };
}

// Hook for fetching specific user's assessment (admin only)
export function useUserIDPAssessment(userId: number) {
  const { 
    data: userAssessmentData, 
    error, 
    isLoading,
    mutate
  } = useSWR<any>(
    () => {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem('auth_token') ? `idp/assessment/user/${userId}` : null;
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      shouldRetryOnError: true,
      onSuccess: (data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR User IDP Assessment:', { 
            success: true, 
            userId,
            hasAssessment: !!data?.data?.assessment
          });
        }
      },
      onError: (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR User IDP Assessment Error:', error.message);
        }
      }
    }
  );

  return {
    user: userAssessmentData?.data?.user || null,
    assessment: userAssessmentData?.data?.assessment || null,
    scores: userAssessmentData?.data?.scores || {},
    loading: isLoading,
    error,
    mutate
  };
}

// Mutation for saving answers
export function useSaveAnswers() {
  const { 
    trigger: saveAnswers, 
    isMutating: isSaving,
    error: saveError
  } = useSWRMutation(
    'idp/assessment/answers',
    async (url, { arg }: { arg: { answers: { [questionId: number]: 'yes' | 'no' } } }) => {
      return apiFetch<{ message: string }>(url, {
        method: 'POST',
        body: JSON.stringify({ answers: arg.answers }),
      });
    },
    {
      onSuccess: (data) => {
        console.log('✅ Answers saved successfully:', data.message);
      },
      onError: (error) => {
        console.error('❌ Failed to save answers:', error.message);
      }
    }
  );

  return {
    saveAnswers,
    isSaving,
    saveError
  };
}

// Mutation for completing assessment
export function useCompleteAssessment() {
  const { 
    trigger: completeAssessment, 
    isMutating: isCompleting,
    error: completeError
  } = useSWRMutation(
    'idp/assessment/complete',
    async (url) => {
      return apiFetch<{ data: { assessment: IDPAssessment; scores: IDPCompetencyScores }; message: string }>(url, {
        method: 'POST',
      });
    },
    {
      onSuccess: (data) => {
        console.log('✅ Assessment completed successfully:', data.message);
      },
      onError: (error) => {
        console.error('❌ Failed to complete assessment:', error.message);
      }
    }
  );

  return {
    completeAssessment,
    isCompleting,
    completeError
  };
}

// Mutation for resetting assessment
export function useResetAssessment() {
  const { 
    trigger: resetAssessment, 
    isMutating: isResetting,
    error: resetError
  } = useSWRMutation(
    'idp/assessment/reset',
    async (url) => {
      return apiFetch<{ message: string }>(url, {
        method: 'POST',
      });
    },
    {
      onSuccess: (data) => {
        console.log('✅ Assessment reset successfully:', data.message);
      },
      onError: (error) => {
        console.error('❌ Failed to reset assessment:', error.message);
      }
    }
  );

  return {
    resetAssessment,
    isResetting,
    resetError
  };
}

// Utility functions for IDP data (same as before)
export const IDPUtils = {
  // Calculate progress for a competency
  getCompetencyProgress: (competency: any, answers: { [questionId: number]: 'yes' | 'no' }) => {
    if (!competency.questions?.length) return 0;
    
    const totalQuestions = competency.questions.length;
    const positiveAnswers = competency.questions.filter((q: any) => 
      answers[q.id] === 'yes'
    ).length;
    
    return totalQuestions > 0 ? (positiveAnswers / totalQuestions) * 100 : 0;
  },

  // Calculate overall progress across all competencies
  getOverallProgress: (competencies: any[], answers: { [questionId: number]: 'yes' | 'no' }) => {
    if (!competencies.length) return 0;
    
    const totalQuestions = competencies.reduce((sum, comp) => 
      sum + (comp.questions?.length || 0), 0
    );
    const positiveAnswers = Object.values(answers).filter(answer => answer === 'yes').length;
    
    return totalQuestions > 0 ? (positiveAnswers / totalQuestions) * 100 : 0;
  },

  // Calculate competency score from answers
  calculateCompetencyScore: (competency: any, answers: { [questionId: number]: 'yes' | 'no' }) => {
    if (!competency.questions?.length) return 0;
    
    return competency.questions.reduce((score: number, question: any) => {
      return answers[question.id] === 'yes' ? score + 1 : score;
    }, 0);
  },

  // Get competency status based on score
  getCompetencyStatus: (score: number, totalQuestions: number) => {
    if (totalQuestions === 0) return 'unknown';
    const percentage = (score / totalQuestions) * 100;
    
    if (percentage <= 40) return 'needs-development'; // 0-2 out of 5
    if (percentage <= 60) return 'in-development'; // 3 out of 5
    if (percentage <= 80) return 'skilled'; // 4 out of 5
    return 'master'; // 5 out of 5
  },

  // Check if competency is complete (all questions answered)
  isCompetencyComplete: (competency: any, answers: { [questionId: number]: 'yes' | 'no' }) => {
    if (!competency.questions?.length) return true;
    
    return competency.questions.every((q: any) => answers[q.id] !== undefined);
  },

  // Get relevant actions for competency based on "no" answers
  getRelevantActions: (competency: any, answers: { [questionId: number]: 'yes' | 'no' }) => {
    if (!competency.questions?.length || !competency.actions?.length) return [];
    
    const noAnswerQuestions = competency.questions.filter((q: any) => 
      answers[q.id] === 'no'
    );
    
    // Map questions to actions (assuming they're in the same order)
    return noAnswerQuestions.map((question: any, index: number) => {
      const actionIndex = competency.questions.findIndex((q: any) => q.id === question.id);
      return competency.actions[actionIndex] || competency.actions[0];
    }).filter(Boolean);
  },
};

// Hook for fetching development plan
export function useDevelopmentPlan() {
  const { 
    data: planData, 
    error, 
    isLoading,
    mutate
  } = useSWR(
    () => {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem('auth_token') ? 'idp/development-plan' : null;
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      shouldRetryOnError: true,
      onSuccess: (data) => {
        // Development plan loaded successfully
      },
      onError: (error) => {
        console.error('Error loading development plan:', error);
      }
    }
  );

  return {
    planItems: (planData as any)?.data || [],
    isLoading,
    error,
    mutate
  };
}

// Hook for saving development plan
export function useSaveDevelopmentPlan() {
  const { trigger, isMutating } = useSWRMutation(
    'idp/development-plan',
    async (url: string, { arg }: { arg: { competencyId: number; measurements: DevelopmentPlanMeasurement[]; updateMode?: boolean } }) => {
      return await apiFetch(url, {
        method: 'POST',
        body: JSON.stringify(arg)
      });
    }
  );

  return {
    savePlan: trigger,
    isSaving: isMutating
  };
}

// Hook for deleting development plan measurement
export function useDeleteDevelopmentPlanMeasurement() {
  const { trigger, isMutating } = useSWRMutation(
    'idp/development-plan/measurement',
    async (url: string, { arg }: { arg: { measurementId: string | number; mutate?: () => Promise<any> } }) => {
      const response = await apiFetch(`idp/development-plan/${arg.measurementId}`, {
        method: 'DELETE'
      });
      
      // Trigger revalidation of development plan data if mutate function is provided
      if (arg.mutate) {
        await arg.mutate();
      }
      
      return response;
    },
    {
      onSuccess: (data) => {
        console.log('✅ Measurement deleted successfully');
      },
      onError: (error) => {
        console.error('❌ Failed to delete measurement:', error);
      }
    }
  );

  return {
    deleteMeasurement: trigger,
    isDeleting: isMutating
  };
}