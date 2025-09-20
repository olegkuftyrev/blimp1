import { useState, useEffect, useCallback } from 'react';
import { RolesPerformanceAPI, type RolePerformance, type RolePerformanceWithSections, type UserPerformanceAnswer, type RoleProgress, type OverallProgress } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Hook for managing roles performance data
export function useRolesPerformance() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<RolePerformance[]>([]);
  const [progress, setProgress] = useState<OverallProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load roles and overall progress
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Fetch roles and progress in parallel
      const [rolesData, progressData] = await Promise.all([
        RolesPerformanceAPI.getRoles(),
        RolesPerformanceAPI.getOverallProgress()
      ]);

      setRoles(rolesData.data);
      setProgress(progressData.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load roles performance data');
      console.error('Error loading roles performance data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh progress only
  const refreshProgress = useCallback(async () => {
    if (!user) return;

    try {
      const progressData = await RolesPerformanceAPI.getOverallProgress();
      setProgress(progressData.data);
    } catch (err: any) {
      console.error('Error refreshing progress:', err);
    }
  }, [user]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    roles,
    progress,
    loading,
    error,
    loadData,
    refreshProgress,
  };
}

// Hook for managing single role performance data
export function useRolePerformance(roleId: number) {
  const { user } = useAuth();
  const [role, setRole] = useState<RolePerformanceWithSections | null>(null);
  const [answers, setAnswers] = useState<UserPerformanceAnswer>({});
  const [progress, setProgress] = useState<RoleProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingAnswer, setSavingAnswer] = useState<number | null>(null);

  // Load role data
  const loadRoleData = useCallback(async () => {
    if (!user || !roleId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch role details, answers, and progress in parallel
      const [roleData, answersData, progressData] = await Promise.all([
        RolesPerformanceAPI.getRole(roleId),
        RolesPerformanceAPI.getUserAnswers(roleId),
        RolesPerformanceAPI.getUserProgress(roleId)
      ]);

      setRole(roleData.data);
      setAnswers(answersData.data.answers);
      setProgress(progressData.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load role data');
      console.error('Error loading role data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, roleId]);

  // Save answer
  const saveAnswer = useCallback(async (itemId: number, answer: 'yes' | 'no') => {
    if (!user) return;

    try {
      setSavingAnswer(itemId);
      setError(null);

      await RolesPerformanceAPI.saveAnswer(itemId, answer);

      // Update local state
      setAnswers(prev => ({
        ...prev,
        [itemId]: answer
      }));

      // Refresh progress
      const progressData = await RolesPerformanceAPI.getUserProgress(roleId);
      setProgress(progressData.data);

    } catch (err: any) {
      setError(err.message || 'Failed to save answer');
      console.error('Error saving answer:', err);
      throw err;
    } finally {
      setSavingAnswer(null);
    }
  }, [user, roleId]);

  // Refresh progress only
  const refreshProgress = useCallback(async () => {
    if (!user || !roleId) return;

    try {
      const progressData = await RolesPerformanceAPI.getUserProgress(roleId);
      setProgress(progressData.data);
    } catch (err: any) {
      console.error('Error refreshing progress:', err);
    }
  }, [user, roleId]);

  // Load role data on mount
  useEffect(() => {
    loadRoleData();
  }, [loadRoleData]);

  return {
    role,
    answers,
    progress,
    loading,
    error,
    savingAnswer,
    loadRoleData,
    saveAnswer,
    refreshProgress,
  };
}

// Utility functions for Roles Performance data
export const RolesPerformanceUtils = {
  // Get section progress
  getSectionProgress: (section: any, answers: UserPerformanceAnswer) => {
    if (!section.items?.length) return { totalItems: 0, answeredItems: 0, percentage: 0 };
    
    const totalItems = section.items.length;
    const answeredItems = section.items.filter((item: any) => answers[item.id]).length;
    const percentage = totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0;
    
    return { totalItems, answeredItems, percentage };
  },

  // Get progress color based on percentage
  getProgressColor: (percentage: number) => {
    if (percentage === 100) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-blue-600 dark:text-blue-400';
    if (percentage > 0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-400 dark:text-gray-500';
  },

  // Get progress background color based on percentage
  getProgressBgColor: (percentage: number) => {
    if (percentage === 100) return 'bg-green-100 border-green-200 dark:bg-green-950/20 dark:border-green-800';
    if (percentage >= 50) return 'bg-blue-100 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800';
    if (percentage > 0) return 'bg-yellow-100 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800';
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
