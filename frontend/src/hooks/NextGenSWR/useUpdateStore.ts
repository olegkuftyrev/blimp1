import useSWRMutation from 'swr/mutation'

type UpdateStoreData = {
  name: string
  address: string
  phone: string
}

type UpdateStoreResponse = {
  success: boolean
  data: any
}

const updateStoreFetcher = async (
  url: string, 
  { arg }: { arg: { storeId: number; data: UpdateStoreData; token: string | null } }
): Promise<UpdateStoreResponse> => {
  const { storeId, data, token } = arg
  
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ storeId, ...data })
  })
  
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Failed to update store: ${res.status} - ${errorText}`)
  }
  
  return res.json()
}

export function useUpdateStore() {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null
  
  const { trigger, isMutating, error } = useSWRMutation(
    token ? '/api/next/restaurants/update' : null,
    updateStoreFetcher
  )

  const updateStore = async (storeId: number, data: UpdateStoreData) => {
    if (!token) {
      throw new Error('No authentication token found')
    }
    
    return trigger({ storeId, data, token })
  }

  return {
    updateStore,
    isUpdating: isMutating,
    error
  }
}
