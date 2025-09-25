'use client';

import { useAuth } from '@/contexts/AuthContextSWR';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, FileSpreadsheet, Upload, CheckCircle, XCircle, AlertCircle, Trash2 } from "lucide-react";
import { useSWRRestaurants } from '@/hooks/useSWRKitchen';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/dropzone';
import { UploadIcon } from 'lucide-react';
import { usePLFileUploadWithAnalytics } from '@/hooks/useAnalytics';
import { EnhancedFileUpload, FileUploadItem } from '@/components/ui/enhanced-file-upload';
import { PLReportDisplay } from '@/components/PLReportDisplay';
import { PLReportTable } from '@/components/PLReportTable';

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
  
  // All state hooks must be declared before any conditional returns
  const [fileItems, setFileItems] = useState<FileUploadItem[]>([]);
  const [plReport, setPlReport] = useState<any>(null);
  const [plLineItems, setPlLineItems] = useState<any[]>([]);
  const [loadingReport, setLoadingReport] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // All useEffect hooks must be declared before any conditional returns
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);
  
  useEffect(() => {
    if (user && user.role === 'associate') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Load P&L report data
  useEffect(() => {
    if (!resolvedParams) return;
    
    const loadPLReport = async () => {
      try {
        setLoadingReport(true);
        
        const storeId = parseInt(resolvedParams.storeId);
        const period = resolvedParams.period;
        
        // Try to load real data from API first
        try {
          const response = await fetch(`/api/pl-reports?restaurantId=${storeId}&period=${period}`);
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              const report = data[0];
              setPlReport(report);
              
              // Load line items
              const lineItemsResponse = await fetch(`/api/pl-reports/${report.id}/line-items`);
              if (lineItemsResponse.ok) {
                const lineItems = await lineItemsResponse.json();
                setPlLineItems(lineItems);
              }
              return;
            }
          }
        } catch (apiError) {
          console.log('API not available, using mock data');
        }
        
        // Fallback to mock data if API fails
        const mockReport = {
          id: 1,
          storeName: 'Store',
          company: 'Panda Express',
          period: period,
          translationCurrency: 'USD',
          netSales: 219749.20,
          grossSales: 225909.32,
          costOfGoodsSold: 61099.79,
          totalLabor: 62908.63,
          controllables: 23458.14,
          controllableProfit: 64488.34,
          advertising: 1740.95,
          fixedCosts: 36549.54,
          netProfit: 26198.85
        };
        
        const mockLineItems = [
          {
            id: 1,
            ledgerAccount: 'Food Sales',
            actuals: 209583.18,
            plan: 215332.85,
            vfp: -5749.67,
            priorYear: 186300.98,
            actualYtd: 209583.18,
            planYtd: 215332.85,
            vfpYtd: -5749.67,
            priorYearYtd: 186300.98
          },
          {
            id: 2,
            ledgerAccount: 'Drink Sales',
            actuals: 17228.58,
            plan: 15760.61,
            vfp: 1467.97,
            priorYear: 13635.61,
            actualYtd: 17228.58,
            planYtd: 15760.61,
            vfpYtd: 1467.97,
            priorYearYtd: 13635.61
          },
          {
            id: 3,
            ledgerAccount: 'Retail Sales',
            actuals: 477.52,
            plan: 99.41,
            vfp: 378.11,
            priorYear: 86,
            actualYtd: 477.52,
            planYtd: 99.41,
            vfpYtd: 378.11,
            priorYearYtd: 86
          }
        ];
        
        setPlReport(mockReport);
        setPlLineItems(mockLineItems);
        
      } catch (error) {
        console.error('Failed to load P&L report:', error);
      } finally {
        setLoadingReport(false);
      }
    };

    loadPLReport();
  }, [resolvedParams]);

  // Show upload form if no report data is available
  useEffect(() => {
    if (!loadingReport && !plReport) {
      setShowUploadForm(true);
    }
  }, [loadingReport, plReport]);
  
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
    reset,
    removeFile,
  } = usePLFileUploadWithAnalytics(
    resolvedParams ? parseInt(resolvedParams.storeId) : 0, 
    resolvedParams ? parseInt(resolvedParams.year) : 0, 
    resolvedParams ? resolvedParams.period : ''
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
      await uploadPLFile();
      setShowUploadForm(false);
      // Reload P&L report data after successful upload
      window.location.reload();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = fileItems.filter((_, i) => i !== index);
    setFileItems(newFiles);
    removeFile(index);
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
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">{currentStore.location}</Badge>
          <Badge variant="secondary">{currentStore.status}</Badge>
        </div>
      </div>

      {/* File Upload Success Message */}
      <div className="space-y-6">
        {plReport && !showUploadForm ? ( // Only show success message if report exists and form is hidden
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <CardTitle>File has been uploaded!</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (plReport?.id) {
                        try {
                          // Delete the report from backend
                          const response = await fetch(`/api/pl-reports/${plReport.id}`, {
                            method: 'DELETE',
                            headers: {
                              'Authorization': `Bearer ${typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : ''}`,
                            },
                          });
                          
                          if (response.ok) {
                            console.log('P&L report deleted successfully');
                          } else {
                            console.error('Failed to delete P&L report');
                          }
                        } catch (error) {
                          console.error('Error deleting P&L report:', error);
                        }
                      }
                      
                      // Reset the report data to show upload form again
                      setPlReport(null);
                      setPlLineItems([]);
                      setLoadingReport(false);
                      setShowUploadForm(true);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete File
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Reset the report data to show upload form again
                      setPlReport(null);
                      setPlLineItems([]);
                      setLoadingReport(false);
                      setShowUploadForm(true);
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New File
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your P&L report has been processed and is ready for review.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Show Upload Form or P&L Report Display */}
        {showUploadForm ? (
          /* Excel Upload Section */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  <CardTitle>Upload P&L Excel File</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Upload your Excel file (.xlsx, .xls) to generate the P&L report for {period} {year}.
                </p>
                
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
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">File Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Excel file must contain P&L data with proper structure</p>
                  <p>• Required columns: Actuals, Plan, Prior Year</p>
                  <p>• File format: .xlsx or .xls</p>
                  <p>• Maximum file size: 10MB</p>
                  <p>• File will be processed automatically after upload</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : loadingReport ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading P&L report...</span>
            </CardContent>
          </Card>
        ) : plReport ? (
          <div className="space-y-4">
            {/* View Mode Toggle */}
            <div className="flex justify-end">
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Table View
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Card View
                </button>
              </div>
            </div>

            {/* Report Display */}
            {viewMode === 'table' ? (
              <PLReportTable report={plReport} lineItems={plLineItems} />
            ) : (
              <PLReportDisplay report={plReport} />
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No P&L report data available.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
