"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Activity } from "lucide-react"

// Mock data for the dashboard
const mockData = {
  totalRevenue: 45231.89,
  subscriptions: 2350,
  sales: 12234,
  activeNow: 573,
  revenueChange: 20.1,
  subscriptionsChange: 180.1,
  salesChange: 19.0,
  activeChange: -12.5
}

export function SectionCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card x-chunk="dashboard-01-chunk-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Revenue
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${mockData.totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            <span className="inline-flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              +{mockData.revenueChange}%
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-01-chunk-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Subscriptions
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{mockData.subscriptions}</div>
          <p className="text-xs text-muted-foreground">
            <span className="inline-flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              +{mockData.subscriptionsChange}%
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-01-chunk-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sales</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{mockData.sales.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            <span className="inline-flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              +{mockData.salesChange}%
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-01-chunk-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Now</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{mockData.activeNow}</div>
          <p className="text-xs text-muted-foreground">
            <span className="inline-flex items-center">
              <TrendingDown className="mr-1 h-3 w-3" />
              {mockData.activeChange}%
            </span>{" "}
            from last hour
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
