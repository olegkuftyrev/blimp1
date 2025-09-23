'use client';

import { useAuth } from '@/contexts/AuthContextSWR';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
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
  
  const resolvedParams = use(params);
  const storeId = parseInt(resolvedParams.storeId);
  const year = parseInt(resolvedParams.year);
  const period = resolvedParams.period;
  
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
  } = usePLFileUploadWithAnalytics(storeId, year, period);

  const [fileItems, setFileItems] = useState<FileUploadItem[]>([]);

  useEffect(() => {
    if (user && user.role === 'associate') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user.role === 'associate') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-muted-foreground">Access denied. You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">{error}</p>
          <p className="text-muted-foreground">Failed to load restaurant</p>
        </div>
      </div>
    );
  }

  const currentStore = restaurants.find(r => r.id === storeId);

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

  // Mock function to check if period has data (will be replaced with real API)
  const hasDataForPeriod = (periodId: string, year: number) => {
    // No data available for any periods yet
    return false;
  };

  const hasData = hasDataForPeriod(period, year);

  const handleFilesChange = (newFileItems: FileUploadItem[]) => {
    setFileItems(newFileItems);
    // Also update the legacy files state for compatibility
    setFiles(newFileItems.map(item => item.file));
  };

  const handleUpload = async (file: File) => {
    try {
      await uploadPLFile(file);
    } catch (error) {
      console.error('Upload failed:', error);
      throw error; // Re-throw to let the enhanced component handle it
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFileItems(prev => prev.filter(item => item.id !== fileId));
    // Also update legacy files state
    const remainingFiles = fileItems.filter(item => item.id !== fileId).map(item => item.file);
    setFiles(remainingFiles);
  };

  const handleClear = () => {
    setFileItems([]);
    reset();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href={`/analytics/${storeId}`} 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Periods
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {currentStore.name} - {year} {period}
        </h1>
        <p className="text-muted-foreground">
          {hasData ? 'View P&L Report' : 'Upload Excel file to generate P&L Report'}
        </p>
      </div>

      {/* Error Display */}
      {uploadError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Success Display */}
      {uploadSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            File uploaded successfully! Your P&L report is being processed.
          </AlertDescription>
        </Alert>
      )}

      {hasData ? (
        /* P&L Report Display */
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle>P&L Report Available</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                P&L data is available for this period. Report components will be implemented here.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
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
      )}
    </div>
  );
}
