export interface PeriodInfo {
  id: string;
  name: string;
  quarter: string;
  start: string; // MM/DD format
  end: string;   // MM/DD format
}

export const PERIODS: PeriodInfo[] = [
  { id: 'P01', name: 'P01', quarter: 'Q1', start: '12/30', end: '1/25' },
  { id: 'P02', name: 'P02', quarter: 'Q1', start: '1/26', end: '2/22' },
  { id: 'P03', name: 'P03', quarter: 'Q1', start: '2/23', end: '3/22' },
  { id: 'P04', name: 'P04', quarter: 'Q2', start: '3/23', end: '4/19' },
  { id: 'P05', name: 'P05', quarter: 'Q2', start: '4/20', end: '5/17' },
  { id: 'P06', name: 'P06', quarter: 'Q2', start: '5/18', end: '6/14' },
  { id: 'P07', name: 'P07', quarter: 'Q3', start: '6/15', end: '7/12' },
  { id: 'P08', name: 'P08', quarter: 'Q3', start: '7/13', end: '8/9' },
  { id: 'P09', name: 'P09', quarter: 'Q3', start: '8/10', end: '9/6' },
  { id: 'P10', name: 'P10', quarter: 'Q4', start: '9/7', end: '10/4' },
  { id: 'P11', name: 'P11', quarter: 'Q4', start: '10/5', end: '11/1' },
  { id: 'P12', name: 'P12', quarter: 'Q4', start: '11/2', end: '11/29' },
  { id: 'P13', name: 'P13', quarter: 'Q4', start: '11/30', end: '12/27' },
];

/**
 * Get the current period based on today's date
 */
export function getCurrentPeriod(): string {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // For periods that span across years (P01 starts in December)
  for (const period of PERIODS) {
    const [startMonth, startDay] = period.start.split('/').map(Number);
    const [endMonth, endDay] = period.end.split('/').map(Number);
    
    // Handle P01 which spans from December to January
    if (period.id === 'P01') {
      const startDate = new Date(currentYear - 1, startMonth - 1, startDay);
      const endDate = new Date(currentYear, endMonth - 1, endDay);
      
      if (today >= startDate && today <= endDate) {
        return period.id;
      }
    } else {
      // For other periods in the same year
      const startDate = new Date(currentYear, startMonth - 1, startDay);
      const endDate = new Date(currentYear, endMonth - 1, endDay);
      
      if (today >= startDate && today <= endDate) {
        return period.id;
      }
    }
  }
  
  // If we're in the gap between P13 and P01, return P13
  return 'P13';
}

/**
 * Get all periods that should be included in YTD calculation
 */
export function getYtdPeriods(): string[] {
  const currentPeriod = getCurrentPeriod();
  const currentPeriodIndex = PERIODS.findIndex(p => p.id === currentPeriod);
  
  if (currentPeriodIndex === -1) {
    return ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P09', 'P10', 'P11', 'P12', 'P13'];
  }
  
  return PERIODS.slice(0, currentPeriodIndex + 1).map(p => p.id);
}

/**
 * Check if a period should be included in YTD for a given date
 */
export function isPeriodIncludedInYtd(periodId: string, date?: Date): boolean {
  const ytdPeriods = getYtdPeriods();
  return ytdPeriods.includes(periodId);
}
