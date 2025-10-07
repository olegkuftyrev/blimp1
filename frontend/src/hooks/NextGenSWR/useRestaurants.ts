import useSWR from 'swr'

type User = {
  id: number
  email: string
  fullName?: string | null
  jobTitle?: string
  createdAt: string
  updatedAt: string
}

type UsersByRole = {
  [role: string]: User[]
}

type Restaurant = {
  id: number
  name?: string
  address?: string
  phone?: string
  users?: UsersByRole
  plReports?: Array<{
    id: number
    period: string
    netSales?: number
    grossSales?: number
    controllableProfit?: number
    restaurantContribution?: number
    cashflow?: number
    keyMetrics?: {
      sssPercentage: number | null
    }
  }>
}

type RestaurantsResponse = {
  success: boolean
  data: Restaurant[]
}

const restaurantsFetcher = async (url: string, token: string | null, ids: number[]): Promise<RestaurantsResponse> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ids })
  })
  if (!res.ok) throw new Error('Failed to fetch restaurants')
  return res.json()
}

export function useRestaurants(ids: number[]) {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null
  
  const { data, error, isLoading } = useSWR(
    ids.length > 0 ? ['/api/next/restaurants', token, ids] : null,
    ([url, token, ids]) => restaurantsFetcher(url, token, ids)
  )
  
  const restaurants = data?.data?.map((r: any) => {
    const restaurant = {
      id: r?.id ?? r?.data?.id,
      name: r?.name ?? r?.data?.name ?? `Store ${r?.id ?? ''}`,
      address: r?.address ?? r?.data?.address ?? '',
      phone: r?.phone ?? r?.data?.phone ?? '',
      users: r?.users || {},
      plReports: Array.isArray(r?.plReports) ? r.plReports : []
    }
    
  
    
    return restaurant
  }).filter((r: any) => typeof r.id === 'number') || []
  
  return {
    restaurants,
    isLoading,
    error
  }
}
