import useSWR from 'swr'
import { AnalyticsAPI } from '../lib/analytics-api'
import { toSearchParams } from '../lib/utils'

type Params = Record<string, any>

export function useAreaPlSummary(params: Params) {
  const qs = toSearchParams(params)
  return useSWR(['area-pl/summary', qs], () => AnalyticsAPI.getAreaPlSummary(params))
}

export function useAreaPlBreakdown(params: Params) {
  const qs = toSearchParams(params)
  return useSWR(['area-pl/breakdown', qs], () => AnalyticsAPI.getAreaPlBreakdown(params))
}

export function useAreaPlTrends(params: Params) {
  const qs = toSearchParams(params)
  return useSWR(['area-pl/trends', qs], () => AnalyticsAPI.getAreaPlTrends(params))
}

export function useAreaPlVariance(params: Params) {
  const qs = toSearchParams(params)
  return useSWR(['area-pl/variance', qs], () => AnalyticsAPI.getAreaPlVariance(params))
}

export function useAreaPlLeaderboard(params: Params) {
  const qs = toSearchParams(params)
  return useSWR(['area-pl/leaderboard', qs], () => AnalyticsAPI.getAreaPlLeaderboard(params))
}

export function useAreaPlLineItems(params: Params) {
  const qs = toSearchParams(params)
  return useSWR(['area-pl/line-items', qs], () => AnalyticsAPI.getAreaPlLineItems(params))
}

export function useAreaPlPeriods(params: Params) {
  const qs = toSearchParams(params)
  return useSWR(['area-pl/periods', qs], () => AnalyticsAPI.getAreaPlPeriods(params))
}

export function useAreaPlKpis(params: Params) {
  const qs = toSearchParams(params)
  return useSWR(['area-pl/kpis', qs], () => AnalyticsAPI.getAreaPlKpis(params))
}

export function useAreaPlCompare(params: Params) {
  const qs = toSearchParams(params)
  return useSWR(['area-pl/compare', qs], () => AnalyticsAPI.getAreaPlCompare(params))
}



