import useSWR from 'swr'
import apiClient from '@/lib/axios'
import { useAuth } from '@/contexts/AuthContextSWR'

export type OrderHistory = {
  id: number
  tableSection: number
  menuItemId: number
  batchSize: number
  batchNumber: number
  status: 'ready' | 'completed' | 'deleted' | 'cancelled'
  timerStart?: string
  timerEnd?: string
  completedAt?: string
  deletedAt?: string
  createdAt: string
  updatedAt: string
  duration: number
  menuItem?: { id: number; itemTitle: string }
}

const fetcher = async (url: string) => {
  const res = await apiClient.get(url)
  return res.data
}

export function useSWRHistory(restaurantId: string | number | null) {
  const { user } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    user && restaurantId ? `orders-history?restaurant_id=${restaurantId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshInterval: 15000,
    }
  )

  return {
    history: (data?.data as OrderHistory[]) || [],
    loading: isLoading,
    error,
    mutate,
  }
}


