'use client';

import { useAuth } from '@/contexts/AuthContextSWR';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Upload, CheckCircle, FileSpreadsheet, Trash2 } from "lucide-react";
import { useSWRRestaurants } from '@/hooks/useSWRKitchen';
import { usePLReports, usePLLineItems, useDeletePLReport, PLLineItem } from '@/hooks/useSWRPL';
import { usePLFileUploadWithAnalytics } from '@/hooks/useAnalytics';
import { mutate } from 'swr';
import { EnhancedFileUpload, FileUploadItem } from '@/components/ui/enhanced-file-upload';
import { PLReportDataTable } from '@/components/PLReportDataTable';
import { PLReportDetailedTable } from '@/components/PLReportDetailedTable';

interface PeriodReportPageProps {
  params: Promise<{
    storeId: string;
    year: string;
    period: string;
  }>;
}

export default function PeriodReportPage({ params }: PeriodReportPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { restaurants, loading, error } = useSWRRestaurants();
  
  const [resolvedParams, setResolvedParams] = useState<{
    storeId: string;
    year: string;
    period: string;
  } | null>(null);
  
  const [fileItems, setFileItems] = useState<FileUploadItem[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);
  
  useEffect(() => {
    if (user && user.role === 'associate') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Use SWR hooks for data fetching
  const { reports, loading: reportsLoading, error: reportsError } = usePLReports(
    resolvedParams ? parseInt(resolvedParams.storeId) : undefined,
    resolvedParams?.period || undefined
  );
  
  const plReport = reports?.length > 0 ? reports[0] : null;
  
  const { lineItems, loading: lineItemsLoading, error: lineItemsError } = usePLLineItems(
    plReport?.id || undefined
  );
  
  const plLineItems = plReport?.lineItems || lineItems || [];

  // Get store info for display
  const currentStore = restaurants?.find((r: any) => r.id === (resolvedParams ? parseInt(resolvedParams.storeId) : 0));
  
  // Use conditional hook calls only after all state is declared
  const {
    files,
    isUploading,
    progress,
    error: uploadError,
    success: uploadSuccess,
    setFiles,
    uploadPLFile,
    removeFile,
    reset
  } = usePLFileUploadWithAnalytics(
    resolvedParams ? parseInt(resolvedParams.storeId) : 0,
    resolvedParams ? parseInt(resolvedParams.year) : 0,
    resolvedParams?.period || ''
  );

  // Delete report hook
  const { deleteReport, isDeleting, deleteError } = useDeletePLReport();

  // Handle delete report
  const handleDeleteReport = async () => {
    if (!plReport?.id) return;
    
    try {
      await deleteReport({ 
        reportId: plReport.id,
        mutate: async () => {
          // Invalidate all P&L related caches to ensure UI updates
          await mutate(
            (key) => typeof key === 'string' && key.includes('pl-reports'),
            undefined,
            { revalidate: true }
          );
          
          // Also invalidate the specific period cache
          await mutate(`pl-reports?restaurantId=${storeId}&period=${period}`);
          
          return Promise.resolve();
        }
      });
      
      // Close dialog and navigate back to the store page after successful deletion
      setShowDeleteDialog(false);
      router.push(`/analytics/${storeId}`);
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  if (!resolvedParams) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  const storeId = parseInt(resolvedParams.storeId);
  const year = parseInt(resolvedParams.year);
  const period = resolvedParams.period;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-muted-foreground">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-destructive">Error loading restaurants: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!currentStore) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">Restaurant not found</p>
          <Link href="/analytics" className="text-primary hover:underline">
            ← Back to Analytics
          </Link>
        </div>
      </div>
    );
  }

  const handleFilesChange = (newFiles: FileUploadItem[]) => {
    setFileItems(newFiles);
    setFiles(newFiles.map(f => f.file));
  };

  const handleUpload = async () => {
    if (fileItems.length === 0 || !resolvedParams) return;
    
    try {
      await uploadPLFile(fileItems[0].file);
      
      // Mutate all P&L related SWR caches to refresh the UI
      console.log('🔄 Mutating SWR caches after successful upload...');
      
      // Invalidate all P&L reports caches
      await mutate(
        (key) => typeof key === 'string' && key.includes('pl-reports'),
        undefined,
        { revalidate: true }
      );
      
      // Specifically invalidate the current period cache
      await mutate(`pl-reports?restaurantId=${resolvedParams.storeId}&period=${resolvedParams.period}`);
      
      // Also invalidate line items cache
      if (plReport?.id) {
        await mutate(`pl-reports/${plReport.id}/line-items`);
      }
      
      console.log('✅ SWR caches mutated successfully');
      
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const index = fileItems.findIndex(f => f.id === fileId);
    if (index !== -1) {
      const newFiles = fileItems.filter((_, i) => i !== index);
      setFileItems(newFiles);
      removeFile(index);
    }
  };

  const handleClear = () => {
    setFileItems([]);
    reset();
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
          <Link href="/analytics" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{currentStore.name}</h1>
            <p className="text-muted-foreground">
              P&L Report - {period} {year}
            </p>
          </div>
          </div>
          
          {/* Delete Report Button */}
          {plReport && (
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete P&L Report</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this P&L report for {currentStore.name} - {period} {year}?
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteReport}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Report'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Testing Table - Mock Data for Calculations */}
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
                <TableCell className="font-medium">SSS (Same Store Sales)</TableCell>
                <TableCell>
                  {(() => {
                    // Find Net Sales data from plLineItems
                    const netSalesItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Net Sales');
                    
                    if (netSalesItem && netSalesItem.actuals && netSalesItem.priorYear) {
                      const actualNetSales = parseFloat(netSalesItem.actuals.toString());
                      const priorYearNetSales = parseFloat(netSalesItem.priorYear.toString());
                      
                      if (priorYearNetSales !== 0) {
                        const sss = ((actualNetSales - priorYearNetSales) / priorYearNetSales) * 100;
                        const color = sss >= 0 ? 'text-green-600' : 'text-red-600';
                        return (
                          <span className={color}>
                            {sss.toFixed(2)}%
                          </span>
                        );
                      }
                    }
                    
                    // Fallback if no real data available
                    return <span className="text-gray-500">No calculation available</span>;
                  })()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">SST% (Same Store Transactions)</TableCell>
                <TableCell>
                  {(() => {
                    // Find Total Transactions data from plLineItems
                    const transactionsItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Total Transactions');
                    
                    if (transactionsItem && transactionsItem.actuals && transactionsItem.priorYear) {
                      const actualTransactions = parseFloat(transactionsItem.actuals.toString());
                      const priorYearTransactions = parseFloat(transactionsItem.priorYear.toString());
                      
                      if (priorYearTransactions !== 0) {
                        const sst = ((actualTransactions - priorYearTransactions) / priorYearTransactions) * 100;
                        const color = sst >= 0 ? 'text-green-600' : 'text-red-600';
                        return (
                          <span className={color}>
                            {sst.toFixed(2)}%
                          </span>
                        );
                      }
                    }
                    
                    // Fallback if no real data available
                    return <span className="text-gray-500">No calculation available</span>;
                  })()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Prime Cost</TableCell>
                <TableCell>
                  {(() => {
                    // Find COGS and Total Labor data from plLineItems
                    const cogsItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Cost of Goods Sold');
                    const laborItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Total Labor');
                    
                    if (cogsItem && laborItem && 
                        cogsItem.actualsPercentage && laborItem.actualsPercentage) {
                      
                      const cogsPercentage = parseFloat(cogsItem.actualsPercentage.toString());
                      const laborPercentage = parseFloat(laborItem.actualsPercentage.toString());
                      const primeCost = cogsPercentage + laborPercentage;
                      
                      return (
                        <span className="text-blue-600">
                          {primeCost.toFixed(2)}%
                        </span>
                      );
                    }
                    
                    // Fallback if no real data available
                    return <span className="text-gray-500">No calculation available</span>;
                  })()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Rent Total</TableCell>
                <TableCell>
                  {(() => {
                    // Find all rent components from plLineItems
                    const rentMinItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Rent - MIN');
                    const rentStorageItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Rent - Storage');
                    const rentPercentItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Rent - Percent');
                    const rentOtherItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Rent - Other');
                    const rentDeferredItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Rent - Deferred Preopening');
                    
                    if (rentMinItem || rentStorageItem || rentPercentItem || rentOtherItem || rentDeferredItem) {
                      const rentMin = parseFloat(rentMinItem?.actuals?.toString() || '0');
                      const rentStorage = parseFloat(rentStorageItem?.actuals?.toString() || '0');
                      const rentPercent = parseFloat(rentPercentItem?.actuals?.toString() || '0');
                      const rentOther = parseFloat(rentOtherItem?.actuals?.toString() || '0');
                      const rentDeferred = parseFloat(rentDeferredItem?.actuals?.toString() || '0');
                      
                      const rentTotal = rentMin + rentStorage + rentPercent + rentOther + rentDeferred;
                      
                      return (
                        <span className="text-purple-600">
                          ${rentTotal.toLocaleString()}
                        </span>
                      );
                    }
                    
                    // Fallback if no real data available
                    return <span className="text-gray-500">No calculation available</span>;
                  })()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Overtime Hours</TableCell>
                <TableCell>
                  {(() => {
                    // Find Overtime Hours and Average Hourly Wage data from plLineItems
                    const overtimeHoursItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Overtime Hours');
                    const averageWageItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Average Hourly Wage');
                    
                    if (overtimeHoursItem && averageWageItem && 
                        overtimeHoursItem.actuals && averageWageItem.actuals) {
                      
                      const overtimeHours = parseFloat(overtimeHoursItem.actuals.toString());
                      const averageWage = parseFloat(averageWageItem.actuals.toString());
                      
                      if (averageWage !== 0) {
                        const overtimeCost = overtimeHours / averageWage;
                        
                        return (
                          <span className="text-orange-600">
                            {overtimeCost.toFixed(2)} hours
                          </span>
                        );
                      }
                    }
                    
                    // Fallback if no real data available
                    return <span className="text-gray-500">No calculation available</span>;
                  })()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Flow Thru</TableCell>
                <TableCell>
                  {(() => {
                    // Find Net Sales and Controllable Profit data from plLineItems
                    const netSalesItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Net Sales');
                    const controllableProfitItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Controllable Profit');
                    
                    if (netSalesItem && controllableProfitItem && 
                        netSalesItem.actuals && netSalesItem.priorYear &&
                        controllableProfitItem.actuals && controllableProfitItem.priorYear) {
                      
                      const actualNetSales = parseFloat(netSalesItem.actuals.toString());
                      const priorYearNetSales = parseFloat(netSalesItem.priorYear.toString());
                      const actualControllableProfit = parseFloat(controllableProfitItem.actuals.toString());
                      const priorYearControllableProfit = parseFloat(controllableProfitItem.priorYear.toString());
                      
                      const netSalesDiff = actualNetSales - priorYearNetSales;
                      
                      if (netSalesDiff !== 0) {
                        const flowThru = (actualControllableProfit - priorYearControllableProfit) / netSalesDiff;
                        const color = flowThru >= 0 ? 'text-green-600' : 'text-red-600';
                        return (
                          <span className={color}>
                            {flowThru.toFixed(2)}
                          </span>
                        );
                      }
                    }
                    
                    // Fallback if no real data available
                    return <span className="text-gray-500">No calculation available</span>;
                  })()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Adjusted Controllable Profit</TableCell>
                <TableCell>
                  {(() => {
                    // Find CP, Bonus, and Workers Comp data from plLineItems
                    const controllableProfitItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Controllable Profit');
                    const bonusItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Bonus');
                    const workersCompItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Workers Comp');
                    
                    if (controllableProfitItem && bonusItem && workersCompItem) {
                      // Calculate This Year (Actual)
                      const actualCP = parseFloat(controllableProfitItem.actuals?.toString() || '0');
                      const actualBonus = parseFloat(bonusItem.actuals?.toString() || '0');
                      const actualWorkersComp = parseFloat(workersCompItem.actuals?.toString() || '0');
                      const adjustedCPThisYear = actualCP + actualBonus + actualWorkersComp;
                      
                      // Calculate Last Year (Prior)
                      const priorCP = parseFloat(controllableProfitItem.priorYear?.toString() || '0');
                      const priorBonus = parseFloat(bonusItem.priorYear?.toString() || '0');
                      const priorWorkersComp = parseFloat(workersCompItem.priorYear?.toString() || '0');
                      const adjustedCPLastYear = priorCP + priorBonus + priorWorkersComp;
                      
                      return (
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">This Year:</span> 
                            <span className="ml-2 text-green-600">${adjustedCPThisYear.toLocaleString()}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Last Year:</span> 
                            <span className="ml-2 text-blue-600">${adjustedCPLastYear.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    }
                    
                    // Fallback if no real data available
                    return <span className="text-gray-500">No calculation available</span>;
                  })()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Bonus Calculations</TableCell>
                <TableCell>
                  {(() => {
                    // Find CP, Bonus, and Workers Comp data to calculate Adjusted CP
                    const controllableProfitItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Controllable Profit');
                    const bonusItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Bonus');
                    const workersCompItem = plLineItems?.find((item: PLLineItem) => item.ledgerAccount === 'Workers Comp');
                    
                    if (controllableProfitItem && bonusItem && workersCompItem) {
                      // Calculate Adjusted Controllable Profit This Year (ACPTY)
                      const actualCP = parseFloat(controllableProfitItem.actuals?.toString() || '0');
                      const actualBonus = parseFloat(bonusItem.actuals?.toString() || '0');
                      const actualWorkersComp = parseFloat(workersCompItem.actuals?.toString() || '0');
                      const ACPTY = actualCP + actualBonus + actualWorkersComp;
                      
                      // Calculate Adjusted Controllable Profit Last Year (ACPLY)
                      const priorCP = parseFloat(controllableProfitItem.priorYear?.toString() || '0');
                      const priorBonus = parseFloat(bonusItem.priorYear?.toString() || '0');
                      const priorWorkersComp = parseFloat(workersCompItem.priorYear?.toString() || '0');
                      const ACPLY = priorCP + priorBonus + priorWorkersComp;
                      
                      // Calculate bonuses
                      const difference = ACPTY - ACPLY;
                      const gmBonus = difference * 0.20;
                      const smBonus = difference * 0.15;
                      const amChefBonus = difference * 0.10;
                      
                      return (
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">GM Bonus:</span> 
                            <span className={`ml-2 ${gmBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${gmBonus.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">SM Bonus:</span> 
                            <span className={`ml-2 ${smBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${smBonus.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">AM/Chef Bonus:</span> 
                            <span className={`ml-2 ${amChefBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${amChefBonus.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    
                    // Fallback if no real data available
                    return <span className="text-gray-500">No calculation available</span>;
                  })()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ready to Use Table - Real Data */}
      {plReport && plLineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Ready to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <PLReportDataTable 
              report={plReport} 
              lineItems={plLineItems.filter((item: PLLineItem) => 
                item.ledgerAccount === 'Net Sales' ||
                item.ledgerAccount === 'Gross Sales' ||
                item.ledgerAccount === 'Total Labor' ||
                item.ledgerAccount === 'Direct Labor' ||
                item.ledgerAccount === 'Management Labor' ||
                item.ledgerAccount === 'Taxes and Benefits' ||
                item.ledgerAccount === 'Total Transactions' ||
                item.ledgerAccount === 'Check Avg - Net' ||
                item.ledgerAccount === 'Cost of Goods Sold' ||
                item.ledgerAccount === 'Controllable Profit' ||
                item.ledgerAccount === 'Restaurant Contribution' ||
                item.ledgerAccount === 'Cashflow' ||
                item.ledgerAccount === 'Amortization' ||
                item.ledgerAccount === 'Depreciation' ||
                item.ledgerAccount === 'Fixed Costs' ||
                item.ledgerAccount === 'Average Hourly Wage' ||
                item.ledgerAccount === 'Workers Comp'
              )} 
            />
          </CardContent>
        </Card>
      )}

      {/* File Upload - Only show when no report exists */}
      {!plReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload P&L Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <EnhancedFileUpload
                files={fileItems}
                onFilesChange={handleFilesChange}
                onUpload={handleUpload}
                onRemove={handleRemoveFile}
                onClear={handleClear}
                isUploading={isUploading}
                maxFiles={1}
                maxSize={10 * 1024 * 1024} // 10MB
                acceptedTypes={['.xlsx', '.xls']}
                disabled={isUploading}
              />
              
              {uploadError && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  Upload failed: {uploadError}
                </div>
              )}
              
              {uploadSuccess && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Report uploaded successfully! The page will refresh automatically.
                </div>
              )}
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium">File Requirements:</p>
                <p>• Excel file must contain P&L data with proper structure</p>
                <p>• Required columns: Actuals, Plan, Prior Year</p>
                <p>• File format: .xlsx or .xls</p>
                <p>• Maximum file size: 10MB</p>
                <p>• File will be processed automatically after upload</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Table */}
      {plReport && plLineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <PLReportDataTable 
              report={plReport} 
              lineItems={plLineItems.filter((item: PLLineItem) => 
                item.ledgerAccount === 'Food Sales' || 
                item.ledgerAccount === 'Drink Sales' || 
                item.ledgerAccount === 'Retail Sales' || 
                item.ledgerAccount === 'Gross Sales' ||
                item.ledgerAccount === 'Promotions' ||
                item.ledgerAccount === 'Employee Meals' ||
                item.ledgerAccount === '20% Emp Discount' ||
                item.ledgerAccount === 'Coupons/Promotions' ||
                item.ledgerAccount === 'Net Sales'
              )} 
            />
          </CardContent>
        </Card>
      )}

      {/* Cost Of Sales Table */}
      {plReport && plLineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cost Of Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <PLReportDataTable 
              report={plReport} 
              lineItems={plLineItems.filter((item: PLLineItem) => 
                item.ledgerAccount === 'Grocery' || 
                item.ledgerAccount === 'Meat' || 
                item.ledgerAccount === 'Produce' || 
                item.ledgerAccount === 'Sea Food' ||
                item.ledgerAccount === 'DRinks' ||
                item.ledgerAccount === 'Paper Goods' ||
                item.ledgerAccount === 'Other' ||
                item.ledgerAccount === 'Cost of Goods Sold'
              )} 
            />
          </CardContent>
        </Card>
      )}

      {/* Labor Table */}
      {plReport && plLineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Labor</CardTitle>
          </CardHeader>
          <CardContent>
            <PLReportDataTable 
              report={plReport} 
              lineItems={plLineItems.filter((item: PLLineItem) => 
                item.ledgerAccount === 'Labor' || 
                item.ledgerAccount === 'Front' || 
                item.ledgerAccount === 'Back' || 
                item.ledgerAccount === 'Overtime' ||
                item.ledgerAccount === 'Training Wages' ||
                item.ledgerAccount === 'Emergency Store Closure Pay' ||
                item.ledgerAccount === 'Direct Labor' ||
                item.ledgerAccount === 'GM Salaries' ||
                item.ledgerAccount === 'GM Overtime' ||
                item.ledgerAccount === 'Other MGMT Salaries' ||
                item.ledgerAccount === 'Other MGMT Overtime' ||
                item.ledgerAccount === 'Guaranteed Hourly' ||
                item.ledgerAccount === 'Bereavement Pay' ||
                item.ledgerAccount === 'Guaranteed Overtime' ||
                item.ledgerAccount === 'Management Labor' ||
                item.ledgerAccount === 'Payroll Taxes' ||
                item.ledgerAccount === 'Meal break Premium' ||
                item.ledgerAccount === 'Rest Break Premium' ||
                item.ledgerAccount === 'Scheduling Premium Pay' ||
                item.ledgerAccount === 'Workers Comp' ||
                item.ledgerAccount === 'Benefits' ||
                item.ledgerAccount === 'Bonus' ||
                item.ledgerAccount === 'Vacation' ||
                item.ledgerAccount === 'Taxes and Benefits' ||
                item.ledgerAccount === 'Total Labor'
              )} 
            />
          </CardContent>
        </Card>
      )}

      {/* Controllables Table */}
      {plReport && plLineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Controllables</CardTitle>
          </CardHeader>
          <CardContent>
            <PLReportDataTable 
              report={plReport} 
              lineItems={plLineItems.filter((item: PLLineItem) => 
                item.ledgerAccount === 'Controllables' || 
                item.ledgerAccount === 'Third Party Delivery Fee' || 
                item.ledgerAccount === 'Credit Card Fees' || 
                item.ledgerAccount === 'Broadband' ||
                item.ledgerAccount === 'Electricity' ||
                item.ledgerAccount === 'Gas' ||
                item.ledgerAccount === 'Telephone' ||
                item.ledgerAccount === 'Waste Disposal' ||
                item.ledgerAccount === 'Water' ||
                item.ledgerAccount === 'Computer Software Expense' ||
                item.ledgerAccount === 'Office and Computer Supplies' ||
                item.ledgerAccount === 'Education and Training Other' ||
                item.ledgerAccount === 'Recruitment' ||
                item.ledgerAccount === 'Professional Services' ||
                item.ledgerAccount === 'Travel Expenses' ||
                item.ledgerAccount === 'Bank Fees' ||
                item.ledgerAccount === 'Dues and Subscriptions' ||
                item.ledgerAccount === 'Moving and Relocation Expenses' ||
                item.ledgerAccount === 'Other Expenses' ||
                item.ledgerAccount === 'Postage and Courier Service' ||
                item.ledgerAccount === 'Repairs' ||
                item.ledgerAccount === 'Maintenance' ||
                item.ledgerAccount === 'Restaurant Expenses' ||
                item.ledgerAccount === 'Restaurant Supplies' ||
                item.ledgerAccount === 'Total Controllables'
              )} 
            />
          </CardContent>
        </Card>
      )}

      {/* Controllable Profit Table */}
      {plReport && plLineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Controllable Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <PLReportDataTable 
              report={plReport} 
              lineItems={plLineItems.filter((item: PLLineItem) => 
                item.ledgerAccount === 'Profit Before Adv' || 
                item.ledgerAccount === 'Advertising' || 
                item.ledgerAccount === 'Corporate Advertising' || 
                item.ledgerAccount === 'Media' ||
                item.ledgerAccount === 'Local Store Marketing' ||
                item.ledgerAccount === 'Grand Opening' ||
                item.ledgerAccount === 'Lease Marketing' ||
                item.ledgerAccount === 'Advertising' ||
                item.ledgerAccount === 'Controllable Profit'
              )} 
            />
          </CardContent>
        </Card>
      )}

      {/* Fixed Costs Table */}
      {plReport && plLineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fixed Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <PLReportDataTable 
              report={plReport} 
              lineItems={plLineItems.filter((item: PLLineItem) => 
                item.ledgerAccount === 'Fixed Costs' || 
                item.ledgerAccount === 'Rent - MIN' || 
                item.ledgerAccount === 'Rent - Storage' || 
                item.ledgerAccount === 'Rent - Percent' ||
                item.ledgerAccount === 'Rent - Other' ||
                item.ledgerAccount === 'Rent - Deferred Preopening' ||
                item.ledgerAccount === 'Insurance' ||
                item.ledgerAccount === 'Taxes' ||
                item.ledgerAccount === 'License and Fees' ||
                item.ledgerAccount === 'Amortization' ||
                item.ledgerAccount === 'Depreciation' ||
                item.ledgerAccount === 'Total Fixed Cost'
              )} 
            />
          </CardContent>
        </Card>
      )}

      {/* RC&Cash Flow Table */}
      {plReport && plLineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>RC&Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <PLReportDataTable 
              report={plReport} 
              lineItems={plLineItems.filter((item: PLLineItem) => 
                item.ledgerAccount === 'Restaurant Contribution' ||
                item.ledgerAccount === 'Cashflow'
              )} 
            />
          </CardContent>
        </Card>
      )}

      {/* Sales Data Statistics Table */}
      {plReport && plLineItems.length > 0 && (
          <Card>
            <CardHeader>
            <CardTitle>Sales Data Statistics</CardTitle>
            </CardHeader>
            <CardContent>
            <PLReportDataTable 
              report={plReport} 
              lineItems={plLineItems.filter((item: PLLineItem) => 
                item.ledgerAccount === 'Total Transactions' || 
                item.ledgerAccount === 'Check Avg - Net' || 
                item.ledgerAccount === 'Fundraising Events Sales' || 
                item.ledgerAccount === 'Virtual Fundraising Sales' ||
                item.ledgerAccount === 'Catering Sales' ||
                item.ledgerAccount === 'Panda Digital Sales' ||
                item.ledgerAccount === '3rd Party Digital Sales' ||
                item.ledgerAccount === 'Reward Redemptions' ||
                item.ledgerAccount === 'Daypart & Sales Channel %' ||
                item.ledgerAccount === 'Breakfast %' ||
                item.ledgerAccount === 'Lunch %' ||
                item.ledgerAccount === 'Afternoon %' ||
                item.ledgerAccount === 'Evening %' ||
                item.ledgerAccount === 'Dinner %' ||
                item.ledgerAccount === 'Dine In %' ||
                item.ledgerAccount === 'Take Out %' ||
                item.ledgerAccount === 'Drive Thru %' ||
                item.ledgerAccount === '3rd Party Digital %' ||
                item.ledgerAccount === 'Panda Digital %' ||
                item.ledgerAccount === 'In Store Catering %'
              )} 
            />
            </CardContent>
          </Card>
      )}

      {/* Labor Statistics Table */}
      {plReport && plLineItems.length > 0 && (
          <Card>
          <CardHeader>
            <CardTitle>Labor Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <PLReportDataTable 
              report={plReport} 
              lineItems={plLineItems.filter((item: PLLineItem) => 
                item.ledgerAccount === 'Direct Labor Hours Total' || 
                item.ledgerAccount === 'Average Hourly Wage' || 
                item.ledgerAccount === 'Direct Labor Hours' || 
                item.ledgerAccount === 'Overtime Hours' ||
                item.ledgerAccount === 'Training Hours' ||
                item.ledgerAccount === 'Guaranteed Hours' ||
                item.ledgerAccount === 'Management Hours' ||
                item.ledgerAccount === 'Direct Hours Productivity' ||
                item.ledgerAccount === 'Total Hours Productivity' ||
                item.ledgerAccount === 'Direct Hours Transaction Productivity' ||
                item.ledgerAccount === 'Total Hours Transaction Productivity' ||
                item.ledgerAccount === 'Management Headcount' ||
                item.ledgerAccount === 'Assistant Manager Headcount' ||
                item.ledgerAccount === 'Chef Headcount'
              )} 
            />
            </CardContent>
          </Card>
      )}

      {/* PSA Table */}
      {plReport && plLineItems.length > 0 && (
          <Card>
          <CardHeader>
            <CardTitle>PSA</CardTitle>
          </CardHeader>
          <CardContent>
            <PLReportDataTable 
              report={plReport} 
              lineItems={plLineItems.filter((item: PLLineItem) => 
                item.ledgerAccount === 'PSA - Per Store Average' || 
                item.ledgerAccount === 'Store Period' || 
                item.ledgerAccount === 'PSA - Transactions' || 
                item.ledgerAccount === 'PSA - Net Sales' ||
                item.ledgerAccount === 'PSA - Total Labor' ||
                item.ledgerAccount === 'PSA - Controllables' ||
                item.ledgerAccount === 'PSA - Control Profit' ||
                item.ledgerAccount === 'PSA - Fixed Costs' ||
                item.ledgerAccount === 'PSA - Rests Contribution' ||
                item.ledgerAccount === 'PSA - Cash Flow'
              )} 
            />
            </CardContent>
          </Card>
        )}
    </div>
  );
}