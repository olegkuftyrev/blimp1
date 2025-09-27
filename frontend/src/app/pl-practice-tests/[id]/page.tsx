'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { usePLTestSet, useSubmitPLAnswer, useResetPLTestSet, useFillRandomAnswers, useFillCorrectAnswers, usePLStats, type PLQuestion } from '@/hooks/useSWRPL'
import { useSWRCurrentUser } from '@/hooks/useSWRAuth'
import { useConfirmDialog } from '@/components/ConfirmDialog'
import { useToastAlerts, toast } from '@/components/ToastAlert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Calculator, BookOpen, ArrowLeft, RotateCcw, Shuffle, Target } from 'lucide-react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function PLTestSetPage({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const testSetId = parseInt(resolvedParams.id)
  const { testSet, isLoading, error, mutate: mutateTestSet } = usePLTestSet(testSetId)
  const { submitAnswer } = useSubmitPLAnswer()
  const { resetTestSet } = useResetPLTestSet()
  const { fillRandomAnswers } = useFillRandomAnswers()
  const { fillCorrectAnswers } = useFillCorrectAnswers()
  const { stats } = usePLStats()
  const { user } = useSWRCurrentUser()
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog()
  const { addAlert, ToastContainer } = useToastAlerts()
  
  const [submittingAnswers, setSubmittingAnswers] = useState<Set<number>>(new Set())
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())
  const [isResetting, setIsResetting] = useState(false)
  const [isFillingRandom, setIsFillingRandom] = useState(false)
  const [isFillingCorrect, setIsFillingCorrect] = useState(false)

  // Track which questions have been answered
  useEffect(() => {
    if (testSet) {
      const answered = new Set<number>()
      testSet.questions.forEach((question, index) => {
        if (question.userAnswer) {
          answered.add(index)
        }
      })
      setAnsweredQuestions(answered)
    }
  }, [testSet])

  const handleAnswerSelect = async (questionIndex: number, answer: string) => {
    if (!testSet) return
    
    const question = testSet.questions[questionIndex]
    if (!question || submittingAnswers.has(questionIndex)) return

    setSubmittingAnswers(prev => new Set(prev).add(questionIndex))
    
    try {
      await submitAnswer(question.id, answer, testSet.id)
      setAnsweredQuestions(prev => new Set(prev).add(questionIndex))
    } catch (error) {
      console.error('Failed to submit answer:', error)
    } finally {
      setSubmittingAnswers(prev => {
        const newSet = new Set(prev)
        newSet.delete(questionIndex)
        return newSet
      })
    }
  }

  const handleResetTestSet = async () => {
    if (!testSet || !user || user.role !== 'admin') return
    
    showConfirm({
      title: 'Reset Test Set',
      description: `Are you sure you want to reset all answers for "${testSet.name}"? This action cannot be undone.`,
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        setIsResetting(true)
        try {
          await resetTestSet(testSetId)
          // Reset local state
          setAnsweredQuestions(new Set())
          setSubmittingAnswers(new Set())
          // Refresh the test set data
          mutateTestSet()
          addAlert(toast.success('Test Set Reset!', 'All answers have been reset successfully.'))
        } catch (error) {
          console.error('Failed to reset test set:', error)
          addAlert(toast.error('Failed to Reset Test Set', error instanceof Error ? error.message : 'Unknown error occurred'))
        } finally {
          setIsResetting(false)
        }
      },
    })
  }

  const handleFillRandomAnswers = async () => {
    if (!testSet || !user || user.role !== 'admin') return
    
    showConfirm({
      title: 'Fill Random Answers',
      description: `Are you sure you want to fill "${testSet.name}" with random answers? This will replace any existing answers.`,
      confirmText: 'Fill Random',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: async () => {
        setIsFillingRandom(true)
        try {
          const result = await fillRandomAnswers(testSetId)
          // Update local state to show all questions as answered
          const allQuestionIndices = new Set(testSet.questions.map((_, index) => index))
          setAnsweredQuestions(allQuestionIndices)
          setSubmittingAnswers(new Set())
          // Refresh the test set data
          mutateTestSet()
          
          // Show success message with stats
          const accuracy = Math.round((result.data.correctAnswers / result.data.answersCount) * 100)
          addAlert(toast.success(
            'Random Answers Filled!', 
            `Correct answers: ${result.data.correctAnswers}/${result.data.answersCount} (${accuracy}% accuracy)`
          ))
        } catch (error) {
          console.error('Failed to fill random answers:', error)
          addAlert(toast.error('Failed to Fill Random Answers', error instanceof Error ? error.message : 'Unknown error occurred'))
        } finally {
          setIsFillingRandom(false)
        }
      },
    })
  }

  const handleFillCorrectAnswers = async () => {
    if (!testSet || !user || user.role !== 'admin') return
    
    showConfirm({
      title: 'Fill Correct Answers',
      description: `Are you sure you want to fill "${testSet.name}" with correct answers only? This will replace any existing answers.`,
      confirmText: 'Fill Correct',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: async () => {
        setIsFillingCorrect(true)
        try {
          const result = await fillCorrectAnswers(testSetId)
          // Update local state to show all questions as answered
          const allQuestionIndices = new Set(testSet.questions.map((_, index) => index))
          setAnsweredQuestions(allQuestionIndices)
          setSubmittingAnswers(new Set())
          // Refresh the test set data
          mutateTestSet()
          
          // Show success message with stats
          addAlert(toast.success(
            'Correct Answers Filled!', 
            `All answers are correct: ${result.data.correctAnswers}/${result.data.answersCount} (100% accuracy)`
          ))
        } catch (error) {
          console.error('Failed to fill correct answers:', error)
          addAlert(toast.error('Failed to Fill Correct Answers', error instanceof Error ? error.message : 'Unknown error occurred'))
        } finally {
          setIsFillingCorrect(false)
        }
      },
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading test set...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !testSet) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-400">
              <XCircle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Test Set Not Found</h3>
              <p>The requested test set could not be found.</p>
              <Button 
                onClick={() => router.push('/pl-practice-tests')}
                className="mt-4"
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button 
            onClick={() => router.push('/pl-practice-tests')}
            variant="outline"
            size="sm"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tests
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calculator className="h-8 w-8" />
              {testSet.name}
            </h1>
            {testSet.progress && testSet.progress.percentage === 100 && (
              <Badge variant={
                testSet.progress.correct >= testSet.progress.total * 0.7 
                  ? "default" 
                  : "destructive"
              } className="text-sm">
                {testSet.progress.correct >= testSet.progress.total * 0.7 ? 'Pass' : 'Fail'}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-2">
            {testSet.description}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {testSet.progress && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {testSet.progress.correct}/{testSet.progress.total}
              </div>
              <p className="text-sm text-muted-foreground">Correct answers</p>
            </div>
          )}
          
          {/* Admin Buttons */}
          {user && user.role === 'admin' && (
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleFillRandomAnswers}
                disabled={isFillingRandom || isResetting || isFillingCorrect}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Shuffle className="h-4 w-4" />
                {isFillingRandom ? 'Filling...' : 'Random Answers'}
              </Button>
              <Button
                onClick={handleFillCorrectAnswers}
                disabled={isFillingCorrect || isResetting || isFillingRandom}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                {isFillingCorrect ? 'Filling...' : 'Correct Answers'}
              </Button>
              <Button
                onClick={handleResetTestSet}
                disabled={isResetting || isFillingRandom || isFillingCorrect}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {isResetting ? 'Resetting...' : 'Reset Test'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Test Set Progress */}
      {testSet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Test Progress
            </CardTitle>
            <CardDescription>
              Progress for this specific test set
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testSet.questions.length}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{testSet.progress.answered}</div>
                <div className="text-sm text-muted-foreground">Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testSet.progress.correct}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testSet.progress.answered - testSet.progress.correct}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Accuracy</span>
                <span>{testSet.progress.answered > 0 ? ((testSet.progress.correct / testSet.progress.answered) * 100).toFixed(1) : 0}%</span>
              </div>
              <Progress 
                value={testSet.progress.answered > 0 ? (testSet.progress.correct / testSet.progress.answered) * 100 : 0} 
                className={`h-2 ${testSet.progress.answered > 0 && (testSet.progress.correct / testSet.progress.answered) >= 0.7 ? '[&>div]:bg-green-500' : testSet.progress.answered > 0 ? '[&>div]:bg-orange-500' : '[&>div]:bg-muted-foreground'}`}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Questions */}
      <div className="space-y-6">
        {testSet.questions.map((question, questionIndex) => {
          const isAnswered = answeredQuestions.has(questionIndex)
          const isSubmitting = submittingAnswers.has(questionIndex)
          const userAnswer = question.userAnswer?.userAnswer
          
          return (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Question {question.questionId}</span>
                  {isAnswered && question.userAnswer && (
                    <Badge variant={question.userAnswer.isCorrect ? "default" : "destructive"}>
                      {question.userAnswer.isCorrect ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {question.userAnswer.isCorrect ? 'Pass' : 'Fail'}
                    </Badge>
                  )}
                  {!isAnswered && (
                    <Badge variant="secondary">Incomplete</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {question.label}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Answer Options */}
                <div className="grid gap-3">
                  {['a1', 'a2', 'a3', 'a4'].map((option) => {
                    const isSelected = userAnswer === option
                    const isCorrectAnswer = option === question.correctAnswer
                    const showCorrectAnswer = isAnswered
                    
                    return (
                      <button
                        key={option}
                        onClick={() => !isAnswered && handleAnswerSelect(questionIndex, option)}
                        disabled={isAnswered || isSubmitting}
                        className={`p-4 text-left border rounded-lg transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/50'
                        } ${
                          showCorrectAnswer
                            ? isCorrectAnswer
                              ? 'border-green-500 bg-green-500/10 text-green-400'
                              : isSelected && !question.userAnswer?.isCorrect
                              ? 'border-red-500 bg-red-500/10 text-red-400'
                              : 'opacity-50'
                            : ''
                        } ${isAnswered || isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground'
                          }`}>
                            {isSelected && <div className="w-2 h-2 bg-current rounded-full" />}
                          </div>
                          <span className="font-medium">{option.toUpperCase()}</span>
                          <span>{question[option as keyof PLQuestion] as string}</span>
                          {isSubmitting && isSelected && (
                            <div className="ml-auto">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Explanation */}
                {isAnswered && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Explanation
                    </h4>
                    <p className="text-sm mb-3">{question.explanation}</p>
                    <div className="p-3 bg-background rounded border">
                      <h5 className="font-medium mb-1">Formula:</h5>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {question.formula}
                      </code>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {/* Confirm Dialog Component */}
      <ConfirmDialogComponent />
      
      {/* Toast Alerts */}
      <ToastContainer />
    </div>
  )
}
