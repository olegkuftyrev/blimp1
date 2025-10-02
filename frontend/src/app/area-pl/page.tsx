'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSWRRestaurants } from '@/hooks/useSWRKitchen';
import { usePLReportsBatch, usePLLineItemsBatch, PLUtils } from '@/hooks/useSWRPL';

interface StoreMetrics {
  restaurantId: number;
  storeName: string;
  storePIC: string;
  avgWeeklySales: number;
  sss: number;
  sssYtd: number;
  sst: number;
  sstYtd: number;
  cogsPercentage: number;
  cogsYtdPercentage: number;
  laborPercentage: number;
  laborYtdPercentage: number;
  controllableProfitPercentage: number;
  controllableProfitYtdPercentage: number;
  restaurantContributionYtdPercentage: number;
  rentMin: number;
  rentPercentage: number;
  rentOther: number;
  rentTotal: number;
  overtimeHours: number;
  flowThru: number;
  adjustedControllableProfitThisYear: number;
  adjustedControllableProfitLastYear: number;
  gmBonus: number;
  smBonus: number;
  amChefBonus: number;
  period: string;
  hasData: boolean;
}

function AreaPlContent() {
  const [selectedPeriod, setSelectedPeriod] = useState('P09');
  const [selectedYear, setSelectedYear] = useState(2025);

  // Get available restaurants
  const { restaurants, loading: restaurantsLoading } = useSWRRestaurants();
  
  // Get batch P&L reports
  const restaurantIds = restaurants?.map((r: any) => r.id) || [];
  const { reports: batchReports, loading: batchLoading, error: batchError } = usePLReportsBatch(
    restaurantIds.length > 0 ? restaurantIds : undefined,
    [selectedPeriod],
    selectedYear
  );

  // Get batch line items with calculations
  const reportIds = batchReports?.map((r: any) => r.report?.id).filter(Boolean) || [];
  const { results: batchLineItems, loading: lineItemsLoading } = usePLLineItemsBatch(
    reportIds.length > 0 ? reportIds : undefined
  );

  // Process data directly without state
  const storeMetrics: StoreMetrics[] = restaurants?.map((restaurant: any) => {
    // Find corresponding batch report
    const batchReport = batchReports?.find((br: any) => br.restaurantId === restaurant.id);
    
    // Find corresponding line items with calculations
    const lineItemsResult = batchLineItems?.find((bl: any) => 
      batchReport?.report?.id && bl.reportId === batchReport.report.id
    );

    const calculations = lineItemsResult?.calculations;
    const report = batchReport?.report;

    // Calculate average weekly sales (assuming 4 weeks per period)
    const avgWeeklySales = report?.netSales ? report.netSales / 4 : 0;

    return {
      restaurantId: restaurant.id,
      storeName: restaurant.name,
      storePIC: restaurant.manager || 'Administrator',
      avgWeeklySales: avgWeeklySales,
      sss: calculations?.sss || 0,
      sssYtd: calculations?.sssYtd || 0,
      sst: calculations?.sst || 0,
      sstYtd: calculations?.sstYtd || 0,
      cogsPercentage: calculations?.cogsPercentage || 0,
      cogsYtdPercentage: calculations?.cogsYtdPercentage || 0,
      laborPercentage: calculations?.laborPercentage || 0,
      laborYtdPercentage: calculations?.laborYtdPercentage || 0,
      controllableProfitPercentage: calculations?.controllableProfitPercentage || 0,
      controllableProfitYtdPercentage: calculations?.controllableProfitYtdPercentage || 0,
      restaurantContributionYtdPercentage: calculations?.restaurantContributionYtdPercentage || 0,
      rentMin: calculations?.rentMin || 0,
      rentPercentage: calculations?.rentPercentage || 0,
      rentOther: calculations?.rentOther || 0,
      rentTotal: calculations?.rentTotal || 0,
      overtimeHours: calculations?.overtimeHours || 0,
      flowThru: calculations?.flowThru || 0,
      adjustedControllableProfitThisYear: calculations?.adjustedControllableProfitThisYear || 0,
      adjustedControllableProfitLastYear: calculations?.adjustedControllableProfitLastYear || 0,
      gmBonus: calculations?.gmBonus || 0,
      smBonus: calculations?.smBonus || 0,
      amChefBonus: calculations?.amChefBonus || 0,
      period: selectedPeriod,
      hasData: !!report && !!calculations
    };
  }) || [];

  const isLoading = restaurantsLoading || batchLoading || lineItemsLoading;
  const hasError = batchError;

  const formatCurrency = (value: number) => PLUtils.formatCurrency(value);
  const formatPercentage = (value: number) => PLUtils.formatPercentage(value);

  const getVarianceColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Area P&L Dashboard</h1>
            <p className="text-muted-foreground">Store performance metrics overview</p>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-24">
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
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{restaurants?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Stores with Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {storeMetrics.filter(m => m.hasData).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Avg Weekly Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(storeMetrics.reduce((sum, m) => sum + m.avgWeeklySales, 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Store Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Store Performance Metrics - {selectedPeriod} {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading store metrics...</p>
              </div>
            ) : hasError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error loading data. Please try again.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background">Metric</TableHead>
                      {storeMetrics.map((store) => (
                        <TableHead key={store.restaurantId} className="min-w-[120px]">
                          <div className="text-center">
                            <div className="font-medium">{store.storeName}</div>
                            <div className="text-xs text-muted-foreground">{store.storePIC}</div>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Avg Weekly Sales */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">Avg Weekly Sales</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatCurrency(store.avgWeeklySales)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* SSS */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">SSS (Same Store Sales)</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatPercentage(store.sss)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* SSS YTD */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">SSS YTD (Same Store Sales Year-to-Date)</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatPercentage(store.sssYtd)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* SST */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">SST% (Same Store Transactions)</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatPercentage(store.sst)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* SST YTD */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">SST YTD (Same Store Transactions Year-to-Date)</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatPercentage(store.sstYtd)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* COGS */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">Cost of Goods Sold Total %</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatPercentage(store.cogsPercentage)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* COGS YTD */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">COGS YTD %</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatPercentage(store.cogsYtdPercentage)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Total Labor */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">TL (Total Labor) Actual %</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatPercentage(store.laborPercentage)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* TL YTD */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">TL YTD %</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatPercentage(store.laborYtdPercentage)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Controllable Profit */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">CP (Controllable Profit) %</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatPercentage(store.controllableProfitPercentage)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* CP YTD */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">CP YTD %</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatPercentage(store.controllableProfitYtdPercentage)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Restaurant Contribution */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">RC (Restaurant Contribution) YTD %</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatPercentage(store.restaurantContributionYtdPercentage)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Rent Min */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">Rent Min $</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatCurrency(store.rentMin)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Rent % */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">Rent %</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatPercentage(store.rentPercentage)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Rent Other */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">Rent Other $</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatCurrency(store.rentOther)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Rent Total */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">Rent Total $</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatCurrency(store.rentTotal)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Overtime Hours */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">Overtime Hours</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{store.overtimeHours.toFixed(2)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Flow Thru */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">Flow Thru</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatPercentage(store.flowThru)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Adjusted Controllable Profit This Year */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">Adjusted Controllable Profit This Year</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatCurrency(store.adjustedControllableProfitThisYear)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Adjusted Controllable Profit Last Year */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">Adjusted Controllable Profit Last Year</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatCurrency(store.adjustedControllableProfitLastYear)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* GM Bonus */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">GM Bonus</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatCurrency(store.gmBonus)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* SM Bonus */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">SM Bonus</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatCurrency(store.smBonus)}</TableCell>
                      ))}
                    </TableRow>
                    
                    {/* AM/Chef Bonus */}
                    <TableRow>
                      <TableCell className="font-medium sticky left-0 bg-background">AM/Chef Bonus</TableCell>
                      {storeMetrics.map((store) => (
                        <TableCell key={store.restaurantId}>{formatCurrency(store.amChefBonus)}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AreaPl() {
  return (
    <ProtectedRoute>
      <AreaPlContent />
    </ProtectedRoute>
  );
}