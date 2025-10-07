import { NextResponse, NextRequest } from 'next/server'
import { getApiUrl } from '@/lib/api'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ message: `GET test for restaurant ${params.id}` })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid restaurant ID' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({})) as any
    const { name, address, phone } = body

    if (!name && !address && !phone) {
      return NextResponse.json({ error: 'At least one field (name, address, phone) is required' }, { status: 400 })
    }

    const incomingAuth = req.headers.get('authorization')
    const endpoint = `restaurants/${id}`
    // Use backend URL directly instead of frontend origin
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
      : 'http://localhost:3333'
    const url = `${backendUrl}/api/${endpoint}`

    console.log('PUT request to:', url)
    console.log('Request body:', { name, address, phone })

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(incomingAuth ? { Authorization: incomingAuth } : {}),
      },
      body: JSON.stringify({
        name,
        address,
        phone
      }),
      credentials: 'include',
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`Backend PUT /restaurants/${id} failed: ${res.status} - ${errorText}`)
      return NextResponse.json({ error: `Failed to update restaurant: ${res.statusText}` }, { status: res.status })
    }

    const json = await res.json()
    return NextResponse.json({ success: true, data: json })
  } catch (error: any) {
    console.error('API route PUT /api/next/restaurants/[id] error:', error)
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 })
  }
}
