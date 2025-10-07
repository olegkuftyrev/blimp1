import { NextResponse, NextRequest } from 'next/server'
import { getApiUrl } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    // Build absolute URL for server-side fetch
    const endpoint = getApiUrl('auth/me')
    const isAbsolute = /^https?:\/\//.test(endpoint)
    const url = isAbsolute 
      ? endpoint 
      : `${req.nextUrl.origin}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
    const incomingAuth = req.headers.get('authorization')

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
      },
      credentials: 'include',
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'Failed to fetch user', details: text }, { status: res.status })
    }

    const data = await res.json()

    // If admin and restaurant_ids empty, fetch all restaurants and return their IDs
    const userRole = data?.user?.role
    const currentIds: unknown = data?.restaurant_ids
    const isArray = Array.isArray(currentIds)
    if (userRole === 'admin' && isArray && (currentIds as any[]).length === 0) {
      const restaurantsEndpoint = getApiUrl('restaurants')
      const restaurantsUrl = /^https?:\/\//.test(restaurantsEndpoint)
        ? restaurantsEndpoint
        : `${req.nextUrl.origin}${restaurantsEndpoint.startsWith('/') ? '' : '/'}${restaurantsEndpoint}`
      const rRes = await fetch(restaurantsUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(incomingAuth ? { Authorization: incomingAuth } : {}),
        },
        credentials: 'include',
        cache: 'no-store',
      })
      if (rRes.ok) {
        const rJson = await rRes.json()
        // Try common shapes: { data: Restaurant[] } or { success, data }
        const list = Array.isArray(rJson)
          ? rJson
          : Array.isArray(rJson?.data)
          ? rJson.data
          : Array.isArray(rJson?.restaurants)
          ? rJson.restaurants
          : []
        const allIds = list.map((r: any) => r?.id).filter((id: any) => typeof id === 'number')
        data.restaurant_ids = allIds
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 })
  }
}


