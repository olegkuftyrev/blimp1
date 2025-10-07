'use client'

import { useParams } from 'next/navigation'
import { useRestaurant } from '@/hooks/NextGenSWR/useRestaurant'

export default function StoreDashByIdPage() {
  const params = useParams<{ id: string }>()
  const idNum = Number(params?.id)
  
  const { restaurant, isLoading, error, notFound } = useRestaurant(idNum)
  
  if (isLoading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6">Error: {error.message}</div>
  if (notFound) return <div className="p-6">Store not found</div>
  if (!restaurant) return <div className="p-6">No data</div>

  return (
    <div className="p-6 space-y-2">
      <h1 className="text-2xl font-bold">{restaurant.name || `Store ${restaurant.id}`}</h1>
      <div className="text-sm text-muted-foreground">ID: {restaurant.id}</div>
      {restaurant.address ? <div className="text-muted-foreground">{restaurant.address}</div> : null}
      {restaurant.phone ? <div className="text-muted-foreground">{restaurant.phone}</div> : null}
    </div>
  )
}


