'use client'

import { Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContextSWR'
import Navigation from '@/components/ImprovedNavigation'
import AppBreadcrumb from '@/components/AppBreadcrumb'
import { ConditionalSidebar } from '@/components/ConditionalSidebar'

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const isTablet = user?.role === 'tablet'

  // If no user is authenticated, render children without navigation (landing page)
  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!isTablet && <Navigation />}
      {isTablet ? (
        <main className="flex-1">
          {children}
        </main>
      ) : (
        <div className="flex-1 pt-16">
          <ConditionalSidebar>
            <main className="flex-1">
              <div className="container mx-auto px-4 pt-4">
                <Suspense fallback={<div className="h-8" />}>
                  <AppBreadcrumb />
                </Suspense>
              </div>
              {children}
            </main>
          </ConditionalSidebar>
        </div>
      )}
    </div>
  )
}


