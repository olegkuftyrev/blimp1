import { apiFetch } from './api';

export interface PLUploadResponse {
  success: boolean;
  message: string;
  data?: {
    fileId: string;
    fileName: string;
    fileSize: number;
    processedAt: string;
    status: 'processing' | 'completed' | 'error';
    reportUrl?: string;
  };
}

export interface PLReportData {
  id: string;
  storeId: number;
  year: number;
  period: string;
  fileName: string;
  uploadedAt: string;
  status: 'processing' | 'completed' | 'error';
  data?: {
    revenue: {
      actual: number;
      plan: number;
      priorYear: number;
      variance: number;
      variancePercent: number;
    };
    expenses: {
      actual: number;
      plan: number;
      priorYear: number;
      variance: number;
      variancePercent: number;
    };
    netIncome: {
      actual: number;
      plan: number;
      priorYear: number;
      variance: number;
      variancePercent: number;
    };
    categories: Array<{
      name: string;
      actual: number;
      plan: number;
      priorYear: number;
      variance: number;
      variancePercent: number;
    }>;
  };
  reportUrl?: string;
}

export interface PeriodStatus {
  storeId: number;
  year: number;
  period: string;
  hasData: boolean;
  lastUploaded?: string;
  status?: 'processing' | 'completed' | 'error';
}

export const AnalyticsAPI = {
  // Upload P&L Excel file
  uploadPLFile: async (
    storeId: number, 
    year: number, 
    period: string, 
    file: File
  ): Promise<PLUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('storeId', storeId.toString());
    formData.append('year', year.toString());
    formData.append('period', period);

    // Use fetch directly for file uploads with progress tracking
    const url = `/api/analytics/${storeId}/${year}/${period}/upload`;
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Upload failed: ${response.status}`);
    }

    return response.json();
  },

  // Get P&L report data
  getPLReport: async (storeId: number, year: number, period: string): Promise<PLReportData> => {
    return apiFetch<PLReportData>(`analytics/${storeId}/${year}/${period}/report`);
  },

  // Check if period has data
  getPeriodStatus: async (storeId: number, year: number, period: string): Promise<PeriodStatus> => {
    return apiFetch<PeriodStatus>(`analytics/${storeId}/${year}/${period}/status`);
  },

  // Get all periods with data for a store and year
  getStorePeriods: async (storeId: number, year: number): Promise<PeriodStatus[]> => {
    return apiFetch<PeriodStatus[]>(`analytics/${storeId}/${year}/periods`);
  },

  // Delete P&L report
  deletePLReport: async (storeId: number, year: number, period: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch<{ success: boolean; message: string }>(`analytics/${storeId}/${year}/${period}/report`, {
      method: 'DELETE',
    });
  },

  // Download P&L report
  downloadPLReport: async (storeId: number, year: number, period: string): Promise<Blob> => {
    const url = `/api/analytics/${storeId}/${year}/${period}/download`;
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
    
    const response = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    return response.blob();
  },

  // Get analytics summary for a store
  getStoreAnalytics: async (storeId: number, year?: number): Promise<{
    storeId: number;
    year: number;
    totalPeriods: number;
    completedPeriods: number;
    completionRate: number;
    lastUpdated: string;
    periods: PeriodStatus[];
  }> => {
    const yearParam = year ? `?year=${year}` : '';
    return apiFetch(`analytics/${storeId}/summary${yearParam}`);
  },
};
