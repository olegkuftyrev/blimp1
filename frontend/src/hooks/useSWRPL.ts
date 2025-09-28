import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { apiFetch } from '@/lib/api';

// P&L Report interfaces
export interface PLLineItem {
  id: number;
  plReportId: number;
  category: string;
  subcategory: string;
  ledgerAccount: string;
  actuals: number | string;
  actualsPercentage: number | string;
  plan: number | string;
  planPercentage: number | string;
  vfp: number | string; // Variance from Plan
  priorYear: number | string;
  priorYearPercentage: number | string;
  actualYtd: number | string;
  actualYtdPercentage: number | string;
  planYtd: number | string;
  planYtdPercentage: number | string;
  vfpYtd: number | string;
  priorYearYtd: number | string;
  priorYearYtdPercentage: number | string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PLReport {
  id: number;
  restaurantId: number;
  storeName: string;
  company: string;
  period: string;
  year: number;
  fileName?: string;
  fileSize?: number;
  uploadStatus: string;
  errorMessage?: string;
  uploadedBy?: number;
  translationCurrency: string;
  // Financial metrics
  netSales: number;
  grossSales: number;
  costOfGoodsSold: number;
  totalLabor: number;
  controllables: number;
  controllableProfit: number;
  advertising: number;
  fixedCosts: number;
  restaurantContribution: number;
  cashflow: number;
  // Line items
  lineItems?: PLLineItem[];
  createdAt: string;
  updatedAt: string;
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<any> => {
  const response = await apiFetch(url);
  return response;
};

// Hook for fetching P&L reports
export function usePLReports(restaurantId?: number, period?: string) {
  const { 
    data, 
    error, 
    isLoading,
    mutate
  } = useSWR<any>(
    () => {
      if (typeof window === 'undefined' || !restaurantId) {
        return null;
      }
      const hasToken = window.localStorage.getItem('auth_token');
      let url = `pl-reports?restaurantId=${restaurantId}`;
      if (period) {
        url += `&period=${period}`;
      }
      return hasToken ? url : null;
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes - reports don't change often
      shouldRetryOnError: true,
      onSuccess: (data: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR PL Reports:', { 
            success: true, 
            count: data?.data?.length || 0,
            restaurantId,
            period,
            reports: data?.data?.map((r: any) => ({ id: r.id, period: r.period, storeName: r.storeName }))
          });
        }
      },
      onError: (error: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR PL Reports Error:', { 
            error: error.message,
            restaurantId,
            period
          });
        }
      }
    }
  );

  return {
    reports: data?.data || [],
    loading: isLoading,
    error,
    mutate
  };
}

// Hook for fetching P&L line items
export function usePLLineItems(reportId?: number) {
  const { 
    data, 
    error, 
    isLoading,
    mutate
  } = useSWR<any>(
    () => {
      if (typeof window === 'undefined' || !reportId) return null;
      return window.localStorage.getItem('auth_token') ? `pl-reports/${reportId}/line-items` : null;
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes - line items don't change often
      shouldRetryOnError: true,
      onSuccess: (data: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR PL Line Items:', { 
            success: true, 
            count: data?.data?.length || 0,
            reportId,
            categories: [...new Set(data?.data?.map((item: any) => item.category).filter(Boolean))],
            sample: data?.data?.slice(0, 3).map((item: any) => ({ 
              id: item.id, 
              category: item.category, 
              ledgerAccount: item.ledgerAccount,
              actuals: item.actuals 
            }))
          });
        }
      },
      onError: (error: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR PL Line Items Error:', { 
            error: error.message,
            reportId
          });
        }
      }
    }
  );

  return {
    lineItems: data?.data || [],
    loading: isLoading,
    error,
    mutate
  };
}

