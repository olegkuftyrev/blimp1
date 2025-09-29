"use client"

import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, PieChart as PieChartIcon } from "lucide-react"
import { Pie, PieChart, ResponsiveContainer } from "recharts"

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
import { Badge } from "@/components/ui/badge"

interface PLDashboardProps {
  data: {
    netSales: number;
    priorNetSales: number;
    sssPercentage: number;
    cogsPercentage: number;
    laborPercentage: number;
    controllableProfitPercentage: number;
    totalTransactions: number;
    priorTransactions: number;
    sstPercentage: number;
    checkAverage: number;
    priorCheckAverage: number;
    thirdPartyDigitalSales: number;
    pandaDigitalSales: number;
  };
}

export function PLDashboard({ data }: PLDashboardProps) {
  // Calculate derived values
  const netSalesChange = data.netSales - data.priorNetSales;
  const netSalesChangePercent = data.priorNetSales !== 0 ? (netSalesChange / data.priorNetSales) * 100 : 0;
  
  const transactionsChange = data.totalTransactions - data.priorTransactions;
  const transactionsChangePercent = data.priorTransactions !== 0 ? (transactionsChange / data.priorTransactions) * 100 : 0;
  
  const oloPercentage = data.netSales !== 0 ? ((data.thirdPartyDigitalSales + data.pandaDigitalSales) / data.netSales) * 100 : 0;
  
  // Calculate other percentage for pie chart
  const otherPercentage = 100 - data.laborPercentage - data.cogsPercentage - data.controllableProfitPercentage;

  // Pie chart data for cost breakdown
  const costBreakdownData = [
    { 
      category: "Labor", 
      percentage: data.laborPercentage, 
      fill: "#ef4444" // red
    },
    { 
      category: "COGS", 
      percentage: data.cogsPercentage, 
      fill: "#22c55e" // green
    },
    { 
      category: "CP", 
      percentage: data.controllableProfitPercentage, 
      fill: "#14b8a6" // teal
    },
    { 
      category: "Other", 
      percentage: otherPercentage, 
      fill: "#6b7280" // gray
    },
  ];

  const chartConfig = {
    percentage: {
      label: "Percentage",
    },
    Labor: {
      label: "Labor",
      color: "#ef4444",
    },
    COGS: {
      label: "COGS",
      color: "#22c55e",
    },
    CP: {
      label: "CP",
      color: "#14b8a6",
    },
    Other: {
      label: "Other",
      color: "#6b7280",
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground mt-1">Key metrics and insights for this period</p>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Net Sales Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-slate-300 leading-tight">
                Net<br />Sales
              </CardTitle>
            </div>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${data.sssPercentage >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {data.sssPercentage >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-400" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-400" />
              )}
              <span className={`text-xs font-medium ${data.sssPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.sssPercentage >= 0 ? '+' : ''}{data.sssPercentage.toFixed(1)}%
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-white">
              ${data.netSales.toLocaleString()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                {data.sssPercentage >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span>{data.sssPercentage >= 0 ? 'Strong sales growth' : 'Sales decline'}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                {data.sssPercentage >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span>{data.sssPercentage >= 0 ? 'Exceeding targets' : 'Below targets'}</span>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Transactions Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700 text-white">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-purple-300 leading-tight">
                Total<br />Transactions
              </CardTitle>
            </div>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${data.sstPercentage >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {data.sstPercentage >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-400" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-400" />
              )}
              <span className={`text-xs font-medium ${data.sstPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.sstPercentage >= 0 ? '+' : ''}{data.sstPercentage.toFixed(1)}%
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-white">
              {data.totalTransactions.toLocaleString()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-purple-300">
                {data.sstPercentage >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span>{data.sstPercentage >= 0 ? 'Customer engagement up' : 'Customer engagement down'}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-purple-300">
                {data.sstPercentage >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span>{data.sstPercentage >= 0 ? 'Visit frequency growing' : 'Visit frequency declining'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check Average Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-800 border-emerald-700 text-white">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-emerald-300 leading-tight">
                Check<br />Average
              </CardTitle>
            </div>
            {(() => {
              const checkAverageChange = data.checkAverage - data.priorCheckAverage;
              const isPositive = checkAverageChange >= 0;
              
              return (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{checkAverageChange.toFixed(2)}%
                  </span>
                </div>
              );
            })()}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-white">
              ${data.checkAverage.toFixed(2)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-emerald-300">
                {(data.checkAverage - data.priorCheckAverage) >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span>{(data.checkAverage - data.priorCheckAverage) >= 0 ? 'Digital sales growing' : 'Digital sales declining'}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-emerald-300">
                {(data.checkAverage - data.priorCheckAverage) >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span>{(data.checkAverage - data.priorCheckAverage) >= 0 ? 'Value per visit growing' : 'Value per visit declining'}</span>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Prime Cost Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 text-white">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-blue-300 leading-tight">
                Prime<br />Cost
              </CardTitle>
            </div>
            {(() => {
              const primeCost = data.cogsPercentage + data.laborPercentage;
              const difference = primeCost - 60;
              
              if (difference > 0) {
                // Превышение 60% - красный
                return (
                  <div className="flex items-center space-x-1 bg-red-500/20 px-2 py-1 rounded-full">
                    <PieChartIcon className="h-3 w-3 text-red-400" />
                    <span className="text-xs font-medium text-red-400">
                      +{difference.toFixed(1)}%
                    </span>
                  </div>
                );
              } else {
                // Ниже 60% - зеленый
                return (
                  <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded-full">
                    <PieChartIcon className="h-3 w-3 text-green-400" />
                    <span className="text-xs font-medium text-green-400">
                      {difference.toFixed(1)}%
                    </span>
                  </div>
                );
              }
            })()}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-white">
              {(data.cogsPercentage + data.laborPercentage).toFixed(1)}%
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-blue-300">
                <PieChartIcon className="h-3 w-3 text-orange-400" />
                <span>
                  COGS: <span className={data.cogsPercentage > 30 ? 'text-red-400' : 'text-green-400'}>{data.cogsPercentage.toFixed(1)}%</span>
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-blue-300">
                <PieChartIcon className="h-3 w-3 text-orange-400" />
                <span>
                  Labor: <span className={data.laborPercentage > 30 ? 'text-red-400' : 'text-green-400'}>{data.laborPercentage.toFixed(1)}%</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
