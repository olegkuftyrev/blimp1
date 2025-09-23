'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Trash2, 
  FileText,
  Download
} from 'lucide-react';

export interface FileUploadItem {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

export interface EnhancedFileUploadProps {
  files: FileUploadItem[];
  onFilesChange: (files: FileUploadItem[]) => void;
  onUpload: (file: File) => Promise<void>;
  onRemove: (fileId: string) => void;
  onClear: () => void;
  isUploading: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
}

export function EnhancedFileUpload({
  files,
  onFilesChange,
  onUpload,
  onRemove,
  onClear,
  isUploading,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['.xlsx', '.xls'],
  className,
  disabled = false,
}: EnhancedFileUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = acceptedTypes.map(ext => ext.trim().replace('.', ''));
    
    if (!fileExtension || !acceptedExtensions.includes(fileExtension)) {
      return `Unsupported file format. Accepted formats: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || disabled) return;

    const fileArray = Array.from(newFiles);
    const validFiles: FileUploadItem[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      if (files.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} file(s) allowed`);
        break;
      }

      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push({
          file,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          status: 'pending',
        });
      }
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }

    if (errors.length > 0) {
      // You could show these errors in a toast or alert
      console.error('File validation errors:', errors);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleUploadFile = async (fileItem: FileUploadItem) => {
    try {
      onFilesChange(files.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'uploading' as const, progress: 0 }
          : f
      ));

      await onUpload(fileItem.file);

      onFilesChange(files.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'success' as const, progress: 100 }
          : f
      ));
    } catch (error) {
      onFilesChange(files.map(f => 
        f.id === fileItem.id 
          ? { 
              ...f, 
              status: 'error' as const, 
              error: error instanceof Error ? error.message : 'Upload failed'
            }
          : f
      ));
    }
  };

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (['xlsx', 'xls'].includes(extension || '')) {
      return <FileSpreadsheet className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  const getStatusIcon = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'uploading':
        return <Badge variant="secondary">Uploading</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          dragActive && !disabled ? 'border-primary bg-primary/5' : 'border-border',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          multiple={maxFiles > 1}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Upload className="h-8 w-8" />
          </div>
          <div>
            <p className="font-medium text-sm">
              {dragActive ? 'Drop files here' : 'Upload files'}
            </p>
            <p className="text-muted-foreground text-xs">
              Drag and drop or click to select files
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              {acceptedTypes.join(', ')} • Max {formatFileSize(maxSize)} • {maxFiles} file{maxFiles > 1 ? 's' : ''} max
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Files ({files.length})</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              disabled={isUploading}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-2">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center gap-3 p-3 bg-muted rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(fileItem.file)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {fileItem.file.name}
                    </p>
                    {getStatusIcon(fileItem.status)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(fileItem.file.size)}</span>
                    {getStatusBadge(fileItem.status)}
                  </div>

                  {/* Progress Bar */}
                  {fileItem.status === 'uploading' && fileItem.progress !== undefined && (
                    <div className="mt-2">
                      <Progress value={fileItem.progress} className="h-1" />
                    </div>
                  )}

                  {/* Error Message */}
                  {fileItem.status === 'error' && fileItem.error && (
                    <Alert variant="destructive" className="mt-2 py-2">
                      <AlertCircle className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        {fileItem.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {fileItem.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUploadFile(fileItem)}
                      disabled={isUploading}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </Button>
                  )}
                  
                  {fileItem.status === 'success' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {/* Handle download */}}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(fileItem.id)}
                    disabled={isUploading}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
