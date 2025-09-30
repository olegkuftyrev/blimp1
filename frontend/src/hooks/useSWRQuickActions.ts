import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { UserPreferencesAPI } from '@/lib/api';

const QUICK_ACTIONS_KEY = 'quick_actions';

// Fetcher function for SWR
const fetcher = async () => {
  const response = await UserPreferencesAPI.getAll();
  if (response.success) {
    return response.data;
  }
  throw new Error('Failed to fetch preferences');
};

// Mutator function for SWR mutation
const mutator = async (url: string, { arg }: { arg: { key: string; value: any } }) => {
  const response = await UserPreferencesAPI.save(arg.key, arg.value);
  if (response.success) {
    return response;
  }
  throw new Error('Failed to save preference');
};

export function useSWRQuickActions() {
  const { data: preferences, error, isLoading, mutate } = useSWR(
    'user-preferences',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  const { trigger: savePreference, isMutating } = useSWRMutation(
    'user-preferences',
    mutator
  );

  // Get quick actions from preferences
  const quickActions = preferences?.[QUICK_ACTIONS_KEY] || null;

  // Save quick actions
  const saveQuickActions = async (actions: string[]) => {
    try {
      await savePreference({ key: QUICK_ACTIONS_KEY, value: actions });
      // Optimistically update the cache
      mutate(
        (current) => ({
          ...current,
          [QUICK_ACTIONS_KEY]: actions,
        }),
        false
      );
      return { success: true };
    } catch (error) {
      console.error('Failed to save quick actions:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    quickActions,
    saveQuickActions,
    isLoading,
    isSaving: isMutating,
    error,
    mutate,
  };
}
