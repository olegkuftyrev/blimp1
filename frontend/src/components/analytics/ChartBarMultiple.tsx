'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  actual: { label: "Actual", color: "#2563eb" }, // синий
  priorYear: { label: "Prior Year", color: "#0ea5e9" }, // голубой
} satisfies ChartConfig;

interface ChartBarMultipleProps {
  costOfSalesData: {
    data: Array<{
      category: string;
      actual: number;
      priorYear: number;
    }>;
    totalActual: number;
    totalPriorYear: number;
    cogsActualPercentage: number;
    cogsPriorYearPercentage: number;
  };
}

export function ChartBarMultiple({ costOfSalesData }: ChartBarMultipleProps) {
  const { data: chartData, totalActual, totalPriorYear, cogsActualPercentage, cogsPriorYearPercentage } = costOfSalesData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost of Sales Comparison</CardTitle>
        <CardDescription>Actual vs Prior Year</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="category" 
              tickLine={false} 
              tickMargin={10} 
              axisLine={false}
              tickFormatter={(v) => String(v).slice(0, 8)} 
            />
            <YAxis />
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent indicator="dashed" />} 
            />
            <Bar dataKey="priorYear" fill="var(--color-priorYear)" radius={4} />
            <Bar dataKey="actual" fill="var(--color-actual)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
           COGS% actual {cogsActualPercentage.toFixed(1)}% vs COGS% prior year {cogsPriorYearPercentage.toFixed(1)}%
        </div>
        <div className="text-muted-foreground leading-none">
        COGS$ actual ${totalActual.toLocaleString()} vs COGS prior year ${totalPriorYear.toLocaleString()}
        </div>
      </CardFooter>
    </Card>
  );
}
