'use client';

import { useAuth } from '@/contexts/AuthContextSWR';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, ArrowLeft, CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import { useSWRRestaurants } from '@/hooks/useSWRKitchen';
import useSWR, { mutate } from 'swr';
import { apiFetch } from '@/lib/api';
import { PLCalculations } from '@/hooks/useSWRPL';
import { usePLFileUploadWithAnalytics } from '@/hooks/useAnalytics';
import { useDeletePLReport } from '@/hooks/useSWRPL';
import { EnhancedFileUpload, FileUploadItem } from '@/components/ui/enhanced-file-upload';
import { useSWRPeriods, isPeriodAvailableWithData, type PeriodInfo } from '@/hooks/useSWRPeriods';
import { usePLReports } from '@/hooks/useSWRPL';
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  CardDescription,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StorePageProps {
  params: Promise<{
    storeId: string;
  }>;
}

// Periods will be loaded from API via SWR hook

// Period availability check will be handled by the SWR hook utility function

export default function StoreYearPage({ params }: StorePageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { restaurants, loading, error } = useSWRRestaurants();
  const { periods, currentPeriod, isLoading: periodsLoading } = useSWRPeriods();
  const [selectedYear, setSelectedYear] = useState(2025); // Default to current year
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPeriod, setPendingPeriod] = useState<{period: any, year: number} | null>(null);
  const [uploadingPeriods, setUploadingPeriods] = useState<Set<string>>(new Set());
  
  // Get storeId early so we can use it in hooks
  const resolvedParams = use(params);
  const storeId = resolvedParams ? parseInt(resolvedParams.storeId) : 0;
  
  console.log('StoreYearPage render:', { resolvedParams, storeId });


  // Delete report hook
  const { deleteReport, isDeleting } = useDeletePLReport();

  // Function to handle upload for a specific period
  const handlePeriodUpload = async (file: File, period: any, year: number) => {
    const periodKey = `${period.id}-${year}`;
    
    try {
      // Mark period as uploading
      setUploadingPeriods(prev => new Set(prev).add(periodKey));
      
      // Use direct API call instead of hook
      const formData = new FormData();
      formData.append('plFile', file);
      formData.append('restaurantId', storeId.toString());
      formData.append('period', period.id);
      
      const response = await fetch('/api/pl-reports/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      // Mutate all P&L related SWR caches to refresh the UI
      console.log('🔄 Mutating SWR caches after successful upload...');
      
      // Invalidate all P&L reports caches
      await mutate(
        (key) => typeof key === 'string' && key.includes('pl-reports'),
        undefined,
        { revalidate: true }
      );
      
      // Specifically invalidate the current period cache
      await mutate(`pl-reports?restaurantId=${storeId}&period=${period.id}`);
      
      console.log('✅ SWR caches mutated successfully');
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      console.log('Error message:', error.message);
      
      // Handle specific error cases
      if (error.message?.includes('409') || error.message?.includes('Conflict')) {
        console.log('Detected 409 conflict, showing dialog');
        // Report already exists - show confirmation dialog
        setPendingFile(file);
        setPendingPeriod({ period, year });
        setConflictDialogOpen(true);
      } else {
        console.log('Not a 409 conflict, error will be shown in UI');
      }
    } finally {
      // Remove period from uploading state
      setUploadingPeriods(prev => {
        const newSet = new Set(prev);
        newSet.delete(periodKey);
        return newSet;
      });
    }
  };


  const handleOverwriteConfirm = async () => {
    if (!pendingFile || !pendingPeriod) return;
    
    try {
      // First get the existing report using SWR
      const existingReportData = await apiFetch(`pl-reports?restaurantId=${storeId}&period=${pendingPeriod.period.id}`) as {data: any[]};
      
      if (existingReportData.data && existingReportData.data.length > 0) {
        const reportId = existingReportData.data[0].id;
        
        // Delete the existing report using the SWR hook
        await deleteReport({ 
          reportId: reportId,
          mutate: async () => {
            // Invalidate all P&L related caches
            await mutate(
              (key) => typeof key === 'string' && key.includes('pl-reports'),
              undefined,
              { revalidate: true }
            );
            return Promise.resolve();
          }
        });
      }
      
      // Now upload the new file
      await handlePeriodUpload(pendingFile, pendingPeriod.period, pendingPeriod.year);
      
      setConflictDialogOpen(false);
      setPendingFile(null);
      setPendingPeriod(null);
      
    } catch (error) {
      console.error('Overwrite failed:', error);
    }
  };

  const handleOverwriteCancel = () => {
    setConflictDialogOpen(false);
    setPendingFile(null);
    setPendingPeriod(null);
  };

  // Removed role restriction - associates can now access analytics

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Associates now have access to analytics

  if (loading || periodsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-500">Loading restaurant and periods...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">{error}</p>
          <p className="text-gray-500">Failed to load restaurant</p>
        </div>
      </div>
    );
  }

  const currentStore = restaurants.find((r: any) => r.id === storeId);

  if (!currentStore) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">Restaurant not found</p>
          <Link href="/analytics" className="text-primary hover:underline">
            Back to Analytics
          </Link>
        </div>
      </div>
    );
  }

  // Generate available years (current year and next year)
  const currentYear = 2025;
  const availableYears = [currentYear, 2026];

  // Component for individual period card with its own data check
  const PeriodCard = ({ period, year, storeId }: { period: any, year: number, storeId: number }) => {
    // Check if user is hourly associate (no upload permissions)
    const isHourlyAssociate = user?.role === 'associate' || user?.['job_title'] === 'Hourly Associate';
    const { data: reportData, error: reportError, isLoading: reportLoading } = useSWR<{data: any[]}>(
      storeId && period.id && year ? `pl-reports?restaurantId=${storeId}&period=${period.id}` : null,
      apiFetch,
      {
        revalidateOnFocus: false,
        dedupingInterval: 300000, // 5 minutes
      }
    );
    
    const report = reportData?.data && reportData.data.length > 0 ? reportData.data[0] : null;
    
    const { data: lineItemsData, error: lineItemsError, isLoading: lineItemsLoading } = useSWR<{data: any[], calculations: PLCalculations}>(
      report?.id ? `pl-reports/${report.id}/line-items` : null,
      apiFetch,
      {
        revalidateOnFocus: false,
        dedupingInterval: 300000, // 5 minutes
      }
    );
    
    const hasData = !!report;
    const calculations = lineItemsData?.calculations;
    const isLoading = reportLoading || (hasData && lineItemsLoading);
    const isCurrent = period.id === currentPeriod && year === currentYear;
    const isAvailable = isPeriodAvailableWithData(period.id, year, periods);
    const isUploading = uploadingPeriods.has(`${period.id}-${year}`);
    
    // Calculate metrics for styling
    const sssValue = calculations?.sss || 0;
    const laborPercentage = (() => {
      const lineItems = lineItemsData?.data || [];
      const laborItem = lineItems.find((item: any) => item.ledgerAccount === 'Total Labor');
      return laborItem?.actualsPercentage ? parseFloat(laborItem.actualsPercentage.toString()) * 100 : 0;
    })();
    const cogsPercentage = (() => {
      const lineItems = lineItemsData?.data || [];
      const cogsItem = lineItems.find((item: any) => item.ledgerAccount === 'Cost of Goods Sold');
      return cogsItem?.actualsPercentage ? parseFloat(cogsItem.actualsPercentage.toString()) * 100 : 0;
    })();
    
    if (hasData) {
      return (
        <Link href={`/analytics/${storeId}/${year}/${period.id}`}>
          <Card className={`hover:shadow-lg cursor-pointer transition-all duration-300 relative overflow-hidden bg-card border-border ${isCurrent ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-foreground">
                  {period.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  )}
                  {isCurrent && (
                    <Badge variant="default" className="text-xs">Current</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {period.start}/{year === 2025 && period.id === 'P01' ? '24' : year} - {period.end}/{year}
                </div>
                {calculations && (
                  <div className="space-y-3">
                    {/* SSS% Card */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">SSS%</span>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${sssValue >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          {sssValue >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-400" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-400" />
                          )}
                          <span className={`text-xs font-medium ${sssValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {sssValue >= 0 ? '+' : ''}{sssValue.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        {sssValue >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                        <span>{sssValue >= 0 ? 'Strong sales growth' : 'Sales decline'}</span>
                      </div>
                    </div>

                    {/* Labor% Card */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Labor%</span>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${laborPercentage <= 30 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          <span className={`text-xs font-medium ${laborPercentage <= 30 ? 'text-green-400' : 'text-red-400'}`}>
                            {laborPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{laborPercentage <= 30 ? 'Labor costs optimized' : 'Labor costs high'}</span>
                      </div>
                    </div>

                    {/* COGS% Card */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">COGS%</span>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${cogsPercentage <= 30 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          <span className={`text-xs font-medium ${cogsPercentage <= 30 ? 'text-green-400' : 'text-red-400'}`}>
                            {cogsPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{cogsPercentage <= 30 ? 'Cost control effective' : 'Cost control needed'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      );
    }

    return (
      <Card className={`transition-all duration-300 ${isCurrent ? 'ring-2 ring-primary' : ''} ${
        isHourlyAssociate && isAvailable
          ? 'bg-muted/50 border-border border-dashed text-muted-foreground cursor-not-allowed opacity-60'
          : isAvailable 
            ? 'hover:shadow-lg cursor-pointer bg-card border-border border-dashed text-muted-foreground' 
            : 'bg-muted/50 border-border border-dashed text-muted-foreground cursor-not-allowed opacity-60'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-lg ${isHourlyAssociate && isAvailable ? 'text-muted-foreground' : isAvailable ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              {period.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <XCircle className={`h-5 w-5 ${isHourlyAssociate && isAvailable ? 'text-muted-foreground' : isAvailable ? 'text-red-600' : 'text-muted-foreground'}`} />
              {isCurrent && (
                <Badge variant="default" className="text-xs">Current</Badge>
              )}
              {isHourlyAssociate && isAvailable && (
                <Badge variant="destructive" className="text-xs">Restricted</Badge>
              )}
              {!isAvailable && (
                <Badge variant="secondary" className="text-xs">Not Started</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isAvailable ? (
            <div className="py-2">
              {isHourlyAssociate ? (
                <div className="px-6 py-4 rounded-lg bg-muted border border-border text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Upload Restricted</p>
                      <p className="text-xs text-muted-foreground">Hourly associates cannot upload files</p>
                    </div>
                  </div>
                </div>
              ) : isUploading ? (
                <div className="flex items-center justify-center py-3">
                  <div className="flex items-center gap-2 text-blue-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
                    <span className="text-sm">Uploading...</span>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-foreground/40 transition-colors relative bg-card">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Upload files</p>
                      <p className="text-xs text-muted-foreground">Drag and drop or click to select files</p>
                    </div>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handlePeriodUpload(file, period, year);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <p className="text-xs text-muted-foreground">.xlsx, .xls • Max 10 MB • 1 file max</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-6 py-4 rounded-lg bg-muted border border-border text-center">
              <span className="text-lg font-medium text-muted-foreground">Period not started</span>
              <p className="text-sm text-muted-foreground mt-1">
                Upload will be available when period begins
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/analytics" 
            className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Stores
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {currentStore.name}
        </h1>
        <p className="text-muted-foreground">
          Select a year and financial period to view reports
        </p>
      </div>

      {/* Year Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Select Year
        </h2>
        <div className="flex gap-2 flex-wrap">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => year === currentYear && setSelectedYear(year)}
              disabled={year !== currentYear}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                year === currentYear
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 cursor-pointer'
                  : 'bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50'
              }`}
            >
              {year}
              {year === currentYear && (
                <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
              )}
              {year === 2026 && (
                <Badge variant="destructive" className="ml-2 text-xs">Locked</Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Area Chart */}
      <div className="mb-8">
        <ChartAreaInteractive storeId={storeId} selectedYear={selectedYear} periods={periods} />
      </div>

      {/* Periods Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Financial Periods - {selectedYear} 
        </h2>
        
        {/* Group by quarters */}
        {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => {
          const quarterPeriods = periods.filter(p => p.quarter === quarter);
          
          // Calculate quarter averages
          const QuarterAverages = () => {
            // Fetch data for all periods in this quarter
            const periodQueries = quarterPeriods.map(period => 
              storeId && period.id && selectedYear ? `pl-reports?restaurantId=${storeId}&period=${period.id}` : null
            ).filter((url): url is string => url !== null);

            const { data: quarterReports, isLoading: reportsLoading } = useSWR<{data: any[]}[]>(
              periodQueries.length > 0 ? `quarter-${quarter}-${storeId}-${selectedYear}` : null,
              periodQueries.length > 0 ? async () => {
                const results = await Promise.all(periodQueries.map(url => apiFetch(url))) as {data: any[]}[];
                return results;
              } : null,
              {
                revalidateOnFocus: false,
                dedupingInterval: 300000,
              }
            );

            if (reportsLoading) {
              return (
                <div className="flex items-center gap-4 text-sm">
                  <div className="animate-pulse bg-gray-700 h-4 w-16 rounded"></div>
                  <div className="animate-pulse bg-gray-700 h-4 w-16 rounded"></div>
                  <div className="animate-pulse bg-gray-700 h-4 w-16 rounded"></div>
                </div>
              );
            }

            if (!quarterReports || quarterReports.length === 0) {
              return null; // Don't show anything when no data
            }

            // Get reports with data
            const reportsWithData = quarterReports.filter(report => report?.data && report.data.length > 0);
            const periodsWithData = reportsWithData.length;

            const totalPeriods = quarterPeriods.length;

            if (periodsWithData === 0) {
              return null; // Don't show anything when no periods have data
            }

            // Calculate real averages from P&L reports data
            let avgSSS = 0;
            let avgLabor = 0;
            let avgCOGS = 0;
            
            if (periodsWithData > 0) {
              // Calculate averages from actual report data
              let totalSSS = 0;
              let totalLabor = 0;
              let totalCOGS = 0;
              let validReports = 0;
              
              for (const reportData of reportsWithData) {
                const report = reportData.data[0]; // Get the first report from each period
                if (report) {
                  // Calculate SSS from Net Sales actual vs prior year
                  if (report.netSales && report.netSales > 0 && report.netSalesPriorYear && report.netSalesPriorYear > 0) {
                    const sss = ((report.netSales - report.netSalesPriorYear) / report.netSalesPriorYear) * 100;
                    totalSSS += sss;
                  }
                  
                  // Calculate Labor % from Total Labor / Net Sales
                  if (report.totalLabor && report.netSales && report.netSales > 0) {
                    const laborPct = (report.totalLabor / report.netSales) * 100;
                    totalLabor += laborPct;
                  }
                  
                  // Calculate COGS % from Cost of Goods Sold / Net Sales
                  if (report.costOfGoodsSold && report.netSales && report.netSales > 0) {
                    const cogsPct = (report.costOfGoodsSold / report.netSales) * 100;
                    totalCOGS += cogsPct;
                  }
                  
                  validReports++;
                }
              }
              
              // Calculate averages
              if (validReports > 0) {
                avgSSS = totalSSS / validReports;
                avgLabor = totalLabor / validReports;
                avgCOGS = totalCOGS / validReports;
              }
            }

            return (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">SSS:</span>
                  <span className={`font-medium ${avgSSS >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {periodsWithData > 0 ? `${avgSSS.toFixed(1)}%` : 'No data'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">Labor:</span>
                  <span className={`font-medium ${avgLabor <= 30 ? 'text-green-400' : 'text-red-400'}`}>
                    {periodsWithData > 0 ? `${avgLabor.toFixed(1)}%` : 'No data'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">COGS:</span>
                  <span className={`font-medium ${avgCOGS <= 30 ? 'text-green-400' : 'text-red-400'}`}>
                    {periodsWithData > 0 ? `${avgCOGS.toFixed(1)}%` : 'No data'}
                  </span>
                </div>
              </div>
            );
          };
          
          return (
            <div key={quarter} className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <h3 className="text-lg font-medium text-foreground">{quarter}</h3>
                <QuarterAverages />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {quarterPeriods.map((period) => (
                  <PeriodCard 
                    key={period.id} 
                    period={period} 
                    year={selectedYear} 
                    storeId={storeId} 
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>


      {/* Conflict Dialog */}
      <Dialog open={conflictDialogOpen} onOpenChange={setConflictDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Already Exists</DialogTitle>
            <DialogDescription>
              A P&L report for {pendingPeriod?.period?.name} {pendingPeriod?.year} already exists for this restaurant. 
              Do you want to replace it with the new file?
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">This action will:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Delete the existing report</li>
              <li>Upload and process the new file</li>
              <li>Replace all existing data</li>
            </ul>
            <p className="text-destructive font-medium">This action cannot be undone.</p>
          </div>
          
          <DialogFooter>
            <button
              onClick={handleOverwriteCancel}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleOverwriteConfirm}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              disabled={isDeleting}
            >
              {isDeleting ? 'Replacing...' : 'Replace Report'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Chart component with real period data

const getChartConfig = (metric: string) => {
  const configs = {
    netSales: {
      actual: {
        label: "Net Sales Actual",
        color: "#3b82f6", // blue-500
      },
      priorYear: {
        label: "Net Sales Prior Year",
        color: "#06b6d4", // cyan-500
      },
    },
    costOfGoodsSold: {
      actual: {
        label: "COGS Actual",
        color: "#ef4444", // red-500
      },
      priorYear: {
        label: "COGS Prior Year",
        color: "#f97316", // orange-500
      },
    },
    totalLabor: {
      actual: {
        label: "Total Labor Actual",
        color: "#10b981", // emerald-500
      },
      priorYear: {
        label: "Total Labor Prior Year",
        color: "#8b5cf6", // violet-500
      },
    },
    controllableProfit: {
      actual: {
        label: "Controllable Profit Actual",
        color: "#22c55e", // green-500
      },
      priorYear: {
        label: "Controllable Profit Prior Year",
        color: "#38bdf8", // sky-400
      },
    },
  };
  
  return configs[metric as keyof typeof configs] || configs.netSales;
};

export function ChartAreaInteractive({ storeId, selectedYear, periods }: { storeId: number, selectedYear: number, periods: any[] }) {
  const [selectedMetric, setSelectedMetric] = React.useState("netSales");

  // Use PL Reports hook to get all P&L data for the restaurant
  const { reports: plReportsData, loading: plReportsLoading, error: plReportsError } = usePLReports(storeId);

  console.log('=== PL REPORTS HOOK DEBUG ===');
  console.log('Store ID:', storeId);
  console.log('Selected year:', selectedYear);
  console.log('Periods:', periods);
  console.log('PL Reports data:', plReportsData);
  console.log('PL Reports loading:', plReportsLoading);
  console.log('PL Reports error:', plReportsError);
  console.log('=== END PL REPORTS HOOK DEBUG ===');

  // Create chart data from real P&L reports (showing all 13 periods)
  const chartData = React.useMemo(() => {
    console.log('=== CHART DATA CREATION ===');
    
    if (!plReportsData || !Array.isArray(plReportsData)) {
      console.log('No PL reports data available');
      return [];
    }
    
    const reports = plReportsData;
    console.log('Available reports:', reports);
    
    // Create data for all 13 periods using real P&L data
    const transformed = periods.map((period, index) => {
      // Find report for this period and year
      const report = reports.find((r: any) => 
        r.period && r.period.includes(period.id) && r.year === selectedYear
      );
      
      console.log(`Period ${period.name} (${period.id}):`, report);
      
      const getMetricValue = (metric: string, type: 'actual' | 'priorYear') => {
        switch (metric) {
          case 'netSales':
            return type === 'actual' ? (report?.netSales || 0) : (report?.netSalesPriorYear || 0);
          case 'costOfGoodsSold':
            return type === 'actual' ? (report?.costOfGoodsSold || 0) : (report?.costOfGoodsSoldPriorYear || 0);
          case 'totalLabor':
            return type === 'actual' ? (report?.totalLabor || 0) : (report?.totalLaborPriorYear || 0);
          case 'controllableProfit':
            return type === 'actual' ? (report?.controllableProfit || 0) : (report?.controllableProfitPriorYear || 0);
          default:
            return 0;
        }
      };

      return {
        period: period.name,
        actual: getMetricValue(selectedMetric, 'actual'),
        priorYear: getMetricValue(selectedMetric, 'priorYear'),
        sss: 0,
      };
    });
    
    console.log('Transformed chart data:', transformed);
    console.log('=== END CHART DATA CREATION ===');
    return transformed;
  }, [plReportsData, periods, selectedYear, selectedMetric]);

  const filteredData = chartData;

  if (plReportsLoading) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Net Sales Comparison</CardTitle>
            <CardDescription>
              Loading period data...
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Debug info
  console.log('=== CHART DATA DEBUG ===');
  console.log('Chart render:', { 
    chartData, 
    filteredData, 
    plReportsData
  });
  console.log('Full chartData array:', chartData);
  console.log('Full filteredData array:', filteredData);
  console.log('=== END CHART DATA DEBUG ===');

  if (chartData.length === 0) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Net Sales Comparison</CardTitle>
            <CardDescription>
              No data available for {selectedYear}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            <div className="text-center">
              <p>No P&L reports found for the selected year</p>
              <p className="text-sm mt-2">Periods: {periods?.length || 0}</p>
              <p className="text-sm">PL Reports: {plReportsData ? 'Available' : 'Not available'}</p>
              <p className="text-sm">Reports count: {plReportsData?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Financial Metrics Comparison</CardTitle>
          <CardDescription>
            Current year vs prior year by period
          </CardDescription>
        </div>
        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger
            className="hidden w-[180px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select metric"
          >
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="netSales" className="rounded-lg">
              Net Sales
            </SelectItem>
            <SelectItem value="costOfGoodsSold" className="rounded-lg">
              Cost of Goods Sold
            </SelectItem>
            <SelectItem value="totalLabor" className="rounded-lg">
              Total Labor
            </SelectItem>
        <SelectItem value="controllableProfit" className="rounded-lg">
          Controllable Profit
        </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={getChartConfig(selectedMetric)}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={getChartConfig(selectedMetric).actual.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={getChartConfig(selectedMetric).actual.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillPriorYear" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={getChartConfig(selectedMetric).priorYear.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={getChartConfig(selectedMetric).priorYear.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                return value;
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return value;
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="priorYear"
              type="natural"
              fill="url(#fillPriorYear)"
              stroke={getChartConfig(selectedMetric).priorYear.color}
              stackId="a"
            />
            <Area
              dataKey="actual"
              type="natural"
              fill="url(#fillActual)"
              stroke={getChartConfig(selectedMetric).actual.color}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
