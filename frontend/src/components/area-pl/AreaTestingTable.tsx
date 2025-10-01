'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAreaPlLineItems } from '@/hooks/useAreaPL';

interface Restaurant {
  id: number;
  name: string;
}

interface AreaTestingTableProps {
  selectedRestaurants: number[];
  selectedYear: string;
  selectedPeriod: string;
  basis: string;
  restaurants: Restaurant[];
  loading?: boolean;
  error?: any;
}

export default function AreaTestingTable({
  selectedRestaurants,
  selectedYear,
  selectedPeriod,
  basis,
  restaurants,
  loading = false,
  error = null
}: AreaTestingTableProps) {
  // Prepare params for API call
  const periods = selectedPeriod === 'Q1' ? ['P01', 'P02', 'P03'] :
                  selectedPeriod === 'Q2' ? ['P04', 'P05', 'P06'] :
                  selectedPeriod === 'Q3' ? ['P07', 'P08', 'P09'] :
                  selectedPeriod === 'Q4' ? ['P10', 'P11', 'P12', 'P13'] :
                  selectedPeriod === 'YTD' ? ['YTD'] : [selectedPeriod];

  const params = {
    restaurantIds: selectedRestaurants,
    year: parseInt(selectedYear),
    periods,
    basis,
    ytd: selectedPeriod === 'YTD'
  };

  // Fetch area P&L line items data
  const { data: lineItemsData, error: lineItemsError, isLoading: lineItemsLoading } = useAreaPlLineItems(params);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getRestaurantName = (restaurantId: number) => {
    return restaurants.find(r => r.id === restaurantId)?.name || `Restaurant ${restaurantId}`;
  };

  // Get all unique metrics from the data
  const getMetricsList = () => {
    if (!lineItemsData?.data) return [];
    
    return [
      { key: 'storeName', label: 'Store Name', type: 'text' },
      { key: 'storePIC', label: 'Store PIC', type: 'text' },
      { key: 'avgWeeklySales', label: 'Avg Weekly Sales', type: 'currency' },
      { key: 'sss', label: 'SSS (Same Store Sales)', type: 'percentage' },
      { key: 'sssYtd', label: 'SSS YTD', type: 'percentage' },
      { key: 'sst', label: 'SST% (Same Store Transactions)', type: 'percentage' },
      { key: 'sstYtd', label: 'SST YTD', type: 'percentage' },
      { key: 'cogsPercentage', label: 'Cost of Goods Sold Total %', type: 'percentage' },
      { key: 'cogsYtdPercentage', label: 'COGS YTD %', type: 'percentage' },
      { key: 'laborPercentage', label: 'TL (Total Labor) Actual %', type: 'percentage' },
      { key: 'laborYtdPercentage', label: 'TL YTD %', type: 'percentage' },
      { key: 'controllableProfitPercentage', label: 'CP (Controllable Profit) %', type: 'percentage' },
      { key: 'controllableProfitYtdPercentage', label: 'CP YTD %', type: 'percentage' },
      { key: 'restaurantContributionYtdPercentage', label: 'RC (Restaurant Contribution) YTD %', type: 'percentage' },
      { key: 'rentMin', label: 'Rent Min $', type: 'currency' },
      { key: 'rentPercentage', label: 'Rent %', type: 'percentage' },
      { key: 'rentOther', label: 'Rent Other $', type: 'currency' },
      { key: 'rentTotal', label: 'Rent Total $', type: 'currency' },
      { key: 'overtimeHours', label: 'Overtime Hours', type: 'number' },
      { key: 'flowThru', label: 'Flow Thru', type: 'percentage' },
      { key: 'adjustedControllableProfitThisYear', label: 'Adjusted Controllable Profit This Year', type: 'currency' },
      { key: 'adjustedControllableProfitLastYear', label: 'Adjusted Controllable Profit Last Year', type: 'currency' },
      { key: 'gmBonus', label: 'GM Bonus', type: 'currency' },
      { key: 'smBonus', label: 'SM Bonus', type: 'currency' },
      { key: 'amChefBonus', label: 'AM/Chef Bonus', type: 'currency' }
    ];
  };

  const metrics = getMetricsList();

  if (loading || lineItemsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Area P&L Testing Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading area P&L data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || lineItemsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Area P&L Testing Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Error loading area P&L data: {error?.message || lineItemsError?.message || 'Unknown error'}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lineItemsData?.data || lineItemsData.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Area P&L Testing Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No P&L data available for the selected restaurants and period
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter restaurants that have data (calculations not null)
  const restaurantsWithData = lineItemsData.data.filter((item: any) => item.calculations !== null);
  
  if (restaurantsWithData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Area P&L Testing Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No restaurants have P&L data for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Area P&L Testing Table</span>
          <Badge variant="secondary">
            {restaurantsWithData.length} of {selectedRestaurants.length} restaurants • {selectedYear} {selectedPeriod} ({basis})
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Metric</TableHead>
                {restaurantsWithData.map((restaurantData: any) => (
                  <TableHead key={restaurantData.restaurantId} className="font-bold text-center">
                    {getRestaurantName(restaurantData.restaurantId)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric) => (
                <TableRow key={metric.key}>
                  <TableCell className="font-medium">{metric.label}</TableCell>
                  {restaurantsWithData.map((restaurantData: any) => {
                    const value = restaurantData.calculations?.[metric.key];
                    
                    return (
                      <TableCell key={restaurantData.restaurantId} className="text-center">
                        {value === undefined || value === null ? (
                          <span className="text-gray-500">No calculation</span>
                        ) : (
                          <span className={
                            metric.type === 'currency' ? 'text-purple-600 font-semibold' :
                            metric.type === 'percentage' ? 
                              (metric.key.includes('sss') || metric.key.includes('sst') ? 
                                (value >= 0 ? 'text-green-600' : 'text-red-600') :
                                (metric.key.includes('cogs') || metric.key.includes('labor') ? 
                                  (value <= 30 ? 'text-green-600' : 'text-red-600') :
                                  (metric.key.includes('controllableProfit') || metric.key.includes('restaurantContribution') ? 
                                    (value >= 15 ? 'text-green-600' : 'text-red-600') : 'text-purple-600'))) :
                            'text-blue-600 font-semibold'
                          }>
                            {metric.key === 'avgWeeklySales' ? 
                              formatCurrency((restaurantData.calculations?.dashboard?.netSales || 0) / 4) :
                             metric.type === 'currency' ? formatCurrency(value) :
                             metric.type === 'percentage' ? formatPercentage(value) :
                             metric.type === 'text' ? (value || 'N/A') :
                             value.toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Debug Info */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Debug Info:</h4>
          <div className="text-sm space-y-1">
            <div><strong>Selected Restaurants:</strong> {selectedRestaurants.length}</div>
            <div><strong>Restaurants with Data:</strong> {restaurantsWithData.length}</div>
            <div><strong>Missing Data:</strong> {selectedRestaurants.length - restaurantsWithData.length} restaurants</div>
            <div><strong>Period:</strong> {selectedYear} {selectedPeriod} ({basis})</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
