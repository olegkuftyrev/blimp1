'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Using button-based navigation instead of tabs component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DatePicker } from "@/components/ui/date-picker"; // TODO: Implement when needed
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Download,
  Calendar,
  Building2,
  PieChart,
  AlertCircle,
  Loader2
} from "lucide-react";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContextSWR';
import apiClient from '@/lib/axios';

interface AreaPlData {
  summary: {
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    profitMargin: number;
  };
  monthlyData: Array<{
    month: string;
    revenue: number;
    costs: number;
    profit: number;
  }>;
  categoryBreakdown: {
    foodCosts: number;
    laborCosts: number;
    operatingExpenses: number;
    other: number;
  };
  trends: {
    revenueGrowth: number;
    costReduction: number;
    profitImprovement: number;
  };
  restaurants: Array<{
    id: number;
    name: string;
    revenue: number;
    costs: number;
    profit: number;
  }>;
}

function AreaPlContent() {
  const { user } = useAuth();
  const [data, setData] = useState<AreaPlData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedRestaurants, setSelectedRestaurants] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAreaPlData();
  }, [selectedPeriod, selectedRestaurants]);

  const fetchAreaPlData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/area-pl');
      setData(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch Area P&L data:', err);
      setError(err.response?.data?.message || 'Failed to fetch Area P&L data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format: string) => {
    try {
      const response = await apiClient.post('/area-pl/export', {
        format,
        startDate: null, // TODO: Use actual date range
        endDate: null,
        restaurantIds: selectedRestaurants === 'all' ? null : [selectedRestaurants]
      });
      
      if (response.data.success) {
        // TODO: Handle download URL when implemented
        alert(`Export in ${format} format initiated. Download will be available shortly.`);
      }
    } catch (err: any) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading Area P&L data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-destructive mb-4">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Error</span>
                </div>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchAreaPlData} className="w-full">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Area P&L Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Comprehensive profit and loss analysis for your area
              </p>
              <Badge variant="secondary" className="mt-2">
                Restricted Access - Admin Only
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="current-quarter">Current Quarter</SelectItem>
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedRestaurants} onValueChange={setSelectedRestaurants}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select restaurants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Restaurants</SelectItem>
                  {data?.restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data?.summary.totalRevenue || 0)}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-green-600">{formatPercentage(data?.trends.revenueGrowth || 0)}</span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data?.summary.totalCosts || 0)}</div>
              <div className="flex items-center text-sm">
                <TrendingDown className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-green-600">{formatPercentage(data?.trends.costReduction || 0)}</span>
                <span className="text-muted-foreground ml-1">reduction</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data?.summary.netProfit || 0)}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-green-600">{formatPercentage(data?.trends.profitImprovement || 0)}</span>
                <span className="text-muted-foreground ml-1">improvement</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(data?.summary.profitMargin || 0).toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">
                Industry avg: 3-5%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Navigation */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant={activeTab === 'overview' ? 'default' : 'outline'}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </Button>
              <Button 
                variant={activeTab === 'breakdown' ? 'default' : 'outline'}
                onClick={() => setActiveTab('breakdown')}
              >
                Cost Breakdown
              </Button>
              <Button 
                variant={activeTab === 'restaurants' ? 'default' : 'outline'}
                onClick={() => setActiveTab('restaurants')}
              >
                Restaurant Performance
              </Button>
              <Button 
                variant={activeTab === 'trends' ? 'default' : 'outline'}
                onClick={() => setActiveTab('trends')}
              >
                Trends & Analysis
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleExportData('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportData('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportData('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue vs Costs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Chart visualization coming soon</p>
                      <p className="text-sm">Revenue and cost trends over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profit Margin Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Chart visualization coming soon</p>
                      <p className="text-sm">Profit margin analysis over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'breakdown' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Food Costs</span>
                      <span className="font-semibold">{formatCurrency(data?.categoryBreakdown.foodCosts || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Labor Costs</span>
                      <span className="font-semibold">{formatCurrency(data?.categoryBreakdown.laborCosts || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Operating Expenses</span>
                      <span className="font-semibold">{formatCurrency(data?.categoryBreakdown.operatingExpenses || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Other</span>
                      <span className="font-semibold">{formatCurrency(data?.categoryBreakdown.other || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Pie chart coming soon</p>
                      <p className="text-sm">Visual cost distribution</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'restaurants' && (
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Restaurant</th>
                        <th className="text-right py-2">Revenue</th>
                        <th className="text-right py-2">Costs</th>
                        <th className="text-right py-2">Profit</th>
                        <th className="text-right py-2">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.restaurants.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-muted-foreground">
                            No restaurant data available
                          </td>
                        </tr>
                      ) : (
                        data?.restaurants.map((restaurant) => (
                          <tr key={restaurant.id} className="border-b">
                            <td className="py-2 font-medium">{restaurant.name}</td>
                            <td className="text-right py-2">{formatCurrency(restaurant.revenue)}</td>
                            <td className="text-right py-2">{formatCurrency(restaurant.costs)}</td>
                            <td className="text-right py-2">{formatCurrency(restaurant.profit)}</td>
                            <td className="text-right py-2">
                              {restaurant.revenue > 0 ? ((restaurant.profit / restaurant.revenue) * 100).toFixed(1) : '0.0'}%
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'trends' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Revenue Growth</span>
                      <Badge variant={data && data.trends.revenueGrowth >= 0 ? "default" : "destructive"}>
                        {formatPercentage(data?.trends.revenueGrowth || 0)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cost Reduction</span>
                      <Badge variant={data && data.trends.costReduction >= 0 ? "default" : "destructive"}>
                        {formatPercentage(data?.trends.costReduction || 0)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Profit Improvement</span>
                      <Badge variant={data && data.trends.profitImprovement >= 0 ? "default" : "destructive"}>
                        {formatPercentage(data?.trends.profitImprovement || 0)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Trend analysis coming soon</p>
                      <p className="text-sm">Historical performance trends</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AreaPl() {
  const { user } = useAuth();
  
  // Check if user has access (admin only)
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-destructive mb-4">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Access Denied</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  Area P&L is restricted to administrators only. Please contact your administrator if you need access.
                </p>
                <div className="text-sm text-muted-foreground">
                  Your current role: <Badge variant="outline">{user.role}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <AreaPlContent />
    </ProtectedRoute>
  );
}
