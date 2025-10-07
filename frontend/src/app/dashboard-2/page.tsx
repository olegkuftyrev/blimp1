"use client";

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/NextGenSWR/useUser'
import { useRestaurants } from '@/hooks/NextGenSWR/useRestaurants'
import { useUpdateStore } from '@/hooks/NextGenSWR/useUpdateStore'
import { EditStoreModal } from '@/components/EditStoreModal'
import { Phone, MapPin } from 'lucide-react'
import { useSWRConfig } from 'swr'

// Periods data for 2025
const PERIODS_2025 = [
  { id: 'P01', name: 'P01', quarter: 'Q1', start: '12/30/2024', end: '1/25/2025' },
  { id: 'P02', name: 'P02', quarter: 'Q1', start: '1/26/2025', end: '2/22/2025' },
  { id: 'P03', name: 'P03', quarter: 'Q1', start: '2/23/2025', end: '3/22/2025' },
  { id: 'P04', name: 'P04', quarter: 'Q2', start: '3/23/2025', end: '4/19/2025' },
  { id: 'P05', name: 'P05', quarter: 'Q2', start: '4/20/2025', end: '5/17/2025' },
  { id: 'P06', name: 'P06', quarter: 'Q2', start: '5/18/2025', end: '6/14/2025' },
  { id: 'P07', name: 'P07', quarter: 'Q3', start: '6/15/2025', end: '7/12/2025' },
  { id: 'P08', name: 'P08', quarter: 'Q3', start: '7/13/2025', end: '8/9/2025' },
  { id: 'P09', name: 'P09', quarter: 'Q3', start: '8/10/2025', end: '9/6/2025' },
  { id: 'P10', name: 'P10', quarter: 'Q4', start: '9/7/2025', end: '10/4/2025' },
  { id: 'P11', name: 'P11', quarter: 'Q4', start: '10/5/2025', end: '11/1/2025' },
  { id: 'P12', name: 'P12', quarter: 'Q4', start: '11/2/2025', end: '11/29/2025' },
  { id: 'P13', name: 'P13', quarter: 'Q4', start: '11/30/2025', end: '12/27/2025' },
]

