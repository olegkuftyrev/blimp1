'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContextSWR';
import { useSWRRestaurants } from '@/hooks/useSWRKitchen';
import { useAreaPlKpis, useAreaPlSummary } from '@/hooks/useAreaPL';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Loader2 } from "lucide-react";

// Default parameters for API calls
const defaultParams = {
  restaurantIds: [5], // Default to restaurant ID 5 (PX2475)
  year: 2025,
  periods: ['P06'],
  basis: 'actual',
  ytd: false
};

function AreaPlContent() {
  const { user } = useAuth();
  const { restaurants, loading: restaurantsLoading } = useSWRRestaurants();
  
  // Fetch data using Area PL hooks
  const { data: kpisData, error: kpisError, isLoading: kpisLoading } = useAreaPlKpis(defaultParams) as { 
    data: { kpis?: any } | undefined; 
    error: any; 
    isLoading: boolean 
  };
  const { data: summaryData, error: summaryError, isLoading: summaryLoading } = useAreaPlSummary(defaultParams) as { 
    data: { summary?: any } | undefined; 
    error: any; 
    isLoading: boolean 
  };
  
  // Get current restaurant info
  const currentRestaurant = restaurants?.find((r: any) => r.id === defaultParams.restaurantIds[0]);
  
  const loading = kpisLoading || summaryLoading;
  const error = kpisError || summaryError;
  
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
                      {summaryData?.summary?.netSales ? 
                        `$${(summaryData.summary.netSales / 4).toLocaleString()}` : 
                        'N/A'
                      }
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SSS (Same Store Sales)</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.sss !== undefined ? (
                      <span className={kpisData.kpis.sss >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {kpisData.kpis.sss.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SSS YTD (Same Store Sales Year-to-Date)</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.sssYtd !== undefined ? (
                      <span className={kpisData.kpis.sssYtd >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {kpisData.kpis.sssYtd.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SST% (Same Store Transactions)</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.sst !== undefined ? (
                      <span className={kpisData.kpis.sst >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {kpisData.kpis.sst.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SST YTD (Same Store Transactions Year-to-Date)</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.sstYtd !== undefined ? (
                      <span className={kpisData.kpis.sstYtd >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {kpisData.kpis.sstYtd.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cost of Goods Sold Total %</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.cogsPercentage !== undefined ? (
                      <span className={kpisData.kpis.cogsPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                        {kpisData.kpis.cogsPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">COGS YTD %</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.cogsYtdPercentage !== undefined ? (
                      <span className={kpisData.kpis.cogsYtdPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                        {kpisData.kpis.cogsYtdPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">TL (Total Labor) Actual %</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.laborPercentage !== undefined ? (
                      <span className={kpisData.kpis.laborPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                        {kpisData.kpis.laborPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">TL YTD %</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.laborYtdPercentage !== undefined ? (
                      <span className={kpisData.kpis.laborYtdPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                        {kpisData.kpis.laborYtdPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CP (Controllable Profit) %</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.controllableProfitPercentage !== undefined ? (
                      <span className={kpisData.kpis.controllableProfitPercentage >= 15 ? 'text-green-600' : 'text-red-600'}>
                        {kpisData.kpis.controllableProfitPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CP YTD %</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.controllableProfitYtdPercentage !== undefined ? (
                      <span className={kpisData.kpis.controllableProfitYtdPercentage >= 15 ? 'text-green-600' : 'text-red-600'}>
                        {kpisData.kpis.controllableProfitYtdPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">RC (Restaurant Contribution) YTD %</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.restaurantContributionYtdPercentage !== undefined ? (
                      <span className={kpisData.kpis.restaurantContributionYtdPercentage >= 10 ? 'text-green-600' : 'text-red-600'}>
                        {kpisData.kpis.restaurantContributionYtdPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Rent Min $</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.rentMin !== undefined ? (
                      <span className="text-purple-600">
                        ${kpisData.kpis.rentMin.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Rent %</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.rentPercentage !== undefined ? (
                      <span className="text-purple-600">
                        {kpisData.kpis.rentPercentage.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Rent Other $</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.rentOther !== undefined ? (
                      <span className="text-purple-600">
                        ${kpisData.kpis.rentOther.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Rent Total $</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.rentTotal !== undefined ? (
                      <span className="text-purple-600">
                        ${kpisData.kpis.rentTotal.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Overtime Hours</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.overtimeHours !== undefined ? (
                      <span className="text-orange-600">
                        {kpisData.kpis.overtimeHours.toFixed(2)} hours
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Flow Thru</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.flowThru !== undefined ? (
                      <span className={kpisData.kpis.flowThru >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {kpisData.kpis.flowThru.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Adjusted Controllable Profit This Year</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.adjustedControllableProfitThisYear !== undefined ? (
                      <span className="text-green-600 font-semibold">
                        ${kpisData.kpis.adjustedControllableProfitThisYear.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Adjusted Controllable Profit Last Year</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.adjustedControllableProfitLastYear !== undefined ? (
                      <span className="text-blue-600 font-semibold">
                        ${kpisData.kpis.adjustedControllableProfitLastYear.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">GM Bonus</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.gmBonus !== undefined ? (
                      <span className={`font-semibold ${kpisData.kpis.gmBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${kpisData.kpis.gmBonus.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SM Bonus</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.smBonus !== undefined ? (
                      <span className={`font-semibold ${kpisData.kpis.smBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${kpisData.kpis.smBonus.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">AM/Chef Bonus</TableCell>
                  <TableCell>
                    {kpisData?.kpis?.amChefBonus !== undefined ? (
                      <span className={`font-semibold ${kpisData.kpis.amChefBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${kpisData.kpis.amChefBonus.toLocaleString()}
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
