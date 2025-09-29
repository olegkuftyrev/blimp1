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

interface StorePageProps {
  params: Promise<{
    storeId: string;
  }>;
}

// Financial calendar periods (4-4-4 structure)
const PERIODS = [
  { id: 'P01', name: 'P01', quarter: 'Q1', start: '12/30', end: '1/25' },
  { id: 'P02', name: 'P02', quarter: 'Q1', start: '1/26', end: '2/22' },
  { id: 'P03', name: 'P03', quarter: 'Q1', start: '2/23', end: '3/22' },
  { id: 'P04', name: 'P04', quarter: 'Q2', start: '3/23', end: '4/19' },
  { id: 'P05', name: 'P05', quarter: 'Q2', start: '4/20', end: '5/17' },
  { id: 'P06', name: 'P06', quarter: 'Q2', start: '5/18', end: '6/14' },
  { id: 'P07', name: 'P07', quarter: 'Q3', start: '6/15', end: '7/12' },
  { id: 'P08', name: 'P08', quarter: 'Q3', start: '7/13', end: '8/9' },
  { id: 'P09', name: 'P09', quarter: 'Q3', start: '8/10', end: '9/6' },
  { id: 'P10', name: 'P10', quarter: 'Q4', start: '9/7', end: '10/4' },
  { id: 'P11', name: 'P11', quarter: 'Q4', start: '10/5', end: '11/1' },
  { id: 'P12', name: 'P12', quarter: 'Q4', start: '11/2', end: '11/29' },
  { id: 'P13', name: 'P13', quarter: 'Q4', start: '11/30', end: '12/27' },
];

// Current period is P10 (September 21, 2025)
const CURRENT_PERIOD = 'P10';

// Function to check if a period is available for upload
const isPeriodAvailable = (periodId: string, year: number): boolean => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // If it's a future year, period is not available
  if (year > currentYear) {
    return false;
  }
  
  // If it's a past year, period is available
  if (year < currentYear) {
    return true;
  }
  
  // For current year, check if period has started
  const period = PERIODS.find(p => p.id === periodId);
  if (!period) return false;
  
  // Parse period start date (format: MM/DD)
  const [month, day] = period.start.split('/').map(Number);
  const periodStartDate = new Date(currentYear, month - 1, day);
  
  // Special case for P01 which starts in previous year
  if (periodId === 'P01') {
    const p01StartDate = new Date(currentYear - 1, 11, 30); // December 30 of previous year
    return currentDate >= p01StartDate;
  }
  
  return currentDate >= periodStartDate;
};

export default function StoreYearPage({ params }: StorePageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { restaurants, loading, error } = useSWRRestaurants();
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

  useEffect(() => {
    if (user && user.role === 'associate') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (user.role === 'associate') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-gray-500">Access denied. You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-500">Loading restaurant...</p>
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
    const isCurrent = period.id === CURRENT_PERIOD && year === currentYear;
    const isAvailable = isPeriodAvailable(period.id, year);
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
          <Card className={`hover:shadow-lg cursor-pointer transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white ${isCurrent ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">
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
                <div className="text-sm text-slate-300">
                  {period.start}/{year === 2025 && period.id === 'P01' ? '24' : year} - {period.end}/{year}
                </div>
                {calculations && (
                  <div className="space-y-3">
                    {/* SSS% Card */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300">SSS%</span>
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
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
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
                        <span className="text-xs text-slate-300">Labor%</span>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${laborPercentage <= 30 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          <span className={`text-xs font-medium ${laborPercentage <= 30 ? 'text-green-400' : 'text-red-400'}`}>
                            {laborPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span>{laborPercentage <= 30 ? 'Labor costs optimized' : 'Labor costs high'}</span>
                      </div>
                    </div>

                    {/* COGS% Card */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300">COGS%</span>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${cogsPercentage <= 30 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          <span className={`text-xs font-medium ${cogsPercentage <= 30 ? 'text-green-400' : 'text-red-400'}`}>
                            {cogsPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
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
          ? 'bg-gray-800/30 border-gray-600 border-dashed text-gray-600 cursor-not-allowed opacity-60'
          : isAvailable 
            ? 'hover:shadow-lg cursor-pointer bg-gray-900/50 border-gray-700 border-dashed text-gray-500' 
            : 'bg-gray-800/30 border-gray-600 border-dashed text-gray-600 cursor-not-allowed opacity-60'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-lg ${isHourlyAssociate && isAvailable ? 'text-gray-600' : isAvailable ? 'text-gray-500' : 'text-gray-600'}`}>
              {period.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <XCircle className={`h-5 w-5 ${isHourlyAssociate && isAvailable ? 'text-gray-500' : isAvailable ? 'text-red-600' : 'text-gray-500'}`} />
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
                <div className="px-6 py-4 rounded-lg bg-gray-600 border border-gray-500 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300">Upload Restricted</p>
                      <p className="text-xs text-gray-500">Hourly associates cannot upload files</p>
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
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-500 transition-colors relative">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300">Upload files</p>
                      <p className="text-xs text-gray-500">Drag and drop or click to select files</p>
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
                    <p className="text-xs text-gray-500">.xlsx, .xls • Max 10 MB • 1 file max</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-6 py-4 rounded-lg bg-gray-600 border border-gray-500 text-center">
              <span className="text-lg font-medium text-gray-400">Period not started</span>
              <p className="text-sm text-gray-500 mt-1">
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
        <h1 className="text-3xl font-bold text-white mb-2">
          {currentStore.name}
        </h1>
        <p className="text-gray-400">
          Select a year and financial period to view reports
        </p>
      </div>

      {/* Year Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
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
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-700 text-gray-300 border-gray-600 cursor-not-allowed opacity-50'
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

      {/* Periods Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Financial Periods - {selectedYear} 
        </h2>
        
        {/* Group by quarters */}
        {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => {
          const quarterPeriods = PERIODS.filter(p => p.quarter === quarter);
          
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

            // Calculate averages for periods with data
            // For now, show placeholder averages - in real implementation you'd calculate from line items
            const avgSSS = periodsWithData > 0 ? 4.2 : 0; // Placeholder average
            const avgLabor = periodsWithData > 0 ? 28.5 : 0; // Placeholder average  
            const avgCOGS = periodsWithData > 0 ? 26.8 : 0; // Placeholder average

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
                <h3 className="text-lg font-medium text-white">{quarter}</h3>
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
