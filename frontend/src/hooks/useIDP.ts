import { useState, useEffect, useCallback } from 'react';
import { IDPAPI, IDPRole, IDPAssessment, IDPCompetencyScores } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContextSWR';

// Hook for managing current IDP assessment
export function useIDPAssessment() {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<IDPAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: number]: 'yes' | 'no' }>({});
  const [scores, setScores] = useState<IDPCompetencyScores>({});

  // Load current assessment
  const loadAssessment = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const response = await IDPAPI.getCurrentAssessment();
      setAssessment(response.data);
      
      // Convert answers to the format we need
      if (response.data.answers) {
        const answersMap: { [questionId: number]: 'yes' | 'no' } = {};
        response.data.answers.forEach(answer => {
          answersMap[answer.questionId] = answer.answer;
        });
        setAnswers(answersMap);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load assessment');
      console.error('Error loading assessment:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save answers
  const saveAnswers = useCallback(async (newAnswers: { [questionId: number]: 'yes' | 'no' }) => {
    try {
      setError(null);
      await IDPAPI.saveAnswers(newAnswers);
      setAnswers(prev => ({ ...prev, ...newAnswers }));
    } catch (err: any) {
      setError(err.message || 'Failed to save answers');
      console.error('Error saving answers:', err);
      throw err;
    }
  }, []);

  // Update single answer
  const updateAnswer = useCallback(async (questionId: number, answer: 'yes' | 'no') => {
    const newAnswers = { [questionId]: answer };
    await saveAnswers(newAnswers);
  }, [saveAnswers]);

  // Complete assessment
  const completeAssessment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await IDPAPI.completeAssessment();
      setAssessment(response.data.assessment);
      setScores(response.data.scores);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to complete assessment');
      console.error('Error completing assessment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset assessment (delete everything and start fresh)
  const resetAssessment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await IDPAPI.resetAssessment();
      
      // Clear local state
      setAssessment(null);
      setAnswers({});
      setScores({});
      
      // Reload fresh assessment
      await loadAssessment();
    } catch (err: any) {
      setError(err.message || 'Failed to reset assessment');
      console.error('Error resetting assessment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadAssessment]);

  // Load assessment on mount
  useEffect(() => {
    loadAssessment();
  }, [loadAssessment]);

  return {
    assessment,
    answers,
    scores,
    loading,
    error,
    loadAssessment,
    saveAnswers,
    updateAnswer,
    completeAssessment,
    resetAssessment,
  };
}

// Hook for managing competencies by user role
export function useCompetencies() {
  const { user } = useAuth();
  const [role, setRole] = useState<IDPRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load role with competencies
  const loadCompetencies = useCallback(async (userRole?: string) => {
    const roleToLoad = userRole || user?.role;
    if (!roleToLoad) return;

    try {
      setLoading(true);
      setError(null);
      const response = await IDPAPI.getRoleByUserRole(roleToLoad);
      setRole(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load competencies');
      console.error('Error loading competencies:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  // Load competencies on mount or when user changes
  useEffect(() => {
    loadCompetencies();
  }, [loadCompetencies]);

  return {
    role,
    competencies: role?.competencies || [],
    loading,
    error,
    loadCompetencies,
  };
}

// Hook for managing all IDP roles
export function useIDPRoles() {
  const [roles, setRoles] = useState<IDPRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all roles
  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await IDPAPI.getRoles();
      setRoles(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load roles');
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load roles on mount
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  return {
    roles,
    loading,
    error,
    loadRoles,
  };
}

// Utility functions for IDP data
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
