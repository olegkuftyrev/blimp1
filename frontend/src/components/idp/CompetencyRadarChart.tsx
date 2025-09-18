"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
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
    color: "hsl(var(--chart-1))",
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

  return (
    <div className={className}>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-w-sm w-full"
      >
        <RadarChart data={data}>
          <PolarGrid 
            stroke="hsl(var(--border))" 
            strokeWidth={1}
            opacity={0.3}
          />
          <PolarAngleAxis 
            dataKey="competency"
            tick={{ 
              fontSize: 12, 
              fill: 'hsl(var(--foreground))',
              textAnchor: 'middle',
              fontWeight: 500
            }}
          />
          <Radar
            dataKey="score"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}
