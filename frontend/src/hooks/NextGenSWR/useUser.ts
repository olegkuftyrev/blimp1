import useSWR from 'swr'

type AuthUser = {
  id: number
  email: string
  fullName?: string | null
  role: 'admin' | 'ops_lead' | 'black_shirt' | 'associate' | 'tablet'
  job_title?: string
}

type UserResponse = {
  success: boolean
  data: {
    user: AuthUser
    restaurant_ids: number[]
  }
}

const userFetcher = async (url: string, token: string | null): Promise<UserResponse> => {
  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}

export function useUser() {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null
  
  const { data, error, isLoading } = useSWR(
    token ? ['/api/next/user', token] : null,
    ([url, token]) => userFetcher(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  
  return {
    user: data?.data?.user || null,
    restaurantIds: data?.data?.restaurant_ids || [],
    isLoading,
    error
  }
}
