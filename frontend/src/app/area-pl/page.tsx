'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSWRRestaurants } from '@/hooks/useSWRKitchen';
import { usePLReportsBatch, usePLLineItemsBatch, PLUtils } from '@/hooks/useSWRPL';
import { ChartBarNegative } from '@/components/ChartBarNegative';
import { ChartBarLabelCustom } from '@/components/ChartBarLabelCustom';

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
  primeCostPercentage: number;
  primeCostYtdPercentage: number;
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
  
  // Filter states
  const [selectedStores, setSelectedStores] = useState<number[]>([]);
  const [showStoresWithData, setShowStoresWithData] = useState(true);
  const [showStoresWithoutData, setShowStoresWithoutData] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [isStorePopoverOpen, setIsStorePopoverOpen] = useState(false);
  const [isMetricsPopoverOpen, setIsMetricsPopoverOpen] = useState(false);
  const storeDropdownRef = useRef<HTMLDivElement>(null);
  const metricsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (storeDropdownRef.current && !storeDropdownRef.current.contains(event.target as Node)) {
        setIsStorePopoverOpen(false);
      }
      if (metricsDropdownRef.current && !metricsDropdownRef.current.contains(event.target as Node)) {
        setIsMetricsPopoverOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get available restaurants
  const { restaurants, loading: restaurantsLoading } = useSWRRestaurants();
  
  // Available metrics
  const availableMetrics = [
    { id: 'avgWeeklySales', name: 'Avg Weekly Sales' },
    { id: 'sss', name: 'SSS (Same Store Sales)' },
    { id: 'sssYtd', name: 'SSS YTD (Same Store Sales Year-to-Date)' },
    { id: 'sst', name: 'SST% (Same Store Transactions)' },
    { id: 'sstYtd', name: 'SST YTD (Same Store Transactions Year-to-Date)' },
    { id: 'cogsPercentage', name: 'Cost of Goods Sold Total %' },
    { id: 'cogsYtdPercentage', name: 'COGS YTD %' },
    { id: 'laborPercentage', name: 'TL (Total Labor) Actual %' },
    { id: 'laborYtdPercentage', name: 'TL YTD %' },
    { id: 'primeCostPercentage', name: 'Prime Cost (COGS+TL) %' },
    { id: 'primeCostYtdPercentage', name: 'Prime Cost YTD %' },
    { id: 'controllableProfitPercentage', name: 'CP (Controllable Profit) %' },
    { id: 'controllableProfitYtdPercentage', name: 'CP YTD %' },
    { id: 'restaurantContributionYtdPercentage', name: 'RC (Restaurant Contribution) YTD %' },
    { id: 'rentMin', name: 'Rent Min $' },
    { id: 'rentPercentage', name: 'Rent %' },
    { id: 'rentOther', name: 'Rent Other $' },
    { id: 'rentTotal', name: 'Rent Total $' },
    { id: 'overtimeHours', name: 'Overtime Hours' },
    { id: 'flowThru', name: 'Flow Thru' },
    { id: 'adjustedControllableProfitThisYear', name: 'Adjusted Controllable Profit This Year' },
    { id: 'adjustedControllableProfitLastYear', name: 'Adjusted Controllable Profit Last Year' },
    { id: 'gmBonus', name: 'GM Bonus' },
    { id: 'smBonus', name: 'SM Bonus' },
    { id: 'amChefBonus', name: 'AM/Chef Bonus' }
  ];
  
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

    // Calculate Prime Cost (COGS + TL)
    const primeCostPercentage = (calculations?.cogsPercentage || 0) + (calculations?.laborPercentage || 0);
    const primeCostYtdPercentage = (calculations?.cogsYtdPercentage || 0) + (calculations?.laborYtdPercentage || 0);

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
      primeCostPercentage: primeCostPercentage,
      primeCostYtdPercentage: primeCostYtdPercentage,
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

  // Filter store metrics based on selected filters
  const filteredStoreMetrics = storeMetrics.filter(store => {
    // Filter by selected stores (multiple selection)
    if (selectedStores.length > 0 && !selectedStores.includes(store.restaurantId)) {
      return false;
    }
    
    // Filter by data availability
    if (store.hasData && !showStoresWithData) {
      return false;
    }
    if (!store.hasData && !showStoresWithoutData) {
      return false;
    }
    
    return true;
  });

  // Filter metrics based on selected metrics
  const filteredMetrics = selectedMetrics.length === 0 
    ? availableMetrics 
    : availableMetrics.filter(metric => selectedMetrics.includes(metric.id));

  const formatCurrency = (value: number) => PLUtils.formatCurrency(value);
  const formatPercentage = (value: number) => PLUtils.formatPercentage(value);

  const getVarianceColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getThresholdColor = (value: number, threshold: number = 30) => {
    if (value < threshold) return 'text-green-600';
    return 'text-red-600';
  };

  // Function to render metric row
  const renderMetricRow = (metricId: string, metricName: string, getValue: (store: StoreMetrics) => string, getColor?: (store: StoreMetrics) => string) => {
    return (
      <TableRow key={metricId}>
        <TableCell className="font-medium sticky left-0 bg-background">{metricName}</TableCell>
        {filteredStoreMetrics.map((store) => (
          <TableCell key={store.restaurantId} className={getColor ? getColor(store) : ''}>
            {getValue(store)}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Area P&L Dashboard</h1>
          <p className="text-muted-foreground">Store performance metrics overview</p>
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
                {filteredStoreMetrics.filter(m => m.hasData).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Avg Weekly Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(filteredStoreMetrics.reduce((sum, m) => sum + m.avgWeeklySales, 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Column 1: Store Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Stores</Label>
                <div className="relative" ref={storeDropdownRef}>
                  <Button
                    variant="outline"
                    onClick={() => setIsStorePopoverOpen(!isStorePopoverOpen)}
                    className="w-full justify-between"
                  >
                    {selectedStores.length === 0 
                      ? "All Stores" 
                      : selectedStores.length === restaurants?.length 
                        ? "All Stores" 
                        : `${selectedStores.length} store${selectedStores.length !== 1 ? 's' : ''} selected`
                    }
                    <ChevronDown className={`ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform ${isStorePopoverOpen ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {isStorePopoverOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50">
                      <div className="p-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                               onClick={() => {
                                 setSelectedStores([]);
                                 setIsStorePopoverOpen(false);
                               }}>
                            <Checkbox
                              checked={selectedStores.length === 0}
                              onChange={() => {}}
                              className="pointer-events-none"
                            />
                            <span className="text-sm">All Stores ({restaurants?.length || 0})</span>
                          </div>
                          {restaurants?.map((restaurant: any) => (
                            <div 
                              key={restaurant.id}
                              className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                              onClick={() => {
                                if (selectedStores.includes(restaurant.id)) {
                                  setSelectedStores(selectedStores.filter(id => id !== restaurant.id));
                                } else {
                                  setSelectedStores([...selectedStores, restaurant.id]);
                                }
                              }}
                            >
                              <Checkbox
                                checked={selectedStores.includes(restaurant.id)}
                                onChange={() => {}}
                                className="pointer-events-none"
                              />
                              <span className="text-sm">{restaurant.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {selectedStores.length > 0 && selectedStores.length < (restaurants?.length || 0) && (
                  <p className="text-xs text-muted-foreground">
                    {selectedStores.length} store{selectedStores.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {/* Column 2: Data Availability Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Show Stores</Label>
                <Select 
                  value={
                    showStoresWithData && showStoresWithoutData ? "all" :
                    showStoresWithData && !showStoresWithoutData ? "with-data" :
                    !showStoresWithData && showStoresWithoutData ? "without-data" : "none"
                  }
                  onValueChange={(value) => {
                    switch (value) {
                      case "all":
                        setShowStoresWithData(true);
                        setShowStoresWithoutData(true);
                        break;
                      case "with-data":
                        setShowStoresWithData(true);
                        setShowStoresWithoutData(false);
                        break;
                      case "without-data":
                        setShowStoresWithData(false);
                        setShowStoresWithoutData(true);
                        break;
                      case "none":
                        setShowStoresWithData(false);
                        setShowStoresWithoutData(false);
                        break;
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select data filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Stores ({storeMetrics.length})
                    </SelectItem>
                    <SelectItem value="with-data">
                      With Data ({storeMetrics.filter(m => m.hasData).length})
                    </SelectItem>
                    <SelectItem value="without-data">
                      Without Data ({storeMetrics.filter(m => !m.hasData).length})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Column 3: Metrics Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Metrics</Label>
                <div className="relative" ref={metricsDropdownRef}>
                  <Button
                    variant="outline"
                    onClick={() => setIsMetricsPopoverOpen(!isMetricsPopoverOpen)}
                    className="w-full justify-between"
                  >
                    {selectedMetrics.length === 0 
                      ? "All Metrics" 
                      : selectedMetrics.length === availableMetrics.length 
                        ? "All Metrics" 
                        : `${selectedMetrics.length} metric${selectedMetrics.length !== 1 ? 's' : ''} selected`
                    }
                    <ChevronDown className={`ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform ${isMetricsPopoverOpen ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {isMetricsPopoverOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                               onClick={() => {
                                 setSelectedMetrics([]);
                                 setIsMetricsPopoverOpen(false);
                               }}>
                            <Checkbox
                              checked={selectedMetrics.length === 0}
                              onChange={() => {}}
                              className="pointer-events-none"
                            />
                            <span className="text-sm">All Metrics ({availableMetrics.length})</span>
                          </div>
                          {availableMetrics.map((metric) => (
                            <div 
                              key={metric.id}
                              className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                              onClick={() => {
                                if (selectedMetrics.includes(metric.id)) {
                                  setSelectedMetrics(selectedMetrics.filter(id => id !== metric.id));
                                } else {
                                  setSelectedMetrics([...selectedMetrics, metric.id]);
                                }
                              }}
                            >
                              <Checkbox
                                checked={selectedMetrics.includes(metric.id)}
                                onChange={() => {}}
                                className="pointer-events-none"
                              />
                              <span className="text-sm">{metric.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {selectedMetrics.length > 0 && selectedMetrics.length < availableMetrics.length && (
                  <p className="text-xs text-muted-foreground">
                    {selectedMetrics.length} metric{selectedMetrics.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {/* Column 4: Period Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Period</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-full">
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

            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStores([]);
                  setShowStoresWithData(true);
                  setShowStoresWithoutData(true);
                  setSelectedMetrics([]);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts in Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Prime Cost Performance */}
          <div>
            {filteredStoreMetrics.filter(store => store.primeCostPercentage > 0).length > 0 && (
              <ChartBarNegative 
                data={filteredStoreMetrics.map(store => ({
                  storeName: store.storeName,
                  primeCostPercentage: store.primeCostPercentage
                })).filter(store => store.primeCostPercentage > 0)} // Only show stores with data
              />
            )}
          </div>

          {/* Right Column - Store Sales Performance */}
          <div>
            {filteredStoreMetrics.filter(store => store.avgWeeklySales > 0).length > 0 && (
              <ChartBarLabelCustom 
                data={filteredStoreMetrics.map(store => ({
                  storeName: store.storeName,
                  netSales: store.avgWeeklySales * 4, // Convert weekly to period sales
                  avgWeeklySales: store.avgWeeklySales,
                  sss: store.sss
                })).filter(store => store.avgWeeklySales > 0)}
              />
            )}
          </div>
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
                      {filteredStoreMetrics.map((store) => (
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
                    {filteredMetrics.map((metric) => {
                      switch (metric.id) {
                        case 'avgWeeklySales':
                          return renderMetricRow(metric.id, metric.name, (store) => formatCurrency(store.avgWeeklySales));
                        case 'sss':
                          return renderMetricRow(
                            metric.id, 
                            metric.name, 
                            (store) => formatPercentage(store.sss),
                            (store) => getVarianceColor(store.sss)
                          );
                        case 'sssYtd':
                          return renderMetricRow(
                            metric.id, 
                            metric.name, 
                            (store) => formatPercentage(store.sssYtd),
                            (store) => getVarianceColor(store.sssYtd)
                          );
                        case 'sst':
                          return renderMetricRow(
                            metric.id, 
                            metric.name, 
                            (store) => formatPercentage(store.sst),
                            (store) => getVarianceColor(store.sst)
                          );
                        case 'sstYtd':
                          return renderMetricRow(
                            metric.id, 
                            metric.name, 
                            (store) => formatPercentage(store.sstYtd),
                            (store) => getVarianceColor(store.sstYtd)
                          );
                        case 'cogsPercentage':
                          return renderMetricRow(
                            metric.id, 
                            metric.name, 
                            (store) => formatPercentage(store.cogsPercentage),
                            (store) => getThresholdColor(store.cogsPercentage)
                          );
                        case 'cogsYtdPercentage':
                          return renderMetricRow(
                            metric.id, 
                            metric.name, 
                            (store) => formatPercentage(store.cogsYtdPercentage),
                            (store) => getThresholdColor(store.cogsYtdPercentage)
                          );
                        case 'laborPercentage':
                          return renderMetricRow(
                            metric.id, 
                            metric.name, 
                            (store) => formatPercentage(store.laborPercentage),
                            (store) => getThresholdColor(store.laborPercentage)
                          );
                        case 'laborYtdPercentage':
                          return renderMetricRow(
                            metric.id, 
                            metric.name, 
                            (store) => formatPercentage(store.laborYtdPercentage),
                            (store) => getThresholdColor(store.laborYtdPercentage)
                          );
                        case 'primeCostPercentage':
                          return renderMetricRow(
                            metric.id, 
                            metric.name, 
                            (store) => `${store.primeCostPercentage.toFixed(1)}%`,
                            (store) => getThresholdColor(store.primeCostPercentage, 60)
                          );
                        case 'primeCostYtdPercentage':
                          return renderMetricRow(
                            metric.id, 
                            metric.name, 
                            (store) => `${store.primeCostYtdPercentage.toFixed(1)}%`,
                            (store) => getThresholdColor(store.primeCostYtdPercentage, 60)
                          );
                        case 'controllableProfitPercentage':
                          return renderMetricRow(metric.id, metric.name, (store) => formatPercentage(store.controllableProfitPercentage));
                        case 'controllableProfitYtdPercentage':
                          return renderMetricRow(metric.id, metric.name, (store) => formatPercentage(store.controllableProfitYtdPercentage));
                        case 'restaurantContributionYtdPercentage':
                          return renderMetricRow(metric.id, metric.name, (store) => formatPercentage(store.restaurantContributionYtdPercentage));
                        case 'rentMin':
                          return renderMetricRow(metric.id, metric.name, (store) => formatCurrency(store.rentMin));
                        case 'rentPercentage':
                          return renderMetricRow(metric.id, metric.name, (store) => formatPercentage(store.rentPercentage));
                        case 'rentOther':
                          return renderMetricRow(metric.id, metric.name, (store) => formatCurrency(store.rentOther));
                        case 'rentTotal':
                          return renderMetricRow(metric.id, metric.name, (store) => formatCurrency(store.rentTotal));
                        case 'overtimeHours':
                          return renderMetricRow(metric.id, metric.name, (store) => store.overtimeHours.toFixed(2));
                        case 'flowThru':
                          return renderMetricRow(metric.id, metric.name, (store) => formatPercentage(store.flowThru));
                        case 'adjustedControllableProfitThisYear':
                          return renderMetricRow(metric.id, metric.name, (store) => formatCurrency(store.adjustedControllableProfitThisYear));
                        case 'adjustedControllableProfitLastYear':
                          return renderMetricRow(metric.id, metric.name, (store) => formatCurrency(store.adjustedControllableProfitLastYear));
                        case 'gmBonus':
                          return renderMetricRow(metric.id, metric.name, (store) => formatCurrency(store.gmBonus));
                        case 'smBonus':
                          return renderMetricRow(metric.id, metric.name, (store) => formatCurrency(store.smBonus));
                        case 'amChefBonus':
                          return renderMetricRow(metric.id, metric.name, (store) => formatCurrency(store.amChefBonus));
                        default:
                          return null;
                      }
                    })}
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