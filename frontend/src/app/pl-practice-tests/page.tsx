'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePLTestSets, usePLStats, useCreatePLTestSet, useDeleteAllTestSets, type PLTestSet } from '@/hooks/useSWRPL'
import { useAuth } from '@/contexts/AuthContextSWR'
import { useConfirmDialog } from '@/components/ConfirmDialog'
import { useToastAlerts, toast } from '@/components/ToastAlert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Calculator, BookOpen, Trophy, Clock, CheckCircle, Trash2, Search, Filter, SortAsc, SortDesc, Target, TrendingUp, Award, Calendar, XCircle } from 'lucide-react'

export default function PLPracticeTestsPage() {
  const { user } = useAuth()
  const { testSets, loading: testSetsLoading, error: testSetsError, mutate: mutateTestSets } = usePLTestSets()
  const { stats, loading: statsLoading } = usePLStats()
  const { createTestSet, isCreating } = useCreatePLTestSet()
  const { deleteAllTestSets } = useDeleteAllTestSets()
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog()
  const { addAlert, ToastContainer } = useToastAlerts()
  
  const [deleting, setDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'progress' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'incomplete' | 'passed' | 'failed'>('all')

  // Filter and sort test sets
  const filteredAndSortedTestSets = useMemo(() => {
    if (!testSets) return []

    let filtered = testSets.filter((testSet: PLTestSet) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const nameMatch = testSet.name?.toLowerCase().includes(searchLower)
        const descriptionMatch = testSet.description?.toLowerCase().includes(searchLower)
        if (!nameMatch && !descriptionMatch) return false
      }

      // Status filter
      if (filterStatus !== 'all') {
        const isCompleted = testSet.progress.percentage === 100
        const isPassed = isCompleted && testSet.progress.correct >= testSet.progress.total * 0.7
        const isFailed = isCompleted && testSet.progress.correct < testSet.progress.total * 0.7
        
        switch (filterStatus) {
          case 'completed':
            if (!isCompleted) return false
            break
          case 'incomplete':
            if (isCompleted) return false
            break
          case 'passed':
            if (!isPassed) return false
            break
          case 'failed':
            if (!isFailed) return false
            break
        }
      }

      return true
    })

    // Sort test sets
    filtered.sort((a: PLTestSet, b: PLTestSet) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'score':
          const scoreA = a.progress.answered > 0 ? (a.progress.correct / a.progress.answered) * 100 : 0
          const scoreB = b.progress.answered > 0 ? (b.progress.correct / b.progress.answered) * 100 : 0
          comparison = scoreA - scoreB
          break
        case 'progress':
          comparison = a.progress.percentage - b.progress.percentage
          break
        case 'status':
          const statusA = a.progress.percentage === 100 
            ? (a.progress.correct >= a.progress.total * 0.7 ? 'passed' : 'failed')
            : 'incomplete'
          const statusB = b.progress.percentage === 100 
            ? (b.progress.correct >= b.progress.total * 0.7 ? 'passed' : 'failed')
            : 'incomplete'
          comparison = statusA.localeCompare(statusB)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [testSets, searchTerm, sortBy, sortOrder, filterStatus])

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
      {/* Enhanced Header */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              P&L Practice Tests
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Master Profit & Loss calculations and financial metrics through interactive practice tests
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {user?.role === 'admin' && (
              <Button 
                onClick={handleDeleteAllTestSets} 
                disabled={deleting || filteredAndSortedTestSets.length === 0}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Deleting...' : 'Delete All'}
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

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search test sets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalTestSets}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Correct Answers</p>
                  <p className="text-3xl font-bold text-green-600">{stats.correctAnswers}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Incorrect Answers</p>
                  <p className="text-3xl font-bold text-red-600">{stats.incorrectAnswers}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Accuracy</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.percentage.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={stats.percentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Summary */}
      {searchTerm || filterStatus !== 'all' ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedTestSets.length} of {testSets?.length || 0} test sets
            {searchTerm && ` matching "${searchTerm}"`}
            {filterStatus !== 'all' && ` filtered by ${filterStatus}`}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('')
              setFilterStatus('all')
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : null}

      {/* Enhanced Test Sets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAndSortedTestSets.map((testSet: PLTestSet) => {
          const accuracy = testSet.progress.answered > 0 ? (testSet.progress.correct / testSet.progress.answered) * 100 : 0
          const isCompleted = testSet.progress.percentage === 100
          const isPassed = isCompleted && testSet.progress.correct >= testSet.progress.total * 0.7
          const isFailed = isCompleted && testSet.progress.correct < testSet.progress.total * 0.7
          
          return (
            <Link key={testSet.id} href={`/pl-practice-tests/${testSet.id}`}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full group border-2 hover:border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{testSet.name}</CardTitle>
                      <CardDescription className="mt-1 text-sm line-clamp-2">
                        {testSet.description}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={
                        isPassed ? "default" : 
                        isFailed ? "destructive" : 
                        "secondary"
                      }
                      className="ml-2 shrink-0"
                    >
                      {isPassed ? "Pass" : isFailed ? "Fail" : "Incomplete"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Progress Ring */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative w-12 h-12">
                          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-gray-200"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className={`${isPassed ? 'text-green-500' : isFailed ? 'text-red-500' : 'text-primary'}`}
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray={`${testSet.progress.percentage}, 100`}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-semibold">{testSet.progress.percentage}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Progress</p>
                          <p className="text-xs text-muted-foreground">{testSet.progress.answered}/{testSet.progress.total} questions</p>
                        </div>
                      </div>
                    </div>

                    {/* Accuracy Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Accuracy</span>
                        <span className="font-medium">{accuracy.toFixed(1)}%</span>
                      </div>
                      <Progress value={accuracy} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>{testSet.progress.correct} correct</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-600" />
                        <span>{testSet.progress.answered - testSet.progress.correct} incorrect</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(testSet.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isPassed && <Award className="h-3 w-3 text-yellow-500" />}
                        {isFailed && <XCircle className="h-3 w-3 text-red-500" />}
                        {!isCompleted && <Clock className="h-3 w-3 text-blue-500" />}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
        
        {/* Enhanced Create New Test Card */}
        {testSets.length > 0 && (
          <Card 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 group"
            onClick={handleCreateNewTest}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isCreating 
                    ? 'bg-primary/20 animate-pulse' 
                    : 'bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110'
                }`}>
                  <Plus className={`h-8 w-8 transition-all duration-200 ${
                    isCreating 
                      ? 'text-primary animate-spin' 
                      : 'text-primary group-hover:text-primary/80'
                  }`} />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-1 group-hover:text-primary transition-colors">
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

      {/* Enhanced Empty State */}
      {testSets.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-16 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">No Practice Tests Yet</h3>
                <p className="text-muted-foreground text-lg">
                  Start your P&L learning journey by creating your first practice test. 
                  Master financial calculations through interactive questions.
                </p>
              </div>
              <div className="space-y-4">
                <Button 
                  onClick={handleCreateNewTest} 
                  disabled={isCreating}
                  size="lg"
                  className="w-full"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {isCreating ? 'Creating Your First Test...' : 'Create Your First Test'}
                </Button>
                <div className="text-sm text-muted-foreground">
                  <p>✨ Each test includes randomized questions</p>
                  <p>📊 Track your progress and accuracy</p>
                  <p>🎯 Master P&L calculations step by step</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results State */}
      {testSets.length > 0 && filteredAndSortedTestSets.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <Search className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">No Tests Found</h3>
              <p className="text-muted-foreground">
                No test sets match your current search and filter criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
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
