'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnalyticsAPI, PLReportData, PeriodStatus } from '@/lib/analytics-api';
import { usePLFileUpload } from './useFileUpload';

export interface UseAnalyticsOptions {
  storeId: number;
  year: number;
  period?: string;
  autoLoad?: boolean;
}

export function useAnalytics({ storeId, year, period, autoLoad = true }: UseAnalyticsOptions) {
  const [reportData, setReportData] = useState<PLReportData | null>(null);
  const [periodStatus, setPeriodStatus] = useState<PeriodStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReportData = useCallback(async () => {
    if (!period) return;

    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsAPI.getPLReport(storeId, year, period);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load report data');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [storeId, year, period]);

  const loadPeriodStatus = useCallback(async () => {
    if (!period) return;

    try {
      setLoading(true);
      setError(null);
      const status = await AnalyticsAPI.getPeriodStatus(storeId, year, period);
      setPeriodStatus(status);
    } catch (err: any) {
      setError(err.message || 'Failed to load period status');
      setPeriodStatus(null);
    } finally {
      setLoading(false);
    }
  }, [storeId, year, period]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadReportData(),
      loadPeriodStatus(),
    ]);
  }, [loadReportData, loadPeriodStatus]);

  // Auto-load data on mount or when dependencies change
  useEffect(() => {
    if (autoLoad) {
      refreshData();
    }
  }, [refreshData, autoLoad]);

  return {
    reportData,
    periodStatus,
    loading,
    error,
    loadReportData,
    loadPeriodStatus,
    refreshData,
  };
}

export function useStoreAnalytics(storeId: number, year: number) {
  const [periods, setPeriods] = useState<PeriodStatus[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStorePeriods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsAPI.getStorePeriods(storeId, year);
      setPeriods(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load store periods');
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  }, [storeId, year]);

  const loadStoreSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsAPI.getStoreAnalytics(storeId, year);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load store summary');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [storeId, year]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadStorePeriods(),
      loadStoreSummary(),
    ]);
  }, [loadStorePeriods, loadStoreSummary]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    periods,
    summary,
    loading,
    error,
    loadStorePeriods,
    loadStoreSummary,
    refreshData,
  };
}

export function usePLFileUploadWithAnalytics(storeId: number, year: number, period: string) {
  const fileUpload = usePLFileUpload(storeId, year, period);
  const { refreshData } = useAnalytics({ storeId, year, period });

  const uploadWithRefresh = useCallback(async (file: File) => {
    try {
      const result = await fileUpload.uploadPLFile(file);
      // Refresh analytics data after successful upload
      await refreshData();
      return result;
    } catch (error) {
      throw error;
    }
  }, [fileUpload, refreshData]);

  return {
    ...fileUpload,
    uploadPLFile: uploadWithRefresh,
  };
}