// Hook for uploading P&L file
export function useUploadPLFile() {
  const { 
    trigger: uploadFile, 
    isMutating: isUploading,
    error: uploadError
  } = useSWRMutation(
    'pl-reports/upload',
    async (url: string, { arg }: { arg: { file: File; restaurantId: number; period: string } }) => {
      const formData = new FormData();
      formData.append('plFile', arg.file);
      formData.append('restaurantId', arg.restaurantId.toString());
      formData.append('period', arg.period);
      
      return apiFetch<{ message: string; data: PLReport }>(url, {
        method: 'POST',
        body: formData,
      });
    },
    {
      onSuccess: (data) => {
        console.log('✅ P&L file uploaded successfully:', data.message);
        // Invalidate all P&L related caches to refresh the UI
        mutate(
          (key) => typeof key === 'string' && key.includes('pl-reports'),
          undefined,
          { revalidate: true }
        );
      },
      onError: (error) => {
        console.error('❌ Failed to upload P&L file:', error.message);
      }
    }
  );

  return {
    uploadFile,
    isUploading,
    uploadError
  };
}

// Hook for deleting P&L report
export function useDeletePLReport() {
  const { 
    trigger: deleteReport, 
    isMutating: isDeleting,
    error: deleteError
  } = useSWRMutation(
    'pl-reports/delete',
    async (url: string, { arg }: { arg: { reportId: number; mutate?: () => Promise<any> } }) => {
      const response = await apiFetch<{ message: string }>(`pl-reports/${arg.reportId}`, {
        method: 'DELETE'
      });
      
      // Trigger revalidation of reports data if mutate function is provided
      if (arg.mutate) {
        await arg.mutate();
      }
      
      return response;
    },
    {
      onSuccess: (data) => {
        console.log('✅ P&L report deleted successfully:', data.message);
      },
      onError: (error) => {
        console.error('❌ Failed to delete P&L report:', error.message);
      }
    }
  );

  return {
    deleteReport,
    isDeleting,
    deleteError
  };
}

// PL Test interfaces
export interface PLQuestion {
  id: number;
  questionId: string;
  label: string;
  explanation: string;
  formula: string;
  a1: string;
  a2: string;
  a3: string;
  a4: string;
  correctAnswer: string;
  createdAt: string;
  updatedAt: string;
}

export interface PLTestSet {
  id: number;
  userId: number;
  status: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  questions?: PLQuestion[];
}

export interface PLStats {
  totalTests: number;
  averageScore: number;
  bestScore: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

// Hook for fetching PL test sets
export function usePLTestSets() {
  const { 
    data, 
    error, 
    isLoading,
    mutate
  } = useSWR<any>(
    () => {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem('auth_token') ? 'pl-test-sets' : null;
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      shouldRetryOnError: true,
      onSuccess: (data: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR PL Test Sets:', { 
            success: true, 
            count: data?.data?.length || 0
          });
        }
      },
      onError: (error: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR PL Test Sets Error:', error.message);
        }
      }
    }
  );

  return {
    testSets: data?.data || [],
    loading: isLoading,
    error,
    mutate
  };
}

// Hook for fetching specific PL test set
export function usePLTestSet(testSetId?: number) {
  const { 
    data, 
    error, 
    isLoading,
    mutate
  } = useSWR<any>(
    () => {
      if (typeof window === 'undefined' || !testSetId) return null;
      return window.localStorage.getItem('auth_token') ? `pl-test-sets/${testSetId}` : null;
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      shouldRetryOnError: true,
      onSuccess: (data: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR PL Test Set:', { 
            success: true, 
            testSetId,
            hasQuestions: !!data?.data?.questions?.length
          });
        }
      },
      onError: (error: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR PL Test Set Error:', error.message);
        }
      }
    }
  );

  return {
    testSet: data?.data || null,
    loading: isLoading,
    error,
    mutate
  };
}

// Hook for fetching PL stats
export function usePLStats() {
  const { 
    data, 
    error, 
    isLoading,
    mutate
  } = useSWR<any>(
    () => {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem('auth_token') ? 'pl-stats' : null;
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      shouldRetryOnError: true,
      onSuccess: (data: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR PL Stats:', { 
            success: true, 
            stats: data?.data
          });
        }
      },
      onError: (error: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR PL Stats Error:', error.message);
        }
      }
    }
  );

  return {
    stats: data?.data || null,
    loading: isLoading,
    error,
    mutate
  };
}

