'use client';

import { useAuth } from '@/contexts/AuthContextSWR';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, CheckCircle, FileSpreadsheet } from "lucide-react";
import { useSWRRestaurants } from '@/hooks/useSWRKitchen';
import { usePLFileUploadWithAnalytics } from '@/hooks/useAnalytics';
import { usePLReports, usePLLineItems } from '@/hooks/useSWRPL';
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
    if (fileItems.length === 0) return;
    
    try {
      await uploadPLFile(fileItems[0].file);
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
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
      </div>

      <div className="space-y-6">
        {/* File Upload */}
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

        {/* Sales Table */}
        {plReport && plLineItems.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <PLReportDataTable 
                report={plReport} 
                lineItems={plLineItems.filter(item => 
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
        ) : null}

        {/* Cost Of Sales Table */}
        {plReport && plLineItems.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Cost Of Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <PLReportDataTable 
                report={plReport} 
                lineItems={plLineItems.filter(item => 
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
        ) : null}

        {/* Labor Table */}
        {plReport && plLineItems.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Labor</CardTitle>
            </CardHeader>
            <CardContent>
              <PLReportDataTable 
                report={plReport} 
                lineItems={plLineItems.filter(item => 
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
        ) : null}

        {/* Controllables Table */}
        {plReport && plLineItems.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Controllables</CardTitle>
            </CardHeader>
            <CardContent>
              <PLReportDataTable 
                report={plReport} 
                lineItems={plLineItems.filter(item => 
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
        ) : null}

        {/* Controllable Profit Table */}
        {plReport && plLineItems.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Controllable Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <PLReportDataTable 
                report={plReport} 
                lineItems={plLineItems.filter(item => 
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
        ) : null}

        {/* Fixed Costs Table */}
        {plReport && plLineItems.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Fixed Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <PLReportDataTable 
                report={plReport} 
                lineItems={plLineItems.filter(item => 
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
        ) : null}

        {/* RC&Cash Flow Table */}
        {plReport && plLineItems.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>RC&Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <PLReportDataTable 
                report={plReport} 
                lineItems={plLineItems.filter(item => 
                  item.ledgerAccount === 'Restaurant Contribution' ||
                  item.ledgerAccount === 'Cashflow'
                )} 
              />
            </CardContent>
          </Card>
        ) : null}

        {/* Sales Data Statistics Table */}
        {plReport && plLineItems.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Sales Data Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <PLReportDataTable 
                report={plReport} 
                lineItems={plLineItems.filter(item => 
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
        ) : null}

        {/* Labor Statistics Table */}
        {plReport && plLineItems.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Labor Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <PLReportDataTable 
                report={plReport} 
                lineItems={plLineItems.filter(item => 
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
        ) : null}

        {/* PSA Table */}
        {plReport && plLineItems.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>PSA</CardTitle>
            </CardHeader>
            <CardContent>
              <PLReportDataTable 
                report={plReport} 
                lineItems={plLineItems.filter(item => 
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
        ) : null}

      </div>
    </div>
  );
}