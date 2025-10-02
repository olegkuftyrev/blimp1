'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContextSWR';
import { useSWRRestaurants } from '@/hooks/useSWRKitchen';
import { useAnalytics } from '@/hooks/useAnalytics';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Loader2 } from "lucide-react";

// Default parameters for API calls
const defaultParams = {
  restaurantIds: [5], // Try restaurant ID 5 (PX2475)
  year: 2025, // Use 2025 year
  periods: ['P06'], // Try P06 period instead
  basis: 'actual',
  ytd: false
};

function AreaPlContent() {
  const { user } = useAuth();
  const { restaurants, loading: restaurantsLoading } = useSWRRestaurants();
  
  // Fetch data using useAnalytics hook
  const { reportData, loading, error } = useAnalytics({
    storeId: defaultParams.restaurantIds[0],
    year: defaultParams.year,
    period: defaultParams.periods[0]
  });
  
  // Extract data from reportData
  const plReport = reportData;
  const calculations = null; // PLReportData doesn't have calculations field
  const lineItems = null; // PLReportData doesn't have lineItems field
  
  // Get current restaurant info
  const currentRestaurant = restaurants?.find((r: any) => r.id === defaultParams.restaurantIds[0]);
  
  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Area PL Debug Info:', {
        reportData,
        plReport,
        lineItems,
        calculations,
        loading,
        error,
        defaultParams
      });
    }
  }, [reportData, plReport, lineItems, calculations, loading, error]);
  
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
              <p className="text-destructive">Error loading data: {error || 'Unknown error'}</p>
              <p className="text-sm text-gray-500 mt-2">
                This might be because there's no P&L data for restaurant ID {defaultParams.restaurantIds[0]} 
                for period {defaultParams.periods[0]} in {defaultParams.year}. Try different restaurant or period.
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
                      {currentRestaurant?.name || 'PX2475'}
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Store PIC</TableCell>
                  <TableCell>
                    <span className="text-green-600 font-semibold">
                      {user?.fullName || 'Administrator'}
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Avg Weekly Sales</TableCell>
                  <TableCell>
                    <span className="text-purple-600 font-semibold">
                      {plReport?.data?.revenue?.actual ? 
                        `$${(plReport.data.revenue.actual / 4).toLocaleString()}` : 
                        'N/A'
                      }
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SSS (Same Store Sales)</TableCell>
                  <TableCell>
                    <span className="text-gray-500">
                      N/A {error && <span className="text-xs text-red-500">(Error: {error})</span>}
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SSS YTD (Same Store Sales Year-to-Date)</TableCell>
                  <TableCell>
                    {false.sssYtd !== undefined ? (
                      <span className={falsesssYtd >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {falsesssYtd.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SST% (Same Store Transactions)</TableCell>
                  <TableCell>
                    {false.sst !== undefined ? (
                      <span className={falsesst >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {falsesst.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SST YTD (Same Store Transactions Year-to-Date)</TableCell>
                  <TableCell>
                    {false.sstYtd !== undefined ? (
                      <span className={falsesstYtd >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {falsesstYtd.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cost of Goods Sold Total %</TableCell>
                  <TableCell>
                    {false.cogsPercentage !== undefined ? (
                      <span className={falsecogsPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                        {falsecogsPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">COGS YTD %</TableCell>
                  <TableCell>
                    {false.cogsYtdPercentage !== undefined ? (
                      <span className={falsecogsYtdPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                        {falsecogsYtdPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">TL (Total Labor) Actual %</TableCell>
                  <TableCell>
                    {false.laborPercentage !== undefined ? (
                      <span className={falselaborPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                        {falselaborPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">TL YTD %</TableCell>
                  <TableCell>
                    {false.laborYtdPercentage !== undefined ? (
                      <span className={falselaborYtdPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                        {falselaborYtdPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CP (Controllable Profit) %</TableCell>
                  <TableCell>
                    {false.controllableProfitPercentage !== undefined ? (
                      <span className={falsecontrollableProfitPercentage >= 15 ? 'text-green-600' : 'text-red-600'}>
                        {falsecontrollableProfitPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CP YTD %</TableCell>
                  <TableCell>
                    {false.controllableProfitYtdPercentage !== undefined ? (
                      <span className={falsecontrollableProfitYtdPercentage >= 15 ? 'text-green-600' : 'text-red-600'}>
                        {falsecontrollableProfitYtdPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">RC (Restaurant Contribution) YTD %</TableCell>
                  <TableCell>
                    {false.restaurantContributionYtdPercentage !== undefined ? (
                      <span className={falserestaurantContributionYtdPercentage >= 10 ? 'text-green-600' : 'text-red-600'}>
                        {falserestaurantContributionYtdPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Rent Min $</TableCell>
                  <TableCell>
                    {false.rentMin !== undefined ? (
                      <span className="text-purple-600">
                        ${falserentMin.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Rent %</TableCell>
                  <TableCell>
                    {false.rentPercentage !== undefined ? (
                      <span className="text-purple-600">
                        {falserentPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Rent Other $</TableCell>
                  <TableCell>
                    {false.rentOther !== undefined ? (
                      <span className="text-purple-600">
                        ${falserentOther.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Rent Total $</TableCell>
                  <TableCell>
                    {false.rentTotal !== undefined ? (
                      <span className="text-purple-600">
                        ${falserentTotal.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Overtime Hours</TableCell>
                  <TableCell>
                    {false.overtimeHours !== undefined ? (
                      <span className="text-orange-600">
                        {falseovertimeHours.toFixed(2)} hours
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                          </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Flow Thru</TableCell>
                  <TableCell>
                    {false.flowThru !== undefined ? (
                      <span className={falseflowThru >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {falseflowThru.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                          </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Adjusted Controllable Profit This Year</TableCell>
                          <TableCell>
                    {false.adjustedControllableProfitThisYear !== undefined ? (
                      <span className="text-green-600 font-semibold">
                        ${falseadjustedControllableProfitThisYear.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                          </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Adjusted Controllable Profit Last Year</TableCell>
                          <TableCell>
                    {false.adjustedControllableProfitLastYear !== undefined ? (
                      <span className="text-blue-600 font-semibold">
                        ${falseadjustedControllableProfitLastYear.toLocaleString()}
                              </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                          </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">GM Bonus</TableCell>
                          <TableCell>
                    {false.gmBonus !== undefined ? (
                      <span className={`font-semibold ${falsegmBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${falsegmBonus.toLocaleString()}
                              </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                          </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SM Bonus</TableCell>
                          <TableCell>
                    {false.smBonus !== undefined ? (
                      <span className={`font-semibold ${falsesmBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${falsesmBonus.toLocaleString()}
                              </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                          </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">AM/Chef Bonus</TableCell>
                          <TableCell>
                    {false.amChefBonus !== undefined ? (
                      <span className={`font-semibold ${falseamChefBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${falseamChefBonus.toLocaleString()}
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
