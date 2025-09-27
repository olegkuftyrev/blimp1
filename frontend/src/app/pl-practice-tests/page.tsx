'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePLTestSets, usePLStats, useCreatePLTestSet, useDeleteAllTestSets, type PLTestSet } from '@/hooks/useSWRPL'
import { useAuth } from '@/contexts/AuthContextSWR'
import { useConfirmDialog } from '@/components/ConfirmDialog'
import { useToastAlerts, toast } from '@/components/ToastAlert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, Calculator, BookOpen, Trophy, Clock, CheckCircle, Trash2 } from 'lucide-react'

export default function PLPracticeTestsPage() {
  const { user } = useAuth()
  const { testSets, isLoading: testSetsLoading, error: testSetsError, mutate: mutateTestSets } = usePLTestSets()
  const { stats, isLoading: statsLoading } = usePLStats()
  const { createTestSet, isCreating } = useCreatePLTestSet()
  const { deleteAllTestSets } = useDeleteAllTestSets()
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog()
  const { addAlert, ToastContainer } = useToastAlerts()
  
  const [deleting, setDeleting] = useState(false)

  const handleCreateNewTest = async () => {
    // Prevent double clicks
    if (isCreating) {
      console.log('Preventing duplicate test set creation')
      return
    }
    
    try {
      console.log('Creating new test set...')
      const result = await createTestSet()
      console.log('Test set created successfully:', result)
      
      addAlert(toast.success('Test Set Created!', 'New practice test has been created successfully.'))
    } catch (error) {
      console.error('Failed to create test set:', error)
      addAlert(toast.error('Failed to Create Test Set', error instanceof Error ? error.message : 'Unknown error occurred'))
    }
  }

  const handleDeleteAllTestSets = async () => {
    if (!user || user.role !== 'admin') {
      return
    }

    showConfirm({
      title: 'Delete All Test Sets',
      description: 'Are you sure you want to delete ALL test sets? This action cannot be undone and will remove all test sets and answers for all users.',
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        setDeleting(true)
        try {
          await deleteAllTestSets()
          addAlert(toast.success('Test Sets Deleted!', 'All test sets have been deleted successfully.'))
        } catch (error) {
          console.error('Failed to delete test sets:', error)
          addAlert(toast.error('Failed to Delete Test Sets', error instanceof Error ? error.message : 'Unknown error occurred'))
        } finally {
          setDeleting(false)
        }
      },
    })
  }

  if (testSetsLoading || statsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading P&L Practice Tests...</p>
          </div>
        </div>
      </div>
    )
  }

  if (testSetsError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <BookOpen className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Tests</h3>
              <p>Failed to load P&L practice tests. Please try again later.</p>
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            P&L Practice Tests
          </h1>
          <p className="text-muted-foreground mt-2">
            Test your knowledge of Profit & Loss calculations and financial metrics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <Button 
              onClick={handleDeleteAllTestSets} 
              disabled={deleting}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Deleting...' : 'Delete All Test Sets'}
            </Button>
          )}
          
          <Button 
            onClick={handleCreateNewTest} 
            disabled={isCreating}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {isCreating ? 'Creating...' : 'Create New Test'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalTestSets}</div>
                <div className="text-sm text-muted-foreground">Test Sets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.incorrectAnswers}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalAnswered}</div>
                <div className="text-sm text-muted-foreground">Answered</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Accuracy</span>
                <span>{stats.percentage.toFixed(1)}%</span>
              </div>
              <Progress value={stats.percentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Sets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {testSets.map((testSet: PLTestSet) => (
          <Link key={testSet.id} href={`/pl-practice-tests/${testSet.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{testSet.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {testSet.description}
                    </CardDescription>
                  </div>
                  <Badge variant={
                    testSet.progress.percentage === 100 
                      ? testSet.progress.correct >= testSet.progress.total * 0.7 
                        ? "default" 
                        : "destructive"
                      : "secondary"
                  }>
                    {testSet.progress.percentage === 100 
                      ? testSet.progress.correct >= testSet.progress.total * 0.7 
                        ? "Pass" 
                        : "Fail"
                      : "Incomplete"
                    }
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="min-h-[200px] flex flex-col">
                <div className="space-y-4 flex-1">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Accuracy</span>
                      <span>{testSet.progress.correct}/{testSet.progress.answered} correct</span>
                    </div>
                    <Progress 
                      value={testSet.progress.answered > 0 ? (testSet.progress.correct / testSet.progress.answered) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>{testSet.progress.answered} answered</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{testSet.progress.total - testSet.progress.answered} remaining</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between pt-2 mt-auto">
                    <Badge variant={
                      testSet.progress.percentage === 100 
                        ? testSet.progress.correct >= testSet.progress.total * 0.7 
                          ? "default" 
                          : "destructive"
                        : "secondary"
                    }>
                      {testSet.progress.percentage === 100 
                        ? testSet.progress.correct >= testSet.progress.total * 0.7 
                          ? "Pass" 
                          : "Fail"
                        : "Incomplete"
                      }
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(testSet.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        
        {/* Create New Test Card - Only show if there are existing tests */}
        {testSets.length > 0 && (
          <Card 
            className="hover:shadow-lg transition-all cursor-pointer h-full border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
            onClick={handleCreateNewTest}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isCreating 
                    ? 'bg-primary/20 animate-pulse' 
                    : 'bg-primary/10 hover:bg-primary/20'
                }`}>
                  <Plus className={`h-8 w-8 transition-all ${
                    isCreating 
                      ? 'text-primary animate-spin' 
                      : 'text-primary'
                  }`} />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-1">
                    {isCreating ? 'Creating...' : 'Create New Test'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Generate a new practice test with random questions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty State */}
      {testSets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Practice Tests Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first P&L practice test to get started with financial calculations.
            </p>
            <Button onClick={handleCreateNewTest} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create Your First Test'}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Confirm Dialog Component */}
      <ConfirmDialogComponent />
      
      {/* Toast Alerts */}
      <ToastContainer />
    </div>
  )
}
