"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"

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

export const description = "A bar chart showing Prime Cost performance with 60% baseline"

interface ChartBarNegativeProps {
  data: Array<{
    storeName: string;
    primeCostPercentage: number;
  }>;
}

const chartConfig = {
  primeCost: {
    label: "Prime Cost vs 60%",
    color: "#2563eb",
  },
} satisfies ChartConfig

export function ChartBarNegative({ data }: ChartBarNegativeProps) {
  // Transform real data to show variance from 60% baseline
  const chartData = data.map(store => ({
    store: store.storeName,
    primeCost: store.primeCostPercentage - 60, // Convert to variance from 60% baseline
    actualPrimeCost: store.primeCostPercentage // Keep original value for tooltip
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prime Cost Performance</CardTitle>
        <CardDescription>Prime Cost vs 60% Target (Below 60% = Good, Above 60% = Needs Attention)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="store" 
              tickLine={false} 
              tickMargin={10} 
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                hideLabel 
                hideIndicator 
                formatter={(value, name, props) => [
                  `${props.payload.actualPrimeCost.toFixed(1)}%`,
                  'Prime Cost'
                ]}
              />}
            />
            <Bar dataKey="primeCost">
              <LabelList position="top" dataKey="store" fillOpacity={1} />
              {chartData.map((item) => (
                <Cell
                  key={item.store}
                  fill={item.primeCost < 0 ? "#16a34a" : "#dc2626"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Green bars: Prime Cost below 60% (Good Performance) <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Red bars: Prime Cost above 60% (Needs Attention) - Zero line represents 60% target
        </div>
      </CardFooter>
    </Card>
  )
}
