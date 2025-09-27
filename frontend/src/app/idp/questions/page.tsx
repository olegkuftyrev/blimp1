'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  Lock,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextSWR';
import { useIDPAssessment, useCompetencies, useSaveAnswers, useCompleteAssessment, IDPUtils } from '@/hooks/useSWRIDP';
import ProtectedRoute from '@/components/ProtectedRoute';

function QuestionsPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    assessment, 
    answers, 
    loading: assessmentLoading, 
    error: assessmentError,
    mutate: mutateAssessment
  } = useIDPAssessment();
  const { competencies, loading: competenciesLoading, error: competenciesError, mutate: mutateCompetencies } = useCompetencies(user?.role);
  const { saveAnswers, isSaving } = useSaveAnswers();
  const { completeAssessment, isCompleting } = useCompleteAssessment();

  const loading = assessmentLoading || competenciesLoading;
  const error = assessmentError || competenciesError;

  // Revalidate competencies when role becomes available (handles reseed/cache)
  useEffect(() => {
    if (user?.role) {
      mutateCompetencies();
    }
  }, [user?.role, mutateCompetencies]);

  // Calculate progress
  const overallProgress = IDPUtils.getOverallProgress(competencies, answers);
  const totalQuestions = competencies.reduce((sum: any, comp: any) => sum + (comp.questions?.length || 0), 0);
  const answeredQuestions = Object.keys(answers).length;

  // Check if competency is complete
  const isCompetencyComplete = (competency: any) => 
    IDPUtils.isCompetencyComplete(competency, answers);

  // Handle answer selection
  const handleAnswer = async (competencyId: number, questionId: number, answer: 'yes' | 'no') => {
    try {
      await saveAnswers({ answers: { [questionId]: answer } });
      // Invalidate assessment cache to get updated answers
      await mutateAssessment();
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  // Smart test data - fills 3 random competencies with some "No" answers, rest "Yes"
  const handleSmartTest = async () => {
    try {
      console.log('🎯 Starting Smart Test Data generation...');
      console.log('📊 Total competencies:', competencies.length);
      
      const smartAnswers: { [questionId: number]: 'yes' | 'no' } = {};
      
      // First, set all answers to "yes"
      competencies.forEach((comp: any) => {
        comp.questions?.forEach((q: any) => {
          smartAnswers[q.id] = "yes";
        });
      });
      
      console.log('✅ Set all answers to "yes", total questions:', Object.keys(smartAnswers).length);
      
      // Randomly select 3 competencies to have development needs
      const competencyIds = competencies.map((comp: any) => comp.id);
      const competenciesToChange: number[] = [];
      
      // Randomly select 3 unique competencies
      while (competenciesToChange.length < 3 && competenciesToChange.length < competencyIds.length) {
        const randomIndex = Math.floor(Math.random() * competencyIds.length);
        const randomCompId = competencyIds[randomIndex];
        if (!competenciesToChange.includes(randomCompId)) {
          competenciesToChange.push(randomCompId);
        }
      }
      
      console.log('🎲 Selected competencies to change:', competenciesToChange);
      
      // For each selected competency, change at least 3 questions to "no"
      competenciesToChange.forEach(compId => {
        const comp = competencies.find((c: any) => c.id === compId);
        if (comp && comp.questions && comp.questions.length >= 3) {
          // Randomly select at least 3 questions to change to "no"
          const questionIndices: number[] = [];
          const numQuestionsToChange = Math.min(3, comp.questions.length);
          
          while (questionIndices.length < numQuestionsToChange) {
            const randomIndex = Math.floor(Math.random() * comp.questions.length);
            if (!questionIndices.includes(randomIndex)) {
              questionIndices.push(randomIndex);
            }
          }
          
          // Change selected questions to "no"
          questionIndices.forEach(qIndex => {
            const question = comp.questions![qIndex];
            smartAnswers[question.id] = "no";
          });
          
          console.log(`📝 Changed ${numQuestionsToChange} questions to "no" in competency: ${comp.label}`);
        }
      });
      
      const noAnswers = Object.values(smartAnswers).filter(answer => answer === 'no').length;
      const yesAnswers = Object.values(smartAnswers).filter(answer => answer === 'yes').length;
      console.log(`📊 Final answers: ${yesAnswers} "yes", ${noAnswers} "no"`);
      
      // Save all answers at once using the new SWR mutation
      console.log('💾 Saving answers...');
      await saveAnswers({ answers: smartAnswers });
      console.log('✅ Answers saved successfully');
      
      // Invalidate assessment cache to get updated answers
      await mutateAssessment();
      console.log('🔄 Assessment cache invalidated');
      
    } catch (error) {
      console.error('❌ Failed to apply smart test data:', error);
    }
  };

  // Handle completion
  const handleComplete = async () => {
    try {
      await completeAssessment();
      // Invalidate assessment cache to get updated status and scores
      await mutateAssessment();
      router.push('/idp'); // Return to main IDP page where results are displayed
    } catch (error) {
      console.error('Failed to complete assessment:', error);
    }
  };

  // Check if all competencies are complete
  const allCompetenciesComplete = competencies.every(isCompetencyComplete);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access the assessment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Competency Assessment</h1>
        <p className="text-muted-foreground">
          Answer questions honestly to get accurate development recommendations
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{(error as Error)?.message || 'Unexpected error'}</p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => { mutateAssessment(); mutateCompetencies(); }} variant="outline">
                  Try again
                </Button>
                <Button onClick={() => router.push('/idp')} variant="outline">
                  Back to IDP Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Empty state when no competencies */}
          {competencies.length === 0 && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No competencies found for your role.</p>
                  {user?.role && (
                    <p className="text-sm text-muted-foreground">Role: {user.role}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Overall Progress */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Overall Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    {answeredQuestions} of {totalQuestions} questions answered
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>
              
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                <div 
                  className="h-full transition-all duration-300 ease-in-out bg-blue-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              
              {/* Smart Test Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSmartTest}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  🎯 Smart Test Data (3 No, Rest Yes)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Competencies */}
          <div className="space-y-6">
            {competencies.map((competency: any, index: any) => {
              const prevCompleted = index === 0 || isCompetencyComplete(competencies[index - 1]);
              const isDisabled = !prevCompleted;
              const progress = IDPUtils.getCompetencyProgress(competency, answers);
              const isComplete = isCompetencyComplete(competency);
              const score = IDPUtils.calculateCompetencyScore(competency, answers);
              
              // Color logic based on score (number of "Yes" answers)
              const getCardColor = () => {
                if (isDisabled) return 'opacity-60';
                if (!isComplete) return 'shadow-md';
                
                if (score === 5) return 'border-green-200 bg-green-50/30';      // 5 Yes = Green
                if (score >= 3) return 'border-blue-200 bg-blue-50/30';        // 3-4 Yes = Blue  
                if (score === 2) return 'border-yellow-200 bg-yellow-50/30';   // 2 Yes = Yellow
                return 'border-red-200 bg-red-50/30';                          // 0-1 Yes = Red
              };

              return (
                <Card 
                  key={competency.id} 
                  className={`transition-all duration-200 ${getCardColor()}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isDisabled ? (
                          <Lock className="h-5 w-5 text-gray-400" />
                        ) : !isComplete ? (
                          <Target className="h-5 w-5 text-primary" />
                        ) : score === 5 ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />    // 5 Yes = Green
                        ) : score >= 3 ? (
                          <CheckCircle className="h-5 w-5 text-blue-600" />     // 3-4 Yes = Blue
                        ) : score === 2 ? (
                          <CheckCircle className="h-5 w-5 text-yellow-600" />   // 2 Yes = Yellow
                        ) : (
                          <CheckCircle className="h-5 w-5 text-red-600" />      // 0-1 Yes = Red
                        )}
                        <div>
                          <CardTitle className="text-lg">{competency.label}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {competency.questions?.length || 0} questions
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right min-w-[120px]">
                        <div className="text-sm text-muted-foreground mb-1">Progress</div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-2 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div 
                              className="h-full transition-all duration-300 ease-in-out bg-blue-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{Math.round(progress)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Competency Description */}
                    {!isDisabled && competency.descriptions && competency.descriptions.length > 0 && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                        {competency.descriptions
                          .filter((desc: any) => desc.type === 'overview')
                          .map((desc: any) => (
                            <p key={desc.id} className="text-sm text-muted-foreground">
                              {desc.content}
                            </p>
                          ))}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent>
                    {isDisabled ? (
                      <div className="text-center py-8">
                        <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 italic">
                          Please complete the previous competency to view these questions.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {competency.questions?.map((question: any, qIndex: any) => {
                          const currentAnswer = answers[question.id];
                          
                          return (
                            <div 
                              key={question.id} 
                              className="p-4 bg-card rounded-lg border hover:shadow-sm transition-all"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <p className="text-sm font-medium mb-3">
                                    {question.question}
                                  </p>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant={currentAnswer === 'yes' ? 'default' : 'outline'}
                                    className="min-w-[60px]"
                                    onClick={() => handleAnswer(competency.id, question.id, 'yes')}
                                  >
                                    Yes
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={currentAnswer === 'no' ? 'default' : 'outline'}
                                    className="min-w-[60px]"
                                    onClick={() => handleAnswer(competency.id, question.id, 'no')}
                                  >
                                    No
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {assessment?.status === 'completed' ? (
              <Button
                variant="outline"
                onClick={() => router.push('/idp')}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Results
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => router.push('/idp')}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to IDP Home
              </Button>
            )}

            {allCompetenciesComplete && assessment?.status !== 'completed' && (
              <Button
                onClick={handleComplete}
                className="flex items-center gap-2"
              >
                Complete Assessment
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <ProtectedRoute>
      <QuestionsPageContent />
    </ProtectedRoute>
  );
}
