import { NextResponse, NextRequest } from 'next/server'
import { getApiUrl } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as any
    const ids: number[] = Array.isArray(body?.ids) ? body.ids : []
    if (!ids.length) {
      return NextResponse.json({ error: 'ids is required and must be a non-empty array' }, { status: 400 })
    }

    const incomingAuth = req.headers.get('authorization')

    const fetchOne = async (id: number) => {
      const endpoint = getApiUrl(`restaurants/${id}`)
      const url = /^https?:\/\//.test(endpoint)
        ? endpoint
        : `${req.nextUrl.origin}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(incomingAuth ? { Authorization: incomingAuth } : {}),
        },
        credentials: 'include',
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`Failed to fetch restaurant ${id}: ${res.status}`)
      const json = await res.json()
      // Normalize common shapes
      const data = json?.data ?? json
      return data
    }

    const fetchUsersForRestaurant = async (restaurantId: number) => {
      try {
        const usersEndpoint = getApiUrl(`users/team-debug`)
        const usersUrl = /^https?:\/\//.test(usersEndpoint)
          ? usersEndpoint
          : `${req.nextUrl.origin}${usersEndpoint.startsWith('/') ? '' : '/'}${usersEndpoint}`
        const usersRes = await fetch(usersUrl, {
          headers: {
            'Content-Type': 'application/json',
            ...(incomingAuth ? { Authorization: incomingAuth } : {}),
          },
          credentials: 'include',
          cache: 'no-store',
        })
        if (!usersRes.ok) return []
        const usersJson = await usersRes.json()
        const users = Array.isArray(usersJson?.data) ? usersJson.data : []
        // Filter users that belong to this restaurant
        return users.filter((user: any) => 
          Array.isArray(user?.restaurants) && 
          user.restaurants.some((r: any) => r.id === restaurantId)
        )
      } catch (error) {
        console.error(`Failed to fetch users for restaurant ${restaurantId}:`, error)
        return []
      }
    }

    const fetchPlReportsForRestaurant = async (restaurantId: number, period?: string) => {
      try {
        const baseEndpoint = getApiUrl(`pl-reports`)
        const qp = new URLSearchParams({ restaurantId: String(restaurantId) })
        if (period) qp.set('period', period)
        const plUrl = /^https?:\/\//.test(baseEndpoint)
          ? `${baseEndpoint}?${qp.toString()}`
          : `${req.nextUrl.origin}${baseEndpoint.startsWith('/') ? '' : '/'}${baseEndpoint}?${qp.toString()}`

        const plRes = await fetch(plUrl, {
          headers: {
            'Content-Type': 'application/json',
            ...(incomingAuth ? { Authorization: incomingAuth } : {}),
          },
          credentials: 'include',
          cache: 'no-store',
        })
        if (!plRes.ok) return []
        const plJson = await plRes.json()
        const reports = Array.isArray(plJson?.data) ? plJson.data : []
        // return full reports as provided by backend (includes lineItems)
        return reports
      } catch (error) {
        console.error(`Failed to fetch P&L for restaurant ${restaurantId}:`, error)
        return []
      }
    }

    const calculatePeriodKeyMetrics = (plReports: any[]) => {
      if (!Array.isArray(plReports) || plReports.length === 0) {
        return plReports
      }

      // Sort reports by period (assuming period is sortable string like "2024-01")
      const sortedReports = [...plReports].sort((a, b) => {
        const periodA = a.period || ''
        const periodB = b.period || ''
        return periodB.localeCompare(periodA) // Most recent first
      })

      // Debug: Log all periods and their order
      console.log('All P&L periods for restaurant:', sortedReports.map(r => ({
        period: r.period,
        netSales: r.netSales,
        netSalesPriorYear: r.netSalesPriorYear
      })))

      // Calculate key metrics for each period
      return sortedReports.map((report) => {
        const currentNetSales = parseFloat(report?.netSales) || 0
        const currentPeriod = report?.period

        // Prior year data is already in the same report
        const priorYearNetSales = parseFloat(report?.netSalesPriorYear) || 0
        const planNetSales = parseFloat(report?.netSalesPlan) || 0

        // Calculate SSS%: current vs prior year, or current vs plan if prior year is 0
        let sssPercentage = null
        if (priorYearNetSales > 0) {
          sssPercentage = ((currentNetSales - priorYearNetSales) / priorYearNetSales) * 100
        } else if (planNetSales > 0) {
          sssPercentage = ((currentNetSales - planNetSales) / planNetSales) * 100
        }

        // Debug logging
        console.log(`API - Period ${currentPeriod}:`, {
          currentNetSales,
          priorYearNetSales,
          planNetSales,
          sssPercentage: sssPercentage !== null ? Math.round(sssPercentage * 100) / 100 : null,
          calculation: priorYearNetSales > 0 ? 
            `(${currentNetSales} - ${priorYearNetSales}) / ${priorYearNetSales} * 100 = ${sssPercentage}` :
            planNetSales > 0 ? 
            `(${currentNetSales} - ${planNetSales}) / ${planNetSales} * 100 = ${sssPercentage}` :
            'No comparison data'
        })

        return {
          ...report,
          keyMetrics: {
            sssPercentage: sssPercentage !== null ? Math.round(sssPercentage * 100) / 100 : null, // Round to 2 decimal places
          }
        }
      })
    }

    const results = await Promise.allSettled(ids.map(async (id) => {
      const restaurant = await fetchOne(id)
      const users = await fetchUsersForRestaurant(id)
      const plReports = await fetchPlReportsForRestaurant(id)
      
      // Group users by role
      const usersByRole = users.reduce((acc: any, user: any) => {
        const role = user.role || 'unknown'
        if (!acc[role]) {
          acc[role] = []
        }
        acc[role].push({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          jobTitle: user.jobTitle,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })
        return acc
      }, {})
      
      // Calculate key metrics for each period
      const plReportsWithMetrics = calculatePeriodKeyMetrics(plReports)
      
      return { ...restaurant, users: usersByRole, plReports: plReportsWithMetrics }
    }))
    
    const restaurants = results
      .map((r, i) => (r.status === 'fulfilled' ? r.value : { id: ids[i], error: true }))

    return NextResponse.json({ success: true, data: restaurants })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 })
  }
}