// Hook for fetching PL test sets for specific user
export function usePLTestSetsForUser(userId?: number) {
  const { 
    data, 
    error, 
    isLoading,
    mutate
  } = useSWR<any>(
    () => {
      if (typeof window === 'undefined' || !userId) return null;
      return window.localStorage.getItem('auth_token') ? `pl-test-sets/user/${userId}` : null;
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      shouldRetryOnError: true,
      onSuccess: (data: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR PL Test Sets For User:', { 
            success: true, 
            userId,
            count: data?.data?.length || 0
          });
        }
      },
      onError: (error: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR PL Test Sets For User Error:', error.message);
        }
      }
    }
  );

  return {
    testSets: data?.data || [],
    loading: isLoading,
    error,
    mutate
  };
}

// Hook for fetching PL stats for specific user
export function usePLStatsForUser(userId?: number) {
  const { 
    data, 
    error, 
    isLoading,
    mutate
  } = useSWR<any>(
    () => {
      if (typeof window === 'undefined' || !userId) return null;
      return window.localStorage.getItem('auth_token') ? `pl-stats/user/${userId}` : null;
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      shouldRetryOnError: true,
      onSuccess: (data: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR PL Stats For User:', { 
            success: true, 
            userId,
            stats: data?.data
          });
        }
      },
      onError: (error: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR PL Stats For User Error:', error.message);
        }
      }
    }
  );

  return {
    stats: data?.data || null,
    loading: isLoading,
    error,
    mutate
  };
}

// Mutation for creating PL test set
export function useCreatePLTestSet() {
  const { 
    trigger: createTestSet, 
    isMutating: isCreating,
    error: createError
  } = useSWRMutation(
    'pl-test-sets/create',
    async (url: string) => {
      return apiFetch<{ message: string; data: PLTestSet }>(url, {
        method: 'POST',
      });
    },
    {
      onSuccess: (data) => {
        console.log('✅ PL test set created successfully:', data.message);
      },
      onError: (error) => {
        console.error('❌ Failed to create PL test set:', error.message);
      }
    }
  );

  return {
    createTestSet,
    isCreating,
    createError
  };
}

// Mutation for submitting PL answer
export function useSubmitPLAnswer() {
  const { 
    trigger: submitAnswer, 
    isMutating: isSubmitting,
    error: submitError
  } = useSWRMutation(
    'pl-test-sets/submit-answer',
    async (url: string, { arg }: { arg: { testSetId: number; questionId: number; answer: string } }) => {
      return apiFetch<{ message: string; data: any }>(url, {
        method: 'POST',
        body: JSON.stringify(arg),
      });
    },
    {
      onSuccess: (data) => {
        console.log('✅ PL answer submitted successfully:', data.message);
      },
      onError: (error) => {
        console.error('❌ Failed to submit PL answer:', error.message);
      }
    }
  );

  return {
    submitAnswer,
    isSubmitting,
    submitError
  };
}

// Mutation for resetting PL test set
export function useResetPLTestSet() {
  const { 
    trigger: resetTestSet, 
    isMutating: isResetting,
    error: resetError
  } = useSWRMutation(
    'pl-test-sets/reset',
    async (url: string, { arg }: { arg: { testSetId: number } }) => {
      return apiFetch<{ message: string; data: PLTestSet }>(url, {
        method: 'POST',
        body: JSON.stringify(arg),
      });
    },
    {
      onSuccess: (data) => {
        console.log('✅ PL test set reset successfully:', data.message);
      },
      onError: (error) => {
        console.error('❌ Failed to reset PL test set:', error.message);
      }
    }
  );

  return {
    resetTestSet,
    isResetting,
    resetError
  };
}

// Mutation for filling random answers
export function useFillRandomAnswers() {
  const { 
    trigger: fillRandomAnswers, 
    isMutating: isFilling,
    error: fillError
  } = useSWRMutation(
    'pl-test-sets/fill-random',
    async (url: string, { arg }: { arg: { testSetId: number } }) => {
      return apiFetch<{ message: string; data: any }>(url, {
        method: 'POST',
        body: JSON.stringify(arg),
      });
    },
    {
      onSuccess: (data) => {
        console.log('✅ Random answers filled successfully:', data.message);
      },
      onError: (error) => {
        console.error('❌ Failed to fill random answers:', error.message);
      }
    }
  );

  return {
    fillRandomAnswers,
    isFilling,
    fillError
  };
}

