"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartBarStackedProps {
  title?: string;
  description?: string;
  data: Array<{
    [key: string]: string | number;
  }>;
  config: ChartConfig;
  footerText?: string;
  footerSubtext?: string;
  dataKey?: string;
  showTrend?: boolean;
  trendText?: string;
}

export function ChartBarStacked({
  title = "Bar Chart - Stacked + Legend",
  description = "Data visualization",
  data,
  config,
  footerText = "Trending up by 5.2% this month",
  footerSubtext = "Showing data for the selected period",
  dataKey = "month",
  showTrend = true,
  trendText
}: ChartBarStackedProps) {
  const chartKeys = Object.keys(config);
  const firstKey = chartKeys[0];
  const secondKey = chartKeys[1];

  // Ensure we have at least two keys for stacked bars
  if (!firstKey || !secondKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Chart configuration requires at least two data series
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={dataKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                if (typeof value === 'string') {
                  return value.length > 10 ? value.slice(0, 10) + '...' : value;
                }
                return value.toString();
              }}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey={firstKey}
              stackId="a"
              fill={`var(--color-${firstKey})`}
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey={secondKey}
              stackId="a"
              fill={`var(--color-${secondKey})`}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {showTrend && (
          <div className="flex gap-2 leading-none font-medium">
            {trendText || footerText}
            <TrendingUp className="h-4 w-4" />
          </div>
        )}
        <div className="text-muted-foreground leading-none">
          {footerSubtext}
        </div>
      </CardFooter>
    </Card>
  )
}
