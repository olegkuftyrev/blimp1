import useSWR, { mutate as globalMutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import apiClient from '@/lib/axios';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContextSWR';
import type { 
  RolePerformance, 
  RolePerformanceWithSections, 
  UserPerformanceAnswer, 
  RoleProgress, 
  OverallProgress 
} from '@/lib/api';

// Fetcher functions for SWR
const fetcher = async (url: string) => apiFetch(url);

// Mutation function for saving answers
const saveAnswerMutation = async (url: string, { arg }: { arg: { performanceItemId: number; answer: 'yes' | 'no' } }) => {
  return apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  });
};

// Mutation function for saving answers in bulk
const saveAnswersBulkMutation = async (
  url: string,
  { arg }: { arg: { answers: Array<{ performanceItemId: number; answer: 'yes' | 'no' }> } }
) => {
  return apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  });
};

// Hook for managing all roles performance data
export function useSWRRolesPerformance() {
  const { user, isLoading: authLoading } = useAuth();
  const hasToken = typeof window !== 'undefined' && !!window.localStorage.getItem('auth_token');
  
  
  // Fetch all roles
  const { 
    data: rolesData, 
    error: rolesError, 
    isLoading: rolesLoading,
    mutate: mutateRoles
  } = useSWR(
    !authLoading && user && hasToken ? '/roles-performance' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
      shouldRetryOnError: false,
      onSuccess: (data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR Roles:', { 
            success: true, 
            count: data?.data?.length || 0,
            hasData: !!data,
            structure: data ? Object.keys(data) : []
          });
        }
      },
      onError: (error) => {
        const status = (error as any)?.response?.status;
        const message = (error as any)?.message || '';
        const is401 = status === 401 || /401|unauthorized/i.test(message);
        if (process.env.NODE_ENV === 'development' && !is401) {
          console.error('❌ SWR Roles Error:', message || error);
        }
      }
    }
  );

  // Fetch overall progress
  const { 
    data: progressData, 
    error: progressError, 
    isLoading: progressLoading,
    mutate: mutateProgress
  } = useSWR(
    !authLoading && user && hasToken ? '/roles-performance/progress/overall' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 seconds - progress changes more often
      shouldRetryOnError: false,
      onSuccess: (data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR Progress:', { 
            success: true, 
            totalRoles: data?.data?.overall?.totalRoles || 0,
            completedRoles: data?.data?.overall?.completedRoles || 0,
            progressPercent: data?.data?.overall?.overallProgressPercentage || 0
          });
        }
      },
      onError: (error) => {
        const status = (error as any)?.response?.status;
        const message = (error as any)?.message || '';
        const is401 = status === 401 || /401|unauthorized/i.test(message);
        if (process.env.NODE_ENV === 'development' && !is401) {
          console.error('❌ SWR Progress Error:', message || error);
        }
      }
    }
  );

  const loading = rolesLoading || progressLoading;
  const error = rolesError || progressError;

  return {
    roles: rolesData?.data || [],
    progress: progressData?.data || null,
    loading,
    error: error?.message || null,
    // Manual refresh functions
    refreshRoles: mutateRoles,
    refreshProgress: mutateProgress,
    refreshAll: () => {
      mutateRoles();
      mutateProgress();
    }
  };
}

