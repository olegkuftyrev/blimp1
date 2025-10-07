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
}

type RestaurantResponse = {
  success: boolean
  data: Restaurant[]
}

const fetcher = async (url: string, token: string | null, id: number): Promise<RestaurantResponse> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ids: [id] })
  })
  if (!res.ok) throw new Error('Failed to fetch restaurant')
  return res.json()
}

export function useRestaurant(id: number | null) {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null
  
  const { data, error, isLoading } = useSWR(
    id && !Number.isNaN(id) ? ['/api/next/restaurants', token, id] : null,
    ([url, token, id]) => fetcher(url, token, id)
  )
  
  const item = Array.isArray(data?.data) ? data.data[0] : null
  const restaurant: Restaurant | null = item ? {
    id: item?.id ?? item?.data?.id,
    name: item?.name ?? item?.data?.name,
    address: item?.address ?? item?.data?.address,
    phone: item?.phone ?? item?.data?.phone,
    users: item?.users || {}
  } : null
  
  return {
    restaurant,
    isLoading,
    error,
    notFound: !isLoading && !error && !restaurant
  }
}
