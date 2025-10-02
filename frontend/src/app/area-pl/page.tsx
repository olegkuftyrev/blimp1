'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContextSWR';
import { useSWRRestaurants } from '@/hooks/useSWRKitchen';
import { usePLReports, usePLLineItems } from '@/hooks/useSWRPL';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Loader2 } from "lucide-react";

// Default parameters for API calls
const defaultParams = {
  restaurantIds: [1], // Default to restaurant ID 1 (PX1234)
  year: 2025, // Use 2025 year
  periods: ['P06'], // Use P06 period
  basis: 'actual',
  ytd: false
};

function AreaPlContent() {
  const { user } = useAuth();
  const { restaurants, loading: restaurantsLoading } = useSWRRestaurants();
  
  // Fetch data using the same approach as analytics page
  const { reports: plReports, error: plReportsError, loading: plReportsLoading } = usePLReports(
    defaultParams.restaurantIds[0], 
    defaultParams.periods[0]
  );
  
  // Get the first report if available
  const plReport = plReports?.length > 0 ? plReports[0] : null;
  
  // Fetch line items for the report
  const { lineItems, calculations, loading: lineItemsLoading, error: lineItemsError } = usePLLineItems(
    plReport?.id || undefined
  );
  
  // Get current restaurant info
  const currentRestaurant = restaurants?.find((r: any) => r.id === defaultParams.restaurantIds[0]);
  
  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Area PL Debug Info:', {
        plReports,
        plReport,
        lineItems,
        calculations,
        plReportsLoading,
        lineItemsLoading,
        plReportsError,
        lineItemsError,
        defaultParams
      });
    }
  }, [plReports, plReport, lineItems, calculations, plReportsLoading, lineItemsLoading, plReportsError, lineItemsError]);
  
  const loading = plReportsLoading || lineItemsLoading;
  const error = plReportsError || lineItemsError;
  
  if (loading) {
  return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
            <Card>
            <CardContent className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading Area P&L data...</span>
                </div>
              </CardContent>
            </Card>
                            </div>
                          </div>
                        );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
            <Card>
            <CardContent className="text-center py-12">
              <p className="text-destructive">Error loading data: {error.message || 'Unknown error'}</p>
              <p className="text-sm text-gray-500 mt-2">
                This might be because there's no P&L data for restaurant ID {defaultParams.restaurantIds[0]} 
                for period {defaultParams.periods[0]} in {defaultParams.year}.
              </p>
              </CardContent>
            </Card>
          </div>
                  </div>
    );
  }

  // Check if we have no data
  if (!loading && !calculations && !plReport) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No P&L data available</p>
              <p className="text-sm text-gray-500 mt-2">
                There's no P&L data for restaurant ID {defaultParams.restaurantIds[0]} 
                for period {defaultParams.periods[0]} in {defaultParams.year}.
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Check console for debug information.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <Card>
            <CardHeader>
            <CardTitle className="text-lg font-semibold">Testing</CardTitle>
            </CardHeader>
            <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Results</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Store Name</TableCell>
                  <TableCell>
                    <span className="text-blue-600 font-semibold">
                      {plReport?.storeName || currentRestaurant?.name || 'PX1234'}
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Store PIC</TableCell>
                  <TableCell>
                    <span className="text-green-600 font-semibold">
                      {calculations?.storePIC || user?.fullName || 'Administrator'}
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Avg Weekly Sales</TableCell>
                  <TableCell>
                    <span className="text-purple-600 font-semibold">
                      {calculations?.dashboard?.netSales ? 
                        `$${(calculations.dashboard.netSales / 4).toLocaleString()}` : 
                        plReport?.netSales ? 
                          `$${(plReport.netSales / 4).toLocaleString()}` :
                          'N/A'
                      }
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SSS (Same Store Sales)</TableCell>
                  <TableCell>
                    {calculations?.sss !== undefined ? (
                      <span className={calculations.sss >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {calculations.sss.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        N/A {error && <span className="text-xs text-red-500">(Error: {error.message})</span>}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SSS YTD (Same Store Sales Year-to-Date)</TableCell>
                  <TableCell>
                    {calculations?.sssYtd !== undefined ? (
                      <span className={calculations.sssYtd >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {calculations.sssYtd.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SST% (Same Store Transactions)</TableCell>
                  <TableCell>
                    {calculations?.sst !== undefined ? (
                      <span className={calculations.sst >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {calculations.sst.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SST YTD (Same Store Transactions Year-to-Date)</TableCell>
                  <TableCell>
                    {calculations?.sstYtd !== undefined ? (
                      <span className={calculations.sstYtd >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {calculations.sstYtd.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cost of Goods Sold Total %</TableCell>
                  <TableCell>
                    {calculations?.cogsPercentage !== undefined ? (
                      <span className={calculations.cogsPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                        {calculations.cogsPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">COGS YTD %</TableCell>
                  <TableCell>
                    {calculations?.cogsYtdPercentage !== undefined ? (
                      <span className={calculations.cogsYtdPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                        {calculations.cogsYtdPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">TL (Total Labor) Actual %</TableCell>
                  <TableCell>
                    {calculations?.laborPercentage !== undefined ? (
                      <span className={calculations.laborPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                        {calculations.laborPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">TL YTD %</TableCell>
                  <TableCell>
                    {calculations?.laborYtdPercentage !== undefined ? (
                      <span className={calculations.laborYtdPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                        {calculations.laborYtdPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CP (Controllable Profit) %</TableCell>
                  <TableCell>
                    {calculations?.controllableProfitPercentage !== undefined ? (
                      <span className={calculations.controllableProfitPercentage >= 15 ? 'text-green-600' : 'text-red-600'}>
                        {calculations.controllableProfitPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CP YTD %</TableCell>
                  <TableCell>
                    {calculations?.controllableProfitYtdPercentage !== undefined ? (
                      <span className={calculations.controllableProfitYtdPercentage >= 15 ? 'text-green-600' : 'text-red-600'}>
                        {calculations.controllableProfitYtdPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">RC (Restaurant Contribution) YTD %</TableCell>
                  <TableCell>
                    {calculations?.restaurantContributionYtdPercentage !== undefined ? (
                      <span className={calculations.restaurantContributionYtdPercentage >= 10 ? 'text-green-600' : 'text-red-600'}>
                        {calculations.restaurantContributionYtdPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Rent Min $</TableCell>
                  <TableCell>
                    {calculations?.rentMin !== undefined ? (
                      <span className="text-purple-600">
                        ${calculations.rentMin.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Rent %</TableCell>
                  <TableCell>
                    {calculations?.rentPercentage !== undefined ? (
                      <span className="text-purple-600">
                        {calculations.rentPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Rent Other $</TableCell>
                  <TableCell>
                    {calculations?.rentOther !== undefined ? (
                      <span className="text-purple-600">
                        ${calculations.rentOther.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Rent Total $</TableCell>
                  <TableCell>
                    {calculations?.rentTotal !== undefined ? (
                      <span className="text-purple-600">
                        ${calculations.rentTotal.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Overtime Hours</TableCell>
                  <TableCell>
                    {calculations?.overtimeHours !== undefined ? (
                      <span className="text-orange-600">
                        {calculations.overtimeHours.toFixed(2)} hours
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                          </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Flow Thru</TableCell>
                  <TableCell>
                    {calculations?.flowThru !== undefined ? (
                      <span className={calculations.flowThru >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {calculations.flowThru.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                          </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Adjusted Controllable Profit This Year</TableCell>
                          <TableCell>
                    {calculations?.adjustedControllableProfitThisYear !== undefined ? (
                      <span className="text-green-600 font-semibold">
                        ${calculations.adjustedControllableProfitThisYear.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                          </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Adjusted Controllable Profit Last Year</TableCell>
                          <TableCell>
                    {calculations?.adjustedControllableProfitLastYear !== undefined ? (
                      <span className="text-blue-600 font-semibold">
                        ${calculations.adjustedControllableProfitLastYear.toLocaleString()}
                              </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                          </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">GM Bonus</TableCell>
                          <TableCell>
                    {calculations?.gmBonus !== undefined ? (
                      <span className={`font-semibold ${calculations.gmBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${calculations.gmBonus.toLocaleString()}
                              </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                          </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SM Bonus</TableCell>
                          <TableCell>
                    {calculations?.smBonus !== undefined ? (
                      <span className={`font-semibold ${calculations.smBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${calculations.smBonus.toLocaleString()}
                              </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                          </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">AM/Chef Bonus</TableCell>
                          <TableCell>
                    {calculations?.amChefBonus !== undefined ? (
                      <span className={`font-semibold ${calculations.amChefBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${calculations.amChefBonus.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                          </TableCell>
                        </TableRow>
                    </TableBody>
                  </Table>
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
