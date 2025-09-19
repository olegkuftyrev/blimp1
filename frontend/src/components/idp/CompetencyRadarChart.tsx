"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface CompetencyData {
  competency: string;
  score: number;
}

interface CompetencyRadarChartProps {
  competencies: Array<{
    label: string;
    questions?: any[];
  }>;
  answers: { [questionId: number]: 'yes' | 'no' };
  className?: string;
}

const chartConfig = {
  score: {
    label: "Score",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function CompetencyRadarChart({ 
  competencies, 
  answers, 
  className = '' 
}: CompetencyRadarChartProps) {
  // Calculate scores for each competency
  const data: CompetencyData[] = competencies.map(comp => {
    const score = comp.questions?.reduce((total, question) => {
      return answers[question.id] === 'yes' ? total + 1 : total;
    }, 0) || 0;

    return {
      competency: comp.label,
      score,
    };
  });

  // Don't render if no data
  if (data.length === 0) {
    return null;
  }

  const totalScore = data.reduce((sum, item) => sum + item.score, 0);
  const maxPossibleScore = data.length * Math.max(...data.map(d => d.score), 1);
  const averageScore = data.length > 0 ? (totalScore / data.length).toFixed(1) : 0;

  return (
    <Card className={className}>
      <CardHeader className="items-center pb-4">
        <CardTitle>Competency Assessment</CardTitle>
        <CardDescription>
          Your performance across different competency areas
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={data}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="competency" />
            <PolarGrid />
            <Radar
              dataKey="score"
              fill="var(--color-score)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Average score: {averageScore} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          Total competencies assessed: {data.length}
        </div>
      </CardFooter>
    </Card>
  );
}
