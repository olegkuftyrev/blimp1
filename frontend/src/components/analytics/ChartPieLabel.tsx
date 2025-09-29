'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";
import { TrendingUp } from "lucide-react";

const pieChartConfig = {
  amount: {
    label: "Amount",
  },
  labor: {
    label: "Labor %",
    color: "#8b5cf6", // violet
  },
  cogs: {
    label: "COGS %",
    color: "#2563eb", // синий
  },
  cp: {
    label: "CP %",
    color: "#14b8a6", // teal
  },
  other: {
    label: "Other",
    color: "#78716c", // stone
  },
} satisfies ChartConfig;

interface ChartPieLabelProps {
  pieChartData: {
    data: Array<{
      category: string;
      amount: number;
      percentage: number;
      fill: string;
    }>;
    netSales: number;
  };
}

export function ChartPieLabel({ pieChartData }: ChartPieLabelProps) {
  const { data: chartData, netSales } = pieChartData;

  // Debug logging
  console.log('ChartPieLabel - pieChartData:', pieChartData);
  console.log('ChartPieLabel - chartData:', chartData);
  console.log('ChartPieLabel - netSales:', netSales);

  // Check if we have valid data
  if (!chartData || chartData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Net Sales Breakdown</CardTitle>
          <CardDescription>Actual percentages from Net Sales</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Net Sales Breakdown</CardTitle>
        <CardDescription>Actual percentages from Net Sales</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={pieChartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip 
              content={<ChartTooltipContent hideLabel />} 
              formatter={(value, name, props) => [
                `${props.payload.percentage.toFixed(1)}%`,
                props.payload.category
              ]}
            />
            <Pie 
              data={chartData} 
              dataKey="amount" 
              label={(entry) => `${entry.category} ${entry.percentage.toFixed(1)}%`}
              nameKey="category" 
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Net Sales: ${netSales.toLocaleString()} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Breakdown of Net Sales by category percentages
        </div>
      </CardFooter>
    </Card>
  );
}
