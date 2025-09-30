'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAreaPlKpis, useAreaPlSummary, useAreaPlPeriods, useAreaPlLeaderboard } from '@/hooks/useAreaPL';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Loader2, Building2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch } from '@/lib/api';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

interface PeriodData {
  restaurantId: number;
  year: number;
  period: string;
  hasData: boolean;
  label: string;
  missingPeriods?: string[];
}

interface PeriodsResponse {
  periods: PeriodData[];
}

interface KpisResponse {
  kpis: {
    profitMargin: number;
    laborPct: number;
    cogsPct: number;
    cpPct: number;
    trendFlags: {
      profitMargin: string;
      laborPct: string;
      cogsPct: string;
      cpPct: string;
    };
  };
}

interface SummaryResponse {
  summary: {
    netSales: number;
    cogs: number;
    labor: number;
    controllableProfit: number;
  };
}

interface LeaderboardItem {
  restaurantId: number;
  restaurantName: string;
  netSales: number;
  cogs: number;
  labor: number;
  controllableProfit: number;
  profitMargin: number;
  laborPct: number;
  cogsPct: number;
  reportCount: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardItem[];
  total: number;
  metric: string;
  order: string;
  filters: any;
}

export default function AreaPl() {
  const [selectedPeriod, setSelectedPeriod] = useState('P01');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [basis, setBasis] = useState('actual');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState<number[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [restaurantsWithData, setRestaurantsWithData] = useState<Set<number>>(new Set());
  const [sortMetric, setSortMetric] = useState('profitMargin');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Convert timeframe selection to periods array
  const getPeriodsFromTimeframe = (timeframe: string): string[] => {
    switch (timeframe) {
      case 'Q1': return ['P01', 'P02', 'P03'];
      case 'Q2': return ['P04', 'P05', 'P06'];
      case 'Q3': return ['P07', 'P08', 'P09'];
      case 'Q4': return ['P10', 'P11', 'P12', 'P13'];
      case 'YTD': return ['YTD'];
      default: return [timeframe]; // Individual periods like P01, P02, etc.
    }
  };

  // Fetch restaurants on component mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setRestaurantsLoading(true);
        const response = await apiFetch<{ data: Restaurant[] }>('restaurants');
        setRestaurants(response.data);
        // Select all restaurants by default
        setSelectedRestaurants(response.data.map(r => r.id));
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setRestaurantsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Prepare params for API calls
  const periods = getPeriodsFromTimeframe(selectedPeriod);
  const params = {
    restaurantIds: selectedRestaurants.length > 0 ? selectedRestaurants : [],
    year: parseInt(selectedYear),
    periods,
    basis,
    ytd: selectedPeriod === 'YTD'
  };

  // Fetch data
  const { data: kpis, error: kpisError, isLoading: kpisLoading } = useAreaPlKpis(params) as { data: KpisResponse | undefined; error: any; isLoading: boolean };
  const { data: summary, error: summaryError, isLoading: summaryLoading } = useAreaPlSummary(params) as { data: SummaryResponse | undefined; error: any; isLoading: boolean };
  
  // Fetch leaderboard data
  const leaderboardParams = {
    ...params,
    metric: sortMetric,
    order: sortOrder,
    limit: 50
  };
  const { data: leaderboardData, error: leaderboardError, isLoading: leaderboardLoading } = useAreaPlLeaderboard(leaderboardParams) as { data: LeaderboardResponse | undefined; error: any; isLoading: boolean };
  
  // Fetch periods data to check which restaurants have data
  const { data: periodsData } = useAreaPlPeriods({
    restaurantIds: restaurants.map(r => r.id),
    year: parseInt(selectedYear)
  }) as { data: PeriodsResponse | undefined };

  // Update restaurants with data when periods data changes
  useEffect(() => {
    if (periodsData?.periods) {
      const restaurantsWithDataSet = new Set<number>();
      const requiredPeriods = getPeriodsFromTimeframe(selectedPeriod);
      
      // Group periods by restaurant
      const restaurantPeriods = new Map<number, Set<string>>();
      periodsData.periods.forEach((period: any) => {
        if (!restaurantPeriods.has(period.restaurantId)) {
          restaurantPeriods.set(period.restaurantId, new Set());
        }
        if (period.hasData) {
          restaurantPeriods.get(period.restaurantId)!.add(period.period);
        }
      });
      
      // Check if each restaurant has all required periods
      restaurantPeriods.forEach((availablePeriods, restaurantId) => {
        const hasAllRequiredPeriods = requiredPeriods.every(requiredPeriod => 
          availablePeriods.has(requiredPeriod)
        );
        if (hasAllRequiredPeriods) {
          restaurantsWithDataSet.add(restaurantId);
        }
      });
      
      setRestaurantsWithData(restaurantsWithDataSet);
    }
  }, [periodsData, selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleRestaurantToggle = (restaurantId: number, checked: boolean) => {
    if (checked) {
      setSelectedRestaurants(prev => [...prev, restaurantId]);
    } else {
      setSelectedRestaurants(prev => prev.filter(id => id !== restaurantId));
    }
  };

  const handleSelectAllRestaurants = () => {
    setSelectedRestaurants(restaurants.map(r => r.id));
  };

  const handleDeselectAllRestaurants = () => {
    setSelectedRestaurants([]);
  };

  const handleSort = (metric: string) => {
    if (sortMetric === metric) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortMetric(metric);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (metric: string) => {
    if (sortMetric !== metric) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />;
  };

  return (
    <ProtectedRoute>
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
                  Restricted Access - Admin & Ops Lead Only
                </Badge>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Year:</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Timeframe:</label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="P01">P01</SelectItem>
                        <SelectItem value="P02">P02</SelectItem>
                        <SelectItem value="P03">P03</SelectItem>
                        <SelectItem value="P04">P04</SelectItem>
                        <SelectItem value="P05">P05</SelectItem>
                        <SelectItem value="P06">P06</SelectItem>
                        <SelectItem value="P07">P07</SelectItem>
                        <SelectItem value="P08">P08</SelectItem>
                        <SelectItem value="P09">P09</SelectItem>
                        <SelectItem value="P10">P10</SelectItem>
                        <SelectItem value="P11">P11</SelectItem>
                        <SelectItem value="P12">P12</SelectItem>
                        <SelectItem value="P13">P13</SelectItem>
                        <SelectItem value="Q1">Q1</SelectItem>
                        <SelectItem value="Q2">Q2</SelectItem>
                        <SelectItem value="Q3">Q3</SelectItem>
                        <SelectItem value="Q4">Q4</SelectItem>
                        <SelectItem value="YTD">YTD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Basis:</label>
                    <Select value={basis} onValueChange={setBasis}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="actual">Actual</SelectItem>
                        <SelectItem value="plan">Plan</SelectItem>
                        <SelectItem value="prior_year">Prior Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedYear} - {selectedPeriod} ({basis})
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Restaurant Selection */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Restaurant Selection</span>
                  <Badge variant="outline">
                    {selectedRestaurants.length} of {restaurants.length} selected
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {restaurantsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading restaurants...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSelectAllRestaurants}
                        disabled={selectedRestaurants.length === restaurants.length}
                      >
                        Select All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleDeselectAllRestaurants}
                        disabled={selectedRestaurants.length === 0}
                      >
                        Deselect All
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                      {restaurants.map((restaurant) => {
                        const hasData = restaurantsWithData.has(restaurant.id);
                        
                        // Find missing periods for this restaurant and selected timeframe
                        const requiredPeriods = getPeriodsFromTimeframe(selectedPeriod);
                        const restaurantPeriods = periodsData?.periods?.filter((p: any) => 
                          p.restaurantId === restaurant.id && requiredPeriods.includes(p.period)
                        ) || [];
                        
                        const missingPeriods = requiredPeriods.filter(requiredPeriod => {
                          const periodData = restaurantPeriods.find((p: any) => p.period === requiredPeriod);
                          return !periodData || !periodData.hasData;
                        });
                        
                        return (
                          <div key={restaurant.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={`restaurant-${restaurant.id}`}
                              checked={selectedRestaurants.includes(restaurant.id)}
                              onCheckedChange={(checked) => 
                                handleRestaurantToggle(restaurant.id, checked as boolean)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <label 
                                htmlFor={`restaurant-${restaurant.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer block"
                              >
                                {restaurant.name}
                              </label>
                              {!hasData && (
                                <div className="text-xs text-amber-600 mt-1">
                                  {missingPeriods && missingPeriods.length > 0 ? (
                                    <div>
                                      <div>Missing P&L report for {selectedYear} {selectedPeriod}</div>
                                      <div className="text-amber-700 font-medium mt-1">
                                        Missing periods: {missingPeriods.join(', ')}
                                      </div>
                                    </div>
                                  ) : (
                                    `Missing P&L report for ${selectedYear} ${selectedPeriod}`
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Profit Margin */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {kpisLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : kpisError ? (
                  <div className="text-sm text-destructive">Error loading data</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {formatPercentage(kpis?.kpis?.profitMargin || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Industry avg: 3-5%
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Labor % */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Labor %</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {kpisLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : kpisError ? (
                  <div className="text-sm text-destructive">Error loading data</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {formatPercentage(kpis?.kpis?.laborPct || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Target: 18-22%
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* COGS % */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">COGS %</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {kpisLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : kpisError ? (
                  <div className="text-sm text-destructive">Error loading data</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {formatPercentage(kpis?.kpis?.cogsPct || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Target: 28-32%
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Controllable Profit % */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CP %</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {kpisLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : kpisError ? (
                  <div className="text-sm text-destructive">Error loading data</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {formatPercentage(kpis?.kpis?.cpPct || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Target: 40-45%
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Area Summary - {selectedYear} {selectedPeriod}</CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading summary data...</span>
                  </div>
                </div>
              ) : summaryError ? (
                <div className="text-center py-8 text-destructive">
                  Error loading summary data
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatCurrency(summary?.summary?.netSales || 0)}</div>
                    <div className="text-sm text-muted-foreground">Net Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatCurrency(summary?.summary?.cogs || 0)}</div>
                    <div className="text-sm text-muted-foreground">COGS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatCurrency(summary?.summary?.labor || 0)}</div>
                    <div className="text-sm text-muted-foreground">Labor</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatCurrency(summary?.summary?.controllableProfit || 0)}</div>
                    <div className="text-sm text-muted-foreground">Controllable Profit</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Restaurant Leaderboard */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Restaurant Performance Leaderboard</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ranking by {sortMetric === 'profitMargin' ? 'Profit Margin' : 
                           sortMetric === 'netSales' ? 'Net Sales' :
                           sortMetric === 'laborPct' ? 'Labor %' : 'COGS %'} 
                ({sortOrder === 'desc' ? 'Highest First' : 'Lowest First'})
              </p>
            </CardHeader>
            <CardContent>
              {leaderboardLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading leaderboard data...</span>
                  </div>
                </div>
              ) : leaderboardError ? (
                <div className="text-center py-8 text-destructive">
                  Error loading leaderboard data
                </div>
              ) : leaderboardData?.leaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No restaurant data available for the selected filters
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Restaurant</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('netSales')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Net Sales</span>
                            {getSortIcon('netSales')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('profitMargin')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Profit Margin</span>
                            {getSortIcon('profitMargin')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('laborPct')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Labor %</span>
                            {getSortIcon('laborPct')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('cogsPct')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>COGS %</span>
                            {getSortIcon('cogsPct')}
                          </div>
                        </TableHead>
                        <TableHead>Controllable Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboardData?.leaderboard.map((item, index) => (
                        <TableRow key={item.restaurantId}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.restaurantName}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.netSales)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span className={item.profitMargin >= 30 ? 'text-green-600' : item.profitMargin >= 20 ? 'text-yellow-600' : 'text-red-600'}>
                                {formatPercentage(item.profitMargin)}
                              </span>
                              {item.profitMargin >= 30 ? <TrendingUp className="h-3 w-3 text-green-600" /> : 
                               item.profitMargin >= 20 ? <span className="text-yellow-600">→</span> : 
                               <TrendingDown className="h-3 w-3 text-red-600" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span className={item.laborPct <= 25 ? 'text-green-600' : item.laborPct <= 35 ? 'text-yellow-600' : 'text-red-600'}>
                                {formatPercentage(item.laborPct)}
                              </span>
                              {item.laborPct <= 25 ? <TrendingUp className="h-3 w-3 text-green-600" /> : 
                               item.laborPct <= 35 ? <span className="text-yellow-600">→</span> : 
                               <TrendingDown className="h-3 w-3 text-red-600" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span className={item.cogsPct <= 30 ? 'text-green-600' : item.cogsPct <= 35 ? 'text-yellow-600' : 'text-red-600'}>
                                {formatPercentage(item.cogsPct)}
                              </span>
                              {item.cogsPct <= 30 ? <TrendingUp className="h-3 w-3 text-green-600" /> : 
                               item.cogsPct <= 35 ? <span className="text-yellow-600">→</span> : 
                               <TrendingDown className="h-3 w-3 text-red-600" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.controllableProfit)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debug Info */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div><strong>Selected Restaurants:</strong> {selectedRestaurants.length} restaurants</div>
                <div><strong>Restaurants with Data:</strong> {restaurantsWithData.size} restaurants</div>
                <div><strong>Restaurant IDs:</strong> {selectedRestaurants.join(', ')}</div>
                <div><strong>Restaurants with Data IDs:</strong> {Array.from(restaurantsWithData).join(', ')}</div>
                <div><strong>Params:</strong> {JSON.stringify(params, null, 2)}</div>
                <div><strong>KPIs Loading:</strong> {kpisLoading ? 'Yes' : 'No'}</div>
                <div><strong>Summary Loading:</strong> {summaryLoading ? 'Yes' : 'No'}</div>
                <div><strong>KPIs Error:</strong> {kpisError ? 'Yes' : 'No'}</div>
                <div><strong>Summary Error:</strong> {summaryError ? 'Yes' : 'No'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
