'use client';

import { useAuth } from '@/contexts/AuthContextSWR';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileSpreadsheet, Upload, CheckCircle } from "lucide-react";
import { useSWRRestaurants } from '@/hooks/useSWRKitchen';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/dropzone';
import { UploadIcon } from 'lucide-react';

interface PeriodReportPageProps {
  params: {
    storeId: string;
    year: string;
    period: string;
  };
}

export default function PeriodReportPage({ params }: PeriodReportPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { restaurants, loading, error } = useSWRRestaurants();
  const [files, setFiles] = useState<File[] | undefined>();
  const [isUploading, setIsUploading] = useState(false);

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

  const storeId = parseInt(params.storeId);
  const year = parseInt(params.year);
  const period = params.period;
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

  const handleDrop = (files: File[]) => {
    console.log('Files dropped:', files);
    setFiles(files);
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      // TODO: Implement actual upload logic
      console.log('Uploading file:', files[0]);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Handle successful upload
      console.log('Upload completed');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
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
              
              <div className="border-2 border-dashed border-border rounded-lg">
                <Dropzone onDrop={handleDrop} onError={console.error} src={files}>
                  <DropzoneEmptyState>
                    <div className="flex w-full items-center gap-4 p-8">
                      <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <UploadIcon size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">Upload P&L Excel file</p>
                        <p className="text-muted-foreground text-xs">
                          Drag and drop or click to upload (.xlsx, .xls)
                        </p>
                      </div>
                    </div>
                  </DropzoneEmptyState>
                  <DropzoneContent />
                </Dropzone>
              </div>

              {files && files.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{files[0].name}</p>
                      <p className="text-muted-foreground text-xs">
                        {(files[0].size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleUpload} 
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload & Process P&L Data
                      </>
                    )}
                  </Button>
                </div>
              )}
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
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
