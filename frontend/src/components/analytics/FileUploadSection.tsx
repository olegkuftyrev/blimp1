'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle } from "lucide-react";
import { EnhancedFileUpload, FileUploadItem } from '@/components/ui/enhanced-file-upload';
import { usePLFileUploadWithAnalytics } from '@/hooks/useAnalytics';
import { mutate } from 'swr';

interface FileUploadSectionProps {
  storeId: number;
  year: number;
  period: string;
  onUploadSuccess?: () => void;
}

export function FileUploadSection({ storeId, year, period, onUploadSuccess }: FileUploadSectionProps) {
  const [fileItems, setFileItems] = useState<FileUploadItem[]>([]);

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
  } = usePLFileUploadWithAnalytics(storeId, year, period);

  const handleFilesChange = (newFiles: FileUploadItem[]) => {
    setFileItems(newFiles);
    setFiles(newFiles.map(f => f.file));
  };

  const handleUpload = async () => {
    if (fileItems.length === 0) return;
    
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
      await mutate(`pl-reports?restaurantId=${storeId}&period=${period}`);
      
      console.log('✅ SWR caches mutated successfully');
      
      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
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
  );
}
