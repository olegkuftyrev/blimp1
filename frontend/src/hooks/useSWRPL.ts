import useSWR from 'swr'
import { useState } from 'react'
import { apiFetch } from '@/lib/api'

export interface PLQuestion {
  id: number
  questionId: string
  label: string
  explanation: string
  formula: string
  a1: string
  a2: string
  a3: string
  a4: string
  correctAnswer: string
  userAnswer?: PLUserAnswer | null
  createdAt: string
  updatedAt: string
}

export interface PLUserAnswer {
  id: number
  userId: number
  plQuestionId: number
  plTestSetId: number
  userAnswer: string
  isCorrect: boolean
  createdAt: string
  updatedAt: string
}

export interface PLTestSet {
  id: number
  userId: number
  name: string
  description: string
  questionIds: string
  isDefault: boolean
  isCompleted: boolean
  questions: PLQuestion[]
  progress: {
    total: number
    answered: number
    correct: number
    percentage: number
  }
  createdAt: string
  updatedAt: string
}

export interface PLStats {
  totalTestSets: number
  totalAnswered: number
  correctAnswers: number
  incorrectAnswers: number
  percentage: number
}

// Hook to get all test sets for the user
export function usePLTestSets() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    data: PLTestSet[]
  }>('/pl-questions/test-sets', apiFetch, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  })

  return {
    testSets: data?.data || [],
    isLoading,
    error,
    mutate
  }
}

// Hook to get a specific test set
export function usePLTestSet(id: number) {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    data: PLTestSet
  }>(id ? `/pl-questions/test-sets/${id}` : null, apiFetch, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  })

  return {
    testSet: data?.data,
    isLoading,
    error,
    mutate
  }
}


// Hook to get P&L statistics
export function usePLStats() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    data: PLStats
  }>('/pl-questions/stats', apiFetch, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  })

  return {
    stats: data?.data,
    isLoading,
    error,
    mutate
  }
}

// Function to create a new test set
export async function createPLTestSet(name?: string, description?: string) {
  return apiFetch<{
    success: boolean
    data: PLTestSet
  }>('pl-questions/test-sets', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  })
}

