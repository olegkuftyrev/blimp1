'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface DropzoneProps {
  onDrop: (files: File[]) => void;
  onError?: (error: Error) => void;
  src?: File[];
  children: React.ReactNode;
  className?: string;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

export function Dropzone({
  onDrop,
  onError,
  src,
  children,
  className,
  accept = '.xlsx,.xls',
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    
    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        onError?.(new Error(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`));
        continue;
      }
      
      // Check file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const acceptedExtensions = accept.split(',').map(ext => ext.trim().replace('.', ''));
      
      if (fileExtension && acceptedExtensions.includes(fileExtension)) {
        validFiles.push(file);
      } else {
        onError?.(new Error(`File ${file.name} has an unsupported format. Accepted formats: ${accept}`));
      }
    }
    
    return validFiles;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles = validateFiles(fileArray);
    
    if (validFiles.length > 0) {
      onDrop(validFiles.slice(0, maxFiles));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <div
      className={cn(
        'relative cursor-pointer transition-colors',
        isDragOver && 'bg-accent',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleFileInputChange}
        className="hidden"
      />
      {children}
    </div>
  );
}

export function DropzoneContent() {
  return null; // This component is not needed for our simple implementation
}

export function DropzoneEmptyState({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
