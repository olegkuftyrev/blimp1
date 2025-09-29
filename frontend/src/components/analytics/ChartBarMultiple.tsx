'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PLLineItem } from '@/hooks/useSWRPL';

const chartConfig = {
  actual: { label: "Actual", color: "#2563eb" }, // синий
  priorYear: { label: "Prior Year", color: "#0ea5e9" }, // голубой
} satisfies ChartConfig;

interface ChartBarMultipleProps {
  plLineItems: PLLineItem[];
}

export function ChartBarMultiple({ plLineItems }: ChartBarMultipleProps) {
  // Фильтруем данные Cost of Sales из реальных данных
  const costOfSalesItems = plLineItems.filter((item: PLLineItem) => 
    item.ledgerAccount === 'Grocery' || 
    item.ledgerAccount === 'Meat' || 
    item.ledgerAccount === 'Produce' || 
    item.ledgerAccount === 'Sea Food' ||
    item.ledgerAccount === 'DRinks' ||
    item.ledgerAccount === 'Paper Goods' ||
    item.ledgerAccount === 'Other'
  );

  // Преобразуем данные для графика
  const chartData = costOfSalesItems.map(item => ({
    category: item.ledgerAccount,
    actual: parseFloat(item.actuals?.toString() || '0'),
    priorYear: parseFloat(item.priorYear?.toString() || '0')
  }));

  // Вычисляем общие суммы для footer
  const totalActual = chartData.reduce((sum, item) => sum + item.actual, 0);
  const totalPriorYear = chartData.reduce((sum, item) => sum + item.priorYear, 0);

  // Находим элемент "Cost of Goods Sold" для получения процентов
  const cogsItem = plLineItems.find(item => item.ledgerAccount === 'Cost of Goods Sold');
  const cogsActualPercentage = cogsItem ? parseFloat(cogsItem.actualsPercentage?.toString() || '0') * 100 : 0;
  const cogsPriorYearPercentage = cogsItem ? parseFloat(cogsItem.priorYearPercentage?.toString() || '0') * 100 : 0;

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
