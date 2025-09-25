"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
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
    theme: {
      light: "hsl(220 70% 50%)", // Blue for light theme
      dark: "hsl(220 70% 60%)",  // Lighter blue for dark theme
    },
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
    <div className={className}>
      <div className="text-center pb-2 mb-2">
        <h3 className="text-lg font-semibold">Competency Assessment</h3>
        <p className="text-sm text-muted-foreground">
          Your performance across different competency areas
        </p>
      </div>
      <div className="pb-0 hidden md:block">
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full max-w-[860px] h-[420px] px-4 overflow-visible items-center justify-center"
        >
          <RadarChart 
            data={data} 
            margin={{ top: 16, right: 16, bottom: 16, left: 16 }} 
            outerRadius="60%"
            cx="50%"
            cy="50%"
          >
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="competency" tick={{ fontSize: 14 }} tickLine={false} />
            <PolarGrid />
            <Radar
              dataKey="score"
              fill="var(--color-score)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </div>
      <div className="flex-col gap-1.5 text-sm mt-2">
        <div className="flex items-center justify-center gap-2 leading-none font-medium">
          Average score: {averageScore} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center justify-center gap-2 leading-none">
          Total competencies assessed: {data.length}
        </div>
      </div>
    </div>
  );
}
