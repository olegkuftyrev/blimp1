'use client';

import { useAuth } from '@/contexts/AuthContextSWR';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useSWRRestaurants } from '@/hooks/useSWRKitchen';

interface StorePageProps {
  params: Promise<{
    storeId: string;
  }>;
}

// Financial calendar periods (4-4-4 structure)
const PERIODS = [
  { id: 'P01', name: 'P01', quarter: 'Q1', start: '12/30', end: '1/25' },
  { id: 'P02', name: 'P02', quarter: 'Q1', start: '1/26', end: '2/22' },
  { id: 'P03', name: 'P03', quarter: 'Q1', start: '2/23', end: '3/22' },
  { id: 'P04', name: 'P04', quarter: 'Q2', start: '3/23', end: '4/19' },
  { id: 'P05', name: 'P05', quarter: 'Q2', start: '4/20', end: '5/17' },
  { id: 'P06', name: 'P06', quarter: 'Q2', start: '5/18', end: '6/14' },
  { id: 'P07', name: 'P07', quarter: 'Q3', start: '6/15', end: '7/12' },
  { id: 'P08', name: 'P08', quarter: 'Q3', start: '7/13', end: '8/9' },
  { id: 'P09', name: 'P09', quarter: 'Q3', start: '8/10', end: '9/6' },
  { id: 'P10', name: 'P10', quarter: 'Q4', start: '9/7', end: '10/4' },
  { id: 'P11', name: 'P11', quarter: 'Q4', start: '10/5', end: '11/1' },
  { id: 'P12', name: 'P12', quarter: 'Q4', start: '11/2', end: '11/29' },
  { id: 'P13', name: 'P13', quarter: 'Q4', start: '11/30', end: '12/27' },
];

// Current period is P10 (September 21, 2025)
const CURRENT_PERIOD = 'P10';

export default function StoreYearPage({ params }: StorePageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { restaurants, loading, error } = useSWRRestaurants();
  const [selectedYear, setSelectedYear] = useState(2025); // Default to current year

  useEffect(() => {
    if (user && user.role === 'associate') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user.role === 'associate') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-muted-foreground">Access denied. You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">{error}</p>
          <p className="text-muted-foreground">Failed to load restaurant</p>
        </div>
      </div>
    );
  }

  const resolvedParams = use(params);
  const storeId = parseInt(resolvedParams.storeId);
  const currentStore = restaurants.find(r => r.id === storeId);

  if (!currentStore) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">Restaurant not found</p>
          <Link href="/analytics" className="text-primary hover:underline">
            Back to Analytics
          </Link>
        </div>
      </div>
    );
  }

  // Generate available years (current year and previous years)
  const currentYear = 2025;
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Mock function to check if period has data (will be replaced with real API)
  const hasDataForPeriod = (periodId: string, year: number) => {
    // No data available for any periods yet
    return false;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/analytics" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Stores
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {currentStore.name}
        </h1>
        <p className="text-muted-foreground">
          Select a year and financial period to view reports
        </p>
      </div>

      {/* Year Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Select Year
        </h2>
        <div className="flex gap-2 flex-wrap">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => year === currentYear && setSelectedYear(year)}
              disabled={year !== currentYear}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                year === currentYear
                  ? 'bg-primary text-primary-foreground border-primary cursor-pointer'
                  : 'bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-50'
              }`}
            >
              {year}
              {year === currentYear && (
                <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Periods Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Financial Periods - {selectedYear} 
        </h2>
        
        {/* Group by quarters */}
        {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => {
          const quarterPeriods = PERIODS.filter(p => p.quarter === quarter);
          
          return (
            <div key={quarter} className="mb-6">
              <h3 className="text-lg font-medium text-foreground mb-3">{quarter}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {quarterPeriods.map((period) => {
                  const hasData = hasDataForPeriod(period.id, selectedYear);
                  const isCurrent = period.id === CURRENT_PERIOD && selectedYear === currentYear;
                  
                  return (
                    <Link key={period.id} href={`/analytics/${storeId}/${selectedYear}/${period.id}`}>
                      <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${
                        isCurrent ? 'ring-2 ring-primary' : ''
                      }`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{period.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              {hasData ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              {isCurrent && (
                                <Badge variant="default" className="text-xs">Current</Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                              {period.start}/{selectedYear === 2025 && period.id === 'P01' ? '24' : selectedYear} - {period.end}/{selectedYear}
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant={hasData ? "default" : "destructive"} className="text-xs">
                                {hasData ? "Data Available" : "Upload Required"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
