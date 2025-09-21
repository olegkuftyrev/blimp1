import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  IDPRole, 
  IDPAssessment, 
  IDPCompetencyScores,
  AuthUser
} from '@/lib/api';

// Fetcher functions for SWR
const fetcher = async (url: string) => {
  return await apiFetch(url);
};

// Mutation functions
const saveAnswersMutation = async (url: string, { arg }: { arg: { [questionId: number]: 'yes' | 'no' } }) => {
  return await apiFetch(url, {
    method: 'POST',
    body: JSON.stringify({ answers: arg }),
  });
};

const completeAssessmentMutation = async (url: string) => {
  return await apiFetch(url, {
    method: 'POST',
  });
};

const resetAssessmentMutation = async (url: string) => {
  return await apiFetch(url, {
    method: 'POST',
  });
};

// Hook for managing current IDP assessment
export function useSWRIDPAssessment() {
  const { user } = useAuth();
  
  // Fetch current assessment
  const { 
    data: assessmentData, 
    error: assessmentError, 
    isLoading: assessmentLoading,
    mutate: mutateAssessment
  } = useSWR(
    user ? '/simple-auth/idp/assessment/current' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 seconds - assessment changes frequently
    }
  );

  // Mutations for assessment actions
  const { 
    trigger: saveAnswersTrigger, 
    isMutating: isSavingAnswers,
    error: saveError
  } = useSWRMutation(
    '/simple-auth/idp/assessment/answers',
    saveAnswersMutation,
    {
      onSuccess: () => {
        // Refresh assessment after saving answers
        mutateAssessment();
      }
    }
  );

  const { 
    trigger: completeAssessmentTrigger, 
    isMutating: isCompletingAssessment,
    error: completeError
  } = useSWRMutation(
    '/simple-auth/idp/assessment/complete',
    completeAssessmentMutation,
    {
      onSuccess: () => {
        // Refresh assessment after completion
        mutateAssessment();
      }
    }
  );

  const { 
    trigger: resetAssessmentTrigger, 
    isMutating: isResettingAssessment,
    error: resetError
  } = useSWRMutation(
    '/simple-auth/idp/assessment/reset',
    resetAssessmentMutation,
    {
      onSuccess: () => {
        // Refresh assessment after reset
        mutateAssessment();
      }
    }
  );

  const loading = assessmentLoading || isSavingAnswers || isCompletingAssessment || isResettingAssessment;
  const error = assessmentError || saveError || completeError || resetError;

  // Convert answers array to object format
  const answers = assessmentData?.data?.answers?.reduce((acc: { [questionId: number]: 'yes' | 'no' }, answer: any) => {
    acc[answer.questionId] = answer.answer;
    return acc;
  }, {}) || {};

  // Helper functions
  const saveAnswers = async (newAnswers: { [questionId: number]: 'yes' | 'no' }) => {
    try {
      await saveAnswersTrigger(newAnswers);
    } catch (err) {
      console.error('Error saving answers:', err);
      throw err;
    }
  };

  const updateAnswer = async (questionId: number, answer: 'yes' | 'no') => {
    await saveAnswers({ [questionId]: answer });
  };

  const completeAssessment = async () => {
    try {
      const result = await completeAssessmentTrigger();
      return result.data;
    } catch (err) {
      console.error('Error completing assessment:', err);
      throw err;
    }
  };

  const resetAssessment = async () => {
    try {
      await resetAssessmentTrigger();
    } catch (err) {
      console.error('Error resetting assessment:', err);
      throw err;
    }
  };

  return {
    assessment: assessmentData?.data || null,
    answers,
    scores: {}, // Will be populated after completion
    loading,
    error: error?.message || null,
    saveAnswers,
    updateAnswer,
    completeAssessment,
    resetAssessment,
    refreshAssessment: mutateAssessment,
  };
}

// Hook for managing competencies by user role
export function useSWRCompetencies(userRole?: string) {
  const { user } = useAuth();
  const roleToLoad = userRole || user?.role;
  
  const { 
    data: roleData, 
    error, 
    isLoading,
    mutate: mutateRole
  } = useSWR(
    roleToLoad ? `/simple-auth/idp/roles/${roleToLoad}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute - competencies don't change often
    }
  );

  return {
    role: roleData?.data || null,
    competencies: roleData?.data?.competencies || [],
    loading: isLoading,
    error: error?.message || null,
    refreshCompetencies: mutateRole,
  };
}

// Hook for managing current user's role
export function useSWRCurrentUserRole() {
  const { user } = useAuth();
  
  const { 
    data: roleData, 
    error, 
    isLoading,
    mutate: mutateRole
  } = useSWR(
    user ? '/simple-auth/idp/role/current' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    role: roleData?.data || null,
    competencies: roleData?.data?.competencies || [],
    loading: isLoading,
    error: error?.message || null,
    refreshRole: mutateRole,
  };
}

// Hook for managing all IDP roles
export function useSWRIDPRoles() {
  const { 
    data: rolesData, 
    error, 
    isLoading,
    mutate: mutateRoles
  } = useSWR(
    '/simple-auth/idp/roles',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes - roles change very rarely
    }
  );

  return {
    roles: rolesData?.data || [],
    loading: isLoading,
    error: error?.message || null,
    refreshRoles: mutateRoles,
  };
}

// Hook for getting user assessment (for admins/managers viewing other users)
export function useSWRUserAssessment(userId?: number) {
  const { user } = useAuth();
  
  const { 
    data: assessmentData, 
    error, 
    isLoading,
    mutate: mutateUserAssessment
  } = useSWR(
    user && userId ? `/simple-auth/idp/assessment/user/${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    userData: assessmentData?.data?.user || null,
    assessment: assessmentData?.data?.assessment || null,
    scores: assessmentData?.data?.scores || {},
    loading: isLoading,
    error: error?.message || null,
    refreshUserAssessment: mutateUserAssessment,
  };
}

// Utility functions for IDP data (same as before)
export const IDPUtils = {
  // Calculate progress for a competency
  getCompetencyProgress: (competency: any, answers: { [questionId: number]: 'yes' | 'no' }) => {
    if (!competency.questions?.length) return 0;
    
    const totalQuestions = competency.questions.length;
    const answeredQuestions = competency.questions.filter((q: any) => 
      answers[q.id] !== undefined
    ).length;
    
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  },

  // Calculate overall progress across all competencies
  getOverallProgress: (competencies: any[], answers: { [questionId: number]: 'yes' | 'no' }) => {
    if (!competencies.length) return 0;
    
    const totalQuestions = competencies.reduce((sum, comp) => 
      sum + (comp.questions?.length || 0), 0
    );
    const answeredQuestions = Object.keys(answers).length;
    
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
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
    if (percentage <= 60) return 'developing'; // 3 out of 5
    if (percentage <= 80) return 'proficient'; // 4 out of 5
    return 'expert'; // 5 out of 5
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
