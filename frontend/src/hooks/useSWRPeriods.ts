import useSWR from 'swr'
import { apiFetch } from '@/lib/api'

export interface PeriodInfo {
  id: string;
  name: string;
  quarter: string;
  start: string; // MM/DD format
  end: string;   // MM/DD format
}

export interface PeriodsResponse {
  data: PeriodInfo[];
  currentPeriod: string;
  ytdPeriods: string[];
}

export interface CurrentPeriodResponse {
  data: {
    currentPeriod: string;
    ytdPeriods: string[];
  };
}

/**
 * Hook to fetch all periods with current period and YTD periods
 */
export function useSWRPeriods() {
  const { data, error, isLoading, mutate } = useSWR<PeriodsResponse>(
    'periods',
    apiFetch,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
      errorRetryCount: 3,
    }
  )

  return {
    periods: data?.data || [],
    currentPeriod: data?.currentPeriod || '',
    ytdPeriods: data?.ytdPeriods || [],
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook to fetch only current period info
 */
export function useSWRCurrentPeriod() {
  const { data, error, isLoading, mutate } = useSWR<CurrentPeriodResponse>(
    'periods/current',
    apiFetch,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
      errorRetryCount: 3,
    }
  )

  return {
    currentPeriod: data?.data?.currentPeriod || '',
    ytdPeriods: data?.data?.ytdPeriods || [],
    isLoading,
    error,
    mutate
  }
}

/**
 * Utility function to check if a period is available for upload
 */
export function isPeriodAvailable(periodId: string, year: number): boolean {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // If it's a future year, period is not available
  if (year > currentYear) {
    return false;
  }
  
  // If it's a past year, period is available
  if (year < currentYear) {
    return true;
  }
  
  // For current year, we need the periods data to check availability
  // This function should be used in combination with useSWRPeriods
  return true; // Will be properly implemented when periods data is available
}

/**
 * Utility function to check if a period is available for upload with periods data
 */
export function isPeriodAvailableWithData(periodId: string, year: number, periods: PeriodInfo[]): boolean {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // If it's a future year, period is not available
  if (year > currentYear) {
    return false;
  }
  
  // If it's a past year, period is available
  if (year < currentYear) {
    return true;
  }
  
  // For current year, check if period has started
  const period = periods.find(p => p.id === periodId);
  if (!period) return false;
  
  // Parse period start date (format: MM/DD)
  const [month, day] = period.start.split('/').map(Number);
  const periodStartDate = new Date(currentYear, month - 1, day);
  
  // Special case for P01 which starts in previous year
  if (periodId === 'P01') {
    const p01StartDate = new Date(currentYear - 1, 11, 30); // December 30 of previous year
    return currentDate >= p01StartDate;
  }
  
  return currentDate >= periodStartDate;
}