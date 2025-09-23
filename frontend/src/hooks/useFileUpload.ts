'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadState {
  files: File[];
  isUploading: boolean;
  progress: FileUploadProgress | null;
  error: string | null;
  success: boolean;
  uploadedFiles: string[];
}

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  multiple?: boolean;
  onProgress?: (progress: FileUploadProgress) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: string) => void;
}

export function useFileUpload(options: FileUploadOptions = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['.xlsx', '.xls'],
    multiple = false,
    onProgress,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<FileUploadState>({
    files: [],
    isUploading: false,
    progress: null,
    error: null,
    success: false,
    uploadedFiles: [],
  });

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = allowedTypes.map(ext => ext.trim().replace('.', ''));
    
    if (!fileExtension || !acceptedExtensions.includes(fileExtension)) {
      return `File ${file.name} has an unsupported format. Accepted formats: ${allowedTypes.join(', ')}`;
    }

    return null;
  }, [maxSize, allowedTypes]);

  const validateFiles = useCallback((files: File[]): { validFiles: File[]; errors: string[] } => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    }

    return { validFiles, errors };
  }, [validateFile]);

  const setFiles = useCallback((files: File[]) => {
    const { validFiles, errors } = validateFiles(files);
    
    setState(prev => ({
      ...prev,
      files: validFiles,
      error: errors.length > 0 ? errors.join('; ') : null,
      success: false,
    }));

    if (errors.length > 0) {
      onError?.(errors.join('; '));
    }
  }, [validateFiles, onError]);

  const uploadFile = useCallback(async (file: File, endpoint: string, additionalData?: Record<string, any>) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add any additional data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    try {
      setState(prev => ({
        ...prev,
        isUploading: true,
        error: null,
        success: false,
        progress: { loaded: 0, total: file.size, percentage: 0 },
      }));

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            };
            
            setState(prev => ({ ...prev, progress }));
            onProgress?.(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch {
              resolve({ success: true });
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed: Network error'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        // Get auth token
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
        
        xhr.open('POST', endpoint);
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.send(formData);
      });

      const response = await uploadPromise;
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        success: true,
        progress: null,
        uploadedFiles: [...prev.uploadedFiles, file.name],
      }));

      onSuccess?.(response);
      return response;

    } catch (error: any) {
      const errorMessage = error.message || 'Upload failed';
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
        success: false,
        progress: null,
      }));

      onError?.(errorMessage);
      throw error;
    }
  }, [onProgress, onSuccess, onError]);

  const uploadFiles = useCallback(async (endpoint: string, additionalData?: Record<string, any>) => {
    if (state.files.length === 0) {
      throw new Error('No files to upload');
    }

    const results = [];
    for (const file of state.files) {
      try {
        const result = await uploadFile(file, endpoint, additionalData);
        results.push(result);
      } catch (error) {
        // Continue with other files even if one fails
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    return results;
  }, [state.files, uploadFile]);

  const reset = useCallback(() => {
    setState({
      files: [],
      isUploading: false,
      progress: null,
      error: null,
      success: false,
      uploadedFiles: [],
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
      error: null,
    }));
  }, []);

  return {
    ...state,
    setFiles,
    uploadFile,
    uploadFiles,
    reset,
    removeFile,
    validateFile,
    validateFiles,
  };
}

// Specialized hook for P&L Excel file uploads
export function usePLFileUpload(storeId: number, year: number, period: string) {
  const fileUpload = useFileUpload({
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['.xlsx', '.xls'],
    multiple: false,
  });

  const uploadPLFile = useCallback(async (file: File) => {
    const endpoint = `/analytics/${storeId}/${year}/${period}/upload`;
    const additionalData = {
      storeId: storeId.toString(),
      year: year.toString(),
      period,
    };

    return fileUpload.uploadFile(file, endpoint, additionalData);
  }, [storeId, year, period, fileUpload]);

  return {
    ...fileUpload,
    uploadPLFile,
  };
}
