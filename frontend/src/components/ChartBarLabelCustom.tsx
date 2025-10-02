"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

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

export const description = "A bar chart showing net sales by store"

interface ChartBarLabelCustomProps {
  data: Array<{
    storeName: string;
    netSales: number;
    avgWeeklySales: number;
  }>;
}

const chartConfig = {
  netSales: {
    label: "Net Sales",
    color: "#2563eb",
  },
  avgWeeklySales: {
    label: "Avg Weekly Sales",
    color: "#16a34a",
  },
  label: {
    color: "#ffffff",
  },
} satisfies ChartConfig

export function ChartBarLabelCustom({ data }: ChartBarLabelCustomProps) {
  // Transform data to show net sales vs avg weekly sales
  const chartData = data.map(store => ({
    store: store.storeName,
    netSales: store.netSales,
    avgWeeklySales: store.avgWeeklySales,
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Sales Performance</CardTitle>
        <CardDescription>Net Sales vs Average Weekly Sales by Store</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="store"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 8)}
              hide
            />
            <XAxis dataKey="netSales" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="netSales"
              layout="vertical"
              fill="#2563eb"
              radius={4}
            >
              <LabelList
                dataKey="store"
                position="insideLeft"
                offset={8}
                fill="#ffffff"
                fontSize={12}
              />
              <LabelList
                dataKey="netSales"
                position="right"
                offset={8}
                fill="#000000"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Store sales performance comparison <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing net sales data for selected stores
        </div>
      </CardFooter>
    </Card>
  )
}