// Mutation for filling correct answers
export function useFillCorrectAnswers() {
  const { 
    trigger: fillCorrectAnswers, 
    isMutating: isFilling,
    error: fillError
  } = useSWRMutation(
    'pl-test-sets/fill-correct',
    async (url: string, { arg }: { arg: { testSetId: number } }) => {
      return apiFetch<{ message: string; data: any }>(url, {
        method: 'POST',
        body: JSON.stringify(arg),
      });
    },
    {
      onSuccess: (data) => {
        console.log('✅ Correct answers filled successfully:', data.message);
      },
      onError: (error) => {
        console.error('❌ Failed to fill correct answers:', error.message);
      }
    }
  );

  return {
    fillCorrectAnswers,
    isFilling,
    fillError
  };
}

// Mutation for deleting all test sets
export function useDeleteAllTestSets() {
  const { 
    trigger: deleteAllTestSets, 
    isMutating: isDeleting,
    error: deleteError
  } = useSWRMutation(
    'pl-test-sets/delete-all',
    async (url: string) => {
      return apiFetch<{ message: string }>(url, {
        method: 'DELETE',
      });
    },
    {
      onSuccess: (data) => {
        console.log('✅ All test sets deleted successfully:', data.message);
      },
      onError: (error) => {
        console.error('❌ Failed to delete all test sets:', error.message);
      }
    }
  );

  return {
    deleteAllTestSets,
    isDeleting,
    deleteError
  };
}

// Utility functions for P&L data
export const PLUtils = {
  // Format currency values
  formatCurrency: (value: number | string | null | undefined, currency: string = 'USD') => {
    if (value === null || value === undefined) return 'N/A';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  },

  // Format percentage values
  formatPercentage: (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    return `${numValue.toFixed(2)}%`;
  },

  // Get variance status (positive/negative/neutral)
  getVarianceStatus: (vfp: number | string | null | undefined) => {
    if (vfp === null || vfp === undefined) return 'neutral';
    const numValue = typeof vfp === 'string' ? parseFloat(vfp) : vfp;
    if (isNaN(numValue)) return 'neutral';
    return numValue > 0 ? 'positive' : numValue < 0 ? 'negative' : 'neutral';
  },

  // Get variance color class
  getVarianceColor: (vfp: number | string | null | undefined) => {
    const status = PLUtils.getVarianceStatus(vfp);
    switch (status) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  },

  // Group line items by category
  groupByCategory: (lineItems: PLLineItem[]) => {
    return lineItems.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, PLLineItem[]>);
  },

  // Calculate category totals
  calculateCategoryTotals: (lineItems: PLLineItem[]) => {
    return lineItems.reduce((totals, item) => {
      const parseValue = (value: number | string | null | undefined) => {
        if (value === null || value === undefined) return 0;
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(numValue) ? 0 : numValue;
      };

      totals.actuals += parseValue(item.actuals);
      totals.plan += parseValue(item.plan);
      totals.vfp += parseValue(item.vfp);
      totals.priorYear += parseValue(item.priorYear);
      totals.actualYtd += parseValue(item.actualYtd);
      totals.planYtd += parseValue(item.planYtd);
      totals.vfpYtd += parseValue(item.vfpYtd);
      totals.priorYearYtd += parseValue(item.priorYearYtd);
      return totals;
    }, {
      actuals: 0,
      plan: 0,
      vfp: 0,
      priorYear: 0,
      actualYtd: 0,
      planYtd: 0,
      vfpYtd: 0,
      priorYearYtd: 0,
    });
  },

  // Sort line items by sort order and category
  sortLineItems: (lineItems: PLLineItem[]) => {
    return [...lineItems].sort((a, b) => {
      // First sort by category
      if (a.category !== b.category) {
        return (a.category || '').localeCompare(b.category || '');
      }
      // Then by sort order
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  }
};