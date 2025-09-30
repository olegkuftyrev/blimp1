import { apiFetch } from './api';
import { toSearchParams } from './utils';

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
    formData.append('plFile', file);
    formData.append('restaurantId', storeId.toString());

    // Use fetch directly for file uploads with progress tracking
    const url = `/api/pl-reports/upload`;
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
    // First get all P&L reports for the restaurant, then filter by period
    const reports = await apiFetch<{ data: any[] }>(`pl-reports?restaurantId=${storeId}&period=${period}`);
    if (reports.data && reports.data.length > 0) {
      return reports.data[0];
    }
    throw new Error('P&L report not found');
  },

  // Check if period has data
  getPeriodStatus: async (storeId: number, year: number, period: string): Promise<PeriodStatus> => {
    try {
      await AnalyticsAPI.getPLReport(storeId, year, period);
      return {
        storeId,
        year,
        period,
        hasData: true,
        status: 'completed'
      };
    } catch {
      return {
        storeId,
        year,
        period,
        hasData: false
      };
    }
  },

  // Get all periods with data for a store and year
  getStorePeriods: async (storeId: number, year: number): Promise<PeriodStatus[]> => {
    const reports = await apiFetch<{ data: any[] }>(`pl-reports?restaurantId=${storeId}`);
    return reports.data.map(report => ({
      storeId: report.restaurantId,
      year: parseInt(report.period.split(' ')[1]) || year,
      period: report.period,
      hasData: true,
      lastUploaded: report.createdAt,
      status: 'completed'
    }));
  },

  // Delete P&L report
  deletePLReport: async (storeId: number, year: number, period: string): Promise<{ success: boolean; message: string }> => {
    // First find the report ID
    const reports = await apiFetch<{ data: any[] }>(`pl-reports?restaurantId=${storeId}&period=${period}`);
    if (reports.data && reports.data.length > 0) {
      const reportId = reports.data[0].id;
      return apiFetch<{ success: boolean; message: string }>(`pl-reports/${reportId}`, {
        method: 'DELETE',
      });
    }
    throw new Error('P&L report not found');
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

  // ===== Area P&L (GET only) =====
  getAreaPlSummary: async (params: Record<string, any>) => {
    const query = toSearchParams(params);
    return apiFetch(`area-pl/summary?${query}`);
  },
  getAreaPlBreakdown: async (params: Record<string, any>) => {
    const query = toSearchParams(params);
    return apiFetch(`area-pl/breakdown?${query}`);
  },
  getAreaPlTrends: async (params: Record<string, any>) => {
    const query = toSearchParams(params);
    return apiFetch(`area-pl/trends?${query}`);
  },
  getAreaPlVariance: async (params: Record<string, any>) => {
    const query = toSearchParams(params);
    return apiFetch(`area-pl/variance?${query}`);
  },
  getAreaPlLeaderboard: async (params: Record<string, any>) => {
    const query = toSearchParams(params);
    return apiFetch(`area-pl/leaderboard?${query}`);
  },
  getAreaPlLineItems: async (params: Record<string, any>) => {
    const query = toSearchParams(params);
    return apiFetch(`area-pl/line-items?${query}`);
  },
  getAreaPlPeriods: async (params: Record<string, any>) => {
    const query = toSearchParams(params);
    return apiFetch(`area-pl/periods?${query}`);
  },
  getAreaPlKpis: async (params: Record<string, any>) => {
    const query = toSearchParams(params);
    return apiFetch(`area-pl/kpis?${query}`);
  },
  getAreaPlCompare: async (params: Record<string, any>) => {
    const query = toSearchParams(params);
    return apiFetch(`area-pl/compare?${query}`);
  },
};