// Hook for managing single role performance data
export function useSWRRolePerformance(roleId: number) {
  const { user, isLoading: authLoading } = useAuth();
  const hasToken = typeof window !== 'undefined' && !!window.localStorage.getItem('auth_token');
  
  // Fetch role details
  const { 
    data: roleData, 
    error: roleError, 
    isLoading: roleLoading,
    mutate: mutateRole
  } = useSWR(
    !authLoading && user && hasToken && roleId ? `/roles-performance/${roleId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute - role structure doesn't change often
      shouldRetryOnError: false,
    }
  );

  // Fetch user answers
  const { 
    data: answersData, 
    error: answersError, 
    isLoading: answersLoading,
    mutate: mutateAnswers
  } = useSWR(
    !authLoading && user && hasToken && roleId ? `/roles-performance/${roleId}/answers` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds - answers change frequently
      shouldRetryOnError: false,
    }
  );

  // Fetch progress
  const { 
    data: progressData, 
    error: progressError, 
    isLoading: progressLoading,
    mutate: mutateProgress
  } = useSWR(
    !authLoading && user && hasToken && roleId ? `/roles-performance/${roleId}/progress` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 seconds
      shouldRetryOnError: false,
    }
  );

  // Mutation for saving answers
  const { 
    trigger: saveAnswerTrigger, 
    isMutating: isSavingAnswer,
    error: saveError
  } = useSWRMutation(
    roleId ? `/roles-performance/${roleId}/answers` : null,
    saveAnswerMutation,
    {
      onSuccess: (data) => {
        console.log('🎉 SWR Mutation Success:', data);
        // Refresh answers and progress after successful save
        console.log('🔄 Refreshing answers and progress...');
        mutateAnswers();
        mutateProgress();
        // Also refresh overall progress and roles list dashboards
        globalMutate('/roles-performance/progress/overall');
        globalMutate('/roles-performance');
      },
      onError: (error) => {
        console.error('💥 SWR Mutation Error:', error);
      }
    }
  );

  const loading = roleLoading || answersLoading || progressLoading;
  const error = roleError || answersError || progressError || saveError;

  // Save answer function
  const saveAnswer = async (itemId: number, answer: 'yes' | 'no') => {
    try {
      console.log('🔄 Saving answer:', { itemId, answer, roleId });
      const result = await saveAnswerTrigger({ performanceItemId: itemId, answer });
      console.log('✅ Answer saved successfully:', result);
    } catch (err) {
      console.error('❌ Error saving answer:', err);
      throw err;
    }
  };

  return {
    role: roleData?.data || null,
    answers: answersData?.data?.answers || {},
    progress: progressData?.data || null,
    loading,
    error: error?.message || null,
    savingAnswer: isSavingAnswer,
    saveAnswer,
    // Manual refresh functions
    refreshRole: mutateRole,
    refreshAnswers: mutateAnswers,
    refreshProgress: mutateProgress,
    refreshAll: () => {
      mutateRole();
      mutateAnswers();
      mutateProgress();
    }
  };
}

// Utility functions (same as before, but exported for reuse)
export const RolesPerformanceUtils = {
  // Get section progress
  getSectionProgress: (section: any, answers: UserPerformanceAnswer) => {
    if (!section.items?.length) return { totalItems: 0, answeredItems: 0, yesAnswers: 0, percentage: 0 };
    
    const totalItems = section.items.length;
    const answeredItems = section.items.filter((item: any) => answers[item.id]).length;
    const yesAnswers = section.items.filter((item: any) => answers[item.id] === 'yes').length;
    const percentage = totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0;
    
    return { totalItems, answeredItems, yesAnswers, percentage };
  },

  // Get progress color based on mastery percentage (yes answers / total items)
  getProgressColor: (yesAnswers: number, totalItems: number) => {
    const masteryPercentage = totalItems > 0 ? (yesAnswers / totalItems) * 100 : 0;
    
    if (masteryPercentage === 100) return 'text-green-600 dark:text-green-400';
    if (masteryPercentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (masteryPercentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    if (masteryPercentage > 0) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-400 dark:text-gray-500';
  },

  // Get progress background color based on mastery percentage (yes answers / total items)
  getProgressBgColor: (yesAnswers: number, totalItems: number) => {
    const masteryPercentage = totalItems > 0 ? (yesAnswers / totalItems) * 100 : 0;
    
    if (masteryPercentage === 100) return 'bg-green-100 border-green-200 dark:bg-green-950/20 dark:border-green-800';
    if (masteryPercentage >= 80) return 'bg-blue-100 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800';
    if (masteryPercentage >= 50) return 'bg-yellow-100 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800';
    if (masteryPercentage > 0) return 'bg-orange-100 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800';
    return 'bg-card text-card-foreground border-border';
  },

  // Check if section has unanswered questions
  hasUnansweredQuestions: (section: any, answers: UserPerformanceAnswer) => {
    if (!section.items?.length) return false;
    return section.items.some((item: any) => !answers[item.id]);
  },

  // Get sections that should be auto-expanded (with unanswered questions)
  getAutoExpandedSections: (sections: any[], answers: UserPerformanceAnswer) => {
    const expandedSet = new Set<number>();
    sections.forEach(section => {
      if (RolesPerformanceUtils.hasUnansweredQuestions(section, answers)) {
        expandedSet.add(section.id);
      }
    });
    return expandedSet;
  },

  // Calculate mastery rate from progress
  getMasteryRate: (progress: RoleProgress | null) => {
    if (!progress || progress.answeredItems === 0) return 0;
    return Math.round((progress.yesAnswers / progress.answeredItems) * 100);
  },
};

// Hook for saving answers in bulk (similar to P&L bulk operations style)
export function useSaveRoleAnswersBulk(roleId: number | null) {
  const key = roleId ? `/roles-performance/${roleId}/answers/bulk` : null;

  const { trigger, isMutating, error } = useSWRMutation(
    key,
    saveAnswersBulkMutation,
    {
      onSuccess: () => {
        // Revalidate role-specific caches and overall dashboards
        if (roleId) {
          globalMutate(`/roles-performance/${roleId}/answers`);
          globalMutate(`/roles-performance/${roleId}/progress`);
        }
        globalMutate('/roles-performance/progress/overall');
        globalMutate('/roles-performance');
      }
    }
  );

  const saveAnswersBulk = async (
    answers: Array<{ performanceItemId: number; answer: 'yes' | 'no' }>
  ) => {
    if (!roleId) return;
    return trigger({ answers });
  };

  return { saveAnswersBulk, isSavingBulk: isMutating, bulkError: error };
}