// Function to submit an answer
export async function submitPLAnswer(questionId: number, userAnswer: string, testSetId: number) {
  return apiFetch<{
    success: boolean
    data: {
      answer: PLUserAnswer
      question: PLQuestion
      isCorrect: boolean
    }
  }>(`pl-questions/${questionId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ userAnswer, testSetId }),
  })
}

// Hook for submitting answers with optimistic updates
export function useSubmitPLAnswer() {
  const { mutate: mutateTestSets } = usePLTestSets()
  const { mutate: mutateStats } = usePLStats()

  const submitAnswer = async (questionId: number, userAnswer: string, testSetId: number) => {
    try {
      const result = await submitPLAnswer(questionId, userAnswer, testSetId)
      
      // Revalidate both test sets and stats
      mutateTestSets()
      mutateStats()
      
      return result
    } catch (error) {
      console.error('Failed to submit answer:', error)
      throw error
    }
  }

  return { submitAnswer }
}

// Hook for creating test sets
export function useCreatePLTestSet() {
  const { mutate: mutateTestSets } = usePLTestSets()
  const { mutate: mutateStats } = usePLStats()
  const [isCreating, setIsCreating] = useState(false)

  const createTestSet = async (name?: string, description?: string) => {
    if (isCreating) {
      console.log('Already creating a test set, skipping...')
      return
    }

    setIsCreating(true)
    try {
      console.log('useCreatePLTestSet: Starting to create test set', { name, description })
      const result = await createPLTestSet(name, description)
      console.log('useCreatePLTestSet: Test set created successfully:', result)
      
      // Revalidate both test sets and stats
      console.log('useCreatePLTestSet: Revalidating test sets and stats...')
      await Promise.all([
        mutateTestSets(),
        mutateStats()
      ])
      console.log('useCreatePLTestSet: Revalidation complete')
      
      return result
    } catch (error) {
      console.error('useCreatePLTestSet: Failed to create test set:', error)
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  return { createTestSet, isCreating }
}

// Function to reset a test set (admin only)
export async function resetPLTestSet(testSetId: number) {
  return apiFetch<{
    success: boolean
    message: string
  }>(`pl-questions/test-sets/${testSetId}/reset`, {
    method: 'POST',
  })
}

// Hook for resetting test sets (admin only)
export function useResetPLTestSet() {
  const { mutate: mutateTestSets } = usePLTestSets()
  const { mutate: mutateStats } = usePLStats()

  const resetTestSet = async (testSetId: number) => {
    try {
      const result = await resetPLTestSet(testSetId)
      
      // Revalidate both test sets and stats
      await Promise.all([
        mutateTestSets(),
        mutateStats()
      ])
      
      return result
    } catch (error) {
      console.error('Failed to reset test set:', error)
      throw error
    }
  }

  return { resetTestSet }
}

// Function to fill test set with random answers (admin only)
export async function fillRandomAnswers(testSetId: number) {
  return apiFetch<{
    success: boolean
    message: string
    data: {
      answersCount: number
      correctAnswers: number
      results: Array<{
        questionId: number
        questionIdStr: string
        answer: string
        isCorrect: boolean
      }>
    }
  }>(`pl-questions/test-sets/${testSetId}/fill-random`, {
    method: 'POST',
  })
}

// Function to fill test set with correct answers only (admin only)
export async function fillCorrectAnswers(testSetId: number) {
  return apiFetch<{
    success: boolean
    message: string
    data: {
      answersCount: number
      correctAnswers: number
      results: Array<{
        questionId: number
        questionIdStr: string
        answer: string
        isCorrect: boolean
      }>
    }
  }>(`pl-questions/test-sets/${testSetId}/fill-correct`, {
    method: 'POST',
  })
}

// Hook for filling random answers (admin only)
export function useFillRandomAnswers() {
  const { mutate: mutateTestSets } = usePLTestSets()
  const { mutate: mutateStats } = usePLStats()

  const fillRandom = async (testSetId: number) => {
    try {
      const result = await fillRandomAnswers(testSetId)
      
      // Revalidate both test sets and stats
      await Promise.all([
        mutateTestSets(),
        mutateStats()
      ])
      
      return result
    } catch (error) {
      console.error('Failed to fill random answers:', error)
      throw error
    }
  }

  return { fillRandomAnswers: fillRandom }
}

// Hook for filling correct answers only (admin only)
export function useFillCorrectAnswers() {
  const { mutate: mutateTestSets } = usePLTestSets()
  const { mutate: mutateStats } = usePLStats()

  const fillCorrect = async (testSetId: number) => {
    try {
      const result = await fillCorrectAnswers(testSetId)
      
      // Revalidate both test sets and stats
      await Promise.all([
        mutateTestSets(),
        mutateStats()
      ])
      
      return result
    } catch (error) {
      console.error('Failed to fill correct answers:', error)
      throw error
    }
  }

  return { fillCorrectAnswers: fillCorrect }
}

// Function to get test sets for a specific user (admin only)
export async function getPLTestSetsForUser(userId: number) {
  return apiFetch<{
    success: boolean
    data: PLTestSet[]
  }>(`pl-questions/users/${userId}/test-sets`)
}

// Function to get stats for a specific user (admin only)
export async function getPLStatsForUser(userId: number) {
  return apiFetch<{
    success: boolean
    data: PLStats
  }>(`pl-questions/users/${userId}/stats`)
}

// Hook for getting test sets for a specific user (admin only)
export function usePLTestSetsForUser(userId: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `pl-questions/users/${userId}/test-sets` : null,
    () => getPLTestSetsForUser(userId!)
  )

  return {
    testSets: data?.data || [],
    error,
    isLoading,
    mutate
  }
}

// Hook for getting stats for a specific user (admin only)
export function usePLStatsForUser(userId: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `pl-questions/users/${userId}/stats` : null,
    () => getPLStatsForUser(userId!)
  )

  return {
    stats: data?.data || null,
    error,
    isLoading,
    mutate
  }
}

// Hook for deleting all test sets (admin only)
export function useDeleteAllTestSets() {
  const { mutate: mutateTestSets } = usePLTestSets()
  const { mutate: mutateStats } = usePLStats()

  const deleteAllTestSets = async () => {
    try {
      const result = await apiFetch<{
        success: boolean
        message: string
      }>('pl-questions/test-sets', {
        method: 'DELETE',
      })

      // Refresh the data after deletion
      await mutateTestSets()
      await mutateStats()
      
      return result
    } catch (error) {
      console.error('Error deleting test sets:', error)
      throw error
    }
  }

  return {
    deleteAllTestSets
  }
}
