'use client';

import { useState, useEffect } from 'react';
import { Target, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContextSWR';
import { IDPAPI, IDPAssessment, IDPRole } from '@/lib/api';
import { IDPDevelopmentPlanTable } from '@/components/idp/IDPDevelopmentPlanTable';
import Link from 'next/link';

interface IDPData {
  assessment: IDPAssessment | null;
  role: IDPRole | null;
  competencyScores: any[];
  answers: { [questionId: number]: 'yes' | 'no' };
  loading: boolean;
  error: string | null;
}

export default function IDPDevelopmentPlan() {
  const { user } = useAuth();
  const [data, setData] = useState<IDPData>({
    assessment: null,
    role: null,
    competencyScores: [],
    answers: {},
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    loadIDPData();
  }, [user]);

  const loadIDPData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      // Get current user's role
      const roleResponse = await IDPAPI.getCurrentUserRole();
      if (!roleResponse.data) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Role not found'
        }));
        return;
      }

      const role = roleResponse.data;
      const competencies = role.competencies || [];
      
      // Get current assessment
      const assessmentResponse = await IDPAPI.getCurrentAssessment();
      const assessment = assessmentResponse.data;
      
      if (!assessment) {
        setData(prev => ({
          ...prev,
          loading: false,
          assessment: null,
          role,
          competencyScores: [],
          answers: {}
        }));
        return;
      }

      // Convert answers to map
      const answersMap: { [questionId: number]: 'yes' | 'no' } = {};
      if (assessment.answers) {
        assessment.answers.forEach(answer => {
          answersMap[answer.questionId] = answer.answer;
        });
      }

      // Calculate competency scores
      const competencyScores = competencies.map(comp => {
        const score = comp.questions?.reduce((total, question) => {
          return answersMap[question.id] === 'yes' ? total + 1 : total;
        }, 0) || 0;
        
        return {
          ...comp,
          score,
          questions: comp.questions || [],
          actions: comp.actions || []
        };
      });

      setData(prev => ({
        ...prev,
        loading: false,
        assessment,
        role,
        competencyScores,
        answers: answersMap
      }));
      
    } catch (err: any) {
      console.error('Error loading IDP data:', err);
      if (err.message?.includes('Role not found')) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Role not found'
        }));
        return;
      }
      
      setData(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to load IDP data'
      }));
    }
  };


  if (data.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading IDP data...</p>
        </div>
      </div>
    );
  }

  if (data.error?.includes('Role not found')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Individual Development Plan
          </CardTitle>
          <CardDescription>Development objectives based on your assessment results</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">IDP Not Available</p>
          <p className="text-muted-foreground">
            IDP assessment is not available for your current role.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (data.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">{data.error}</p>
          <Button onClick={loadIDPData}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (!data.assessment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Individual Development Plan
          </CardTitle>
          <CardDescription>Development objectives based on your assessment results</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">No Assessment Started</p>
          <p className="text-muted-foreground mb-6">
            Start your Individual Development Plan assessment to create your development objectives.
          </p>
          <Button asChild>
            <Link href="/idp">
              <Play className="h-4 w-4 mr-2" />
              Start IDP Assessment
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (data.assessment.status !== 'completed') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Individual Development Plan
          </CardTitle>
          <CardDescription>Development objectives based on your assessment results</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Assessment In Progress</p>
          <p className="text-muted-foreground mb-6">
            Complete your assessment to generate your development plan.
          </p>
          <Button asChild>
            <Link href="/idp/questions">
              <Play className="h-4 w-4 mr-2" />
              Continue Assessment
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Use the reusable table component
  return (
    <IDPDevelopmentPlanTable 
      competencyScores={data.competencyScores}
      answers={data.answers}
    />
  );
}
