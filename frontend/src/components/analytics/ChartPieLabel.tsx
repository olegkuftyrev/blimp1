'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";
import { TrendingUp } from "lucide-react";
import { PLLineItem } from '@/hooks/useSWRPL';

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
  plLineItems: PLLineItem[];
}

export function ChartPieLabel({ plLineItems }: ChartPieLabelProps) {
  // Получаем Net Sales
  const netSalesItem = plLineItems.find(item => item.ledgerAccount === 'Net Sales');
  const netSales = netSalesItem ? parseFloat(netSalesItem.actuals?.toString() || '0') : 0;

  // Получаем Labor %
  const laborItem = plLineItems.find(item => item.ledgerAccount === 'Total Labor');
  const laborPercentage = laborItem ? parseFloat(laborItem.actualsPercentage?.toString() || '0') * 100 : 0;

  // Получаем COGS %
  const cogsItem = plLineItems.find(item => item.ledgerAccount === 'Cost of Goods Sold');
  const cogsPercentage = cogsItem ? parseFloat(cogsItem.actualsPercentage?.toString() || '0') * 100 : 0;

  // Получаем CP % (Controllable Profit)
  const cpItem = plLineItems.find(item => item.ledgerAccount === 'Controllable Profit');
  const cpPercentage = cpItem ? parseFloat(cpItem.actualsPercentage?.toString() || '0') * 100 : 0;

  // Вычисляем Other (остаток)
  const otherPercentage = Math.max(0, 100 - laborPercentage - cogsPercentage - cpPercentage);

  // Создаем данные для pie chart
  const pieChartData = [
    { 
      category: "Labor %", 
      amount: (netSales * laborPercentage / 100), 
      percentage: laborPercentage,
      fill: "var(--color-labor)" 
    },
    { 
      category: "COGS %", 
      amount: (netSales * cogsPercentage / 100), 
      percentage: cogsPercentage,
      fill: "var(--color-cogs)" 
    },
    { 
      category: "CP %", 
      amount: (netSales * cpPercentage / 100), 
      percentage: cpPercentage,
      fill: "var(--color-cp)" 
    },
    { 
      category: "Other", 
      amount: (netSales * otherPercentage / 100), 
      percentage: otherPercentage,
      fill: "var(--color-other)" 
    },
  ].filter(item => item.percentage > 0); // Убираем элементы с 0%

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
              data={pieChartData} 
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