export default function DashboardTwoPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState<any>(null)
  const { mutate } = useSWRConfig()
  const { user, restaurantIds, isLoading: userLoading, error: userError } = useUser()
  const { restaurants, isLoading: restaurantsLoading, error: restaurantsError } = useRestaurants(restaurantIds)
  const { updateStore, isUpdating } = useUpdateStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEditStore = (store: any) => {
    setSelectedStore(store)
    setEditModalOpen(true)
  }

  const handleSaveStore = async (storeId: number, data: { name: string; address: string; phone: string }) => {
    await updateStore(storeId, data)
    await mutate(
      (key) => Array.isArray(key) && key[0] === '/api/next/restaurants',
      undefined,
      { revalidate: true }
    )
  }

  useEffect(() => {
    if (restaurants.length > 0) {
      console.log('Restaurants with grouped users:', restaurants)
    }
  }, [restaurants])

  if (!mounted) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">dash 2</h1>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Select Restaurants</h2>
        </div>
        <div className="p-6">Loading...</div>
      </div>
    )
  }

  if (userLoading) return <div className="p-6">Loading user...</div>
  if (userError) return <div className="p-6">Error loading user: {userError.message}</div>
  if (restaurantsLoading) return <div className="p-6">Loading restaurants...</div>
  if (restaurantsError) return <div className="p-6">Error loading restaurants: {restaurantsError.message}</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">dash 2</h1>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Select Restaurants</h2>
      </div>

      {/* Periods Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          📅 FY 2025 Periods Schedule
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {PERIODS_2025.map((period) => {
            const startDate = new Date(period.start)
            const endDate = new Date(period.end)
            const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
            
            // Check if current period
            const today = new Date()
            const isCurrentPeriod = today >= startDate && today <= endDate
            
            return (
              <Card 
                key={period.id} 
                className={`bg-gradient-to-br border-2 hover:shadow-md transition-all duration-200 hover:scale-105 ${
                  isCurrentPeriod 
                    ? 'from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-300 dark:border-purple-700' 
                    : 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isCurrentPeriod ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {period.name}
                        {isCurrentPeriod && <span className="ml-1 text-xs text-purple-600 dark:text-purple-400">●</span>}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {period.quarter}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>Start:</span>
                      <span className="font-medium">
                        {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>End:</span>
                      <span className="font-medium">
                        {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-600">
                      <span>Duration:</span>
                      <span className="font-medium">{duration} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {(() => {
        const sortedRestaurants = [...restaurants].sort((a, b) => {
          const an = (a.name ?? `Store ${a.id}`)
          const bn = (b.name ?? `Store ${b.id}`)
          return an.localeCompare(bn, undefined, { numeric: true, sensitivity: 'base' })
        })
        return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedRestaurants.map((r) => {
          return (
            <Card 
              key={r.id} 
              className="transition-all duration-200 h-full flex flex-col hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/20 bg-card"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground uppercase">
                    {r.name ?? `Restaurant #${r.id}`}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {r.address ? (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-primary/10 text-primary hover:text-primary/80 hover:bg-primary/20 transition-all duration-200"
                        title={`Open ${r.address} in Google Maps`}
                      >
                        <MapPin className="h-4 w-4" />
                      </a>
                    ) : null}
                    {r.phone ? (
                      <a 
                        href={`tel:${r.phone}`} 
                        className="p-2 rounded-full bg-primary/10 text-primary hover:text-primary/80 hover:bg-primary/20 transition-all duration-200"
                        title={r.phone}
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 px-6">
                {r.address ? (
                  <div className="text-sm text-muted-foreground flex items-start">
                    <span className="text-muted-foreground/60 mr-2">📍</span>
                    {r.address}
                  </div>
                ) : null}
                
                {/* Users grouped by role */}
                {r.users && Object.keys(r.users).length > 0 && (
                  <div className="mt-4 space-y-3">
                    {Object.entries(r.users)
                      .filter(([role]) => role !== 'associate' && role !== 'tablet')
                      .map(([role, users]) => {
                        const userList = users as any[]
                        return (
                          <div key={role} className="bg-muted/50 rounded-lg p-3">
                            <div className="font-medium capitalize text-foreground text-sm mb-2">
                              {role.replace('_', ' ')} ({userList.length})
                            </div>
                            <div className="space-y-1">
                              {userList.map((user: any) => (
                                <div key={user.id} className="text-xs text-muted-foreground">
                                  • {user.fullName || user.email}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}

                {/* PL Reports Key Metrics - Show only latest available period */}
                {r.plReports && r.plReports.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="space-y-2">
                      {(() => {
                        // Find the latest available period
                        const availablePeriods = r.plReports.map((report: any) => {
                          const periodMatch = report.period.match(/P\d{2}/)
                          return periodMatch ? periodMatch[0] : null
                        }).filter(Boolean)
                        
                        // Find the latest period (highest P number)
                        let latestPeriodId = null
                        for (let i = PERIODS_2025.length - 1; i >= 0; i--) {
                          if (availablePeriods.includes(PERIODS_2025[i].id)) {
                            latestPeriodId = PERIODS_2025[i].id
                            break
                          }
                        }
                        
                        // Find the report for the latest period
                        const latestReport = r.plReports.find((report: any) => {
                          const periodMatch = report.period.match(/P\d{2}/)
                          return periodMatch && periodMatch[0] === latestPeriodId
                        })
                        
                        if (!latestReport) return null
                        
                        const sssPercentage = latestReport.keyMetrics?.sssPercentage
                        
                        return (
                          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg p-3 border border-purple-300 dark:border-purple-700">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-sm text-purple-900 dark:text-purple-100">
                                {latestReport.period}
                                <span className="ml-1 text-xs text-purple-600 dark:text-purple-400">●</span>
                              </div>
                              {sssPercentage !== null && (
                                <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                  sssPercentage >= 0 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {sssPercentage > 0 ? '+' : ''}{sssPercentage.toFixed(1)}% SSS
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )}

              </CardContent>
              <CardFooter className="pt-4 mt-auto px-6 pb-6">
                <div className="flex gap-2 w-full">
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex-1 font-medium py-2 rounded-lg transition-all duration-200"
                    onClick={() => handleEditStore(r)}
                  >
                    Edit Info
                  </Button>
                  <Button 
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-lg transition-all duration-200 hover:shadow-md"
                    onClick={() => router.push(`/store-dash/${r.id}`)}
                  >
                    More Info
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
        )
      })()}

      <EditStoreModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        store={selectedStore}
        onSave={handleSaveStore}
        isLoading={isUpdating}
      />
    </div>
  );
}


