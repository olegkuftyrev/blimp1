'use client';

import { useAuth } from '@/contexts/AuthContextSWR';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSWRRestaurants } from '@/hooks/useSWRKitchen';
import { usePLReports, usePLLineItems, useDeletePLReport, PLLineItem, PLCalculations } from '@/hooks/useSWRPL';
import { mutate } from 'swr';
import { PLReportDataTable } from '@/components/PLReportDataTable';
import { PLDashboard } from '@/components/PLDashboard';

// Import new components
import { ChartBarMultiple } from '@/components/analytics/ChartBarMultiple';
import { ChartPieLabel } from '@/components/analytics/ChartPieLabel';
import { FileUploadSection } from '@/components/analytics/FileUploadSection';
import { TestingTable } from '@/components/analytics/TestingTable';
import { KeyMetricsCards } from '@/components/analytics/KeyMetricsCards';
import { CollapsibleTable } from '@/components/analytics/CollapsibleTable';
import { PageHeader } from '@/components/analytics/PageHeader';

interface PeriodReportPageProps {
  params: Promise<{
    storeId: string;
    year: string;
    period: string;
  }>;
}


export default function PeriodReportPage({ params }: PeriodReportPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { restaurants, loading, error } = useSWRRestaurants();
  
  const [resolvedParams, setResolvedParams] = useState<{
    storeId: string;
    year: string;
    period: string;
  } | null>(null);
  
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);
  
  // Removed role restriction - associates can now access analytics

  // Use SWR hooks for data fetching
  const { reports, loading: reportsLoading, error: reportsError } = usePLReports(
    resolvedParams ? parseInt(resolvedParams.storeId) : undefined,
    resolvedParams?.period || undefined
  );
  
  const plReport = reports?.length > 0 ? reports[0] : null;
  
  const { lineItems, calculations, loading: lineItemsLoading, error: lineItemsError } = usePLLineItems(
    plReport?.id || undefined
  );
  
  const plLineItems = plReport?.lineItems || lineItems || [];

  // Get store info for display
  const currentStore = restaurants?.find((r: any) => r.id === (resolvedParams ? parseInt(resolvedParams.storeId) : 0));
  
  // Delete report hook
  const { deleteReport, isDeleting, deleteError } = useDeletePLReport();

  // Handle delete report
  const handleDeleteReport = async () => {
    if (!plReport?.id || !resolvedParams) return;
    
    try {
      await deleteReport({ 
        reportId: plReport.id,
        mutate: async () => {
          // Invalidate all P&L related caches to ensure UI updates
          await mutate(
            (key) => typeof key === 'string' && key.includes('pl-reports'),
            undefined,
            { revalidate: true }
          );
          
          // Also invalidate the specific period cache
          await mutate(`pl-reports?restaurantId=${resolvedParams.storeId}&period=${resolvedParams.period}`);
          
          return Promise.resolve();
        }
      });
      
      // Navigate back to the store page after successful deletion
      router.push(`/analytics/${resolvedParams.storeId}`);
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  if (!resolvedParams) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  const storeId = parseInt(resolvedParams.storeId);
  const year = parseInt(resolvedParams.year);
  const period = resolvedParams.period;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-muted-foreground">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-destructive">Error loading restaurants: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!currentStore) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">Restaurant not found</p>
          <Link href="/analytics" className="text-primary hover:underline">
            ← Back to Analytics
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <PageHeader 
        storeName={currentStore.name}
        period={resolvedParams.period}
        year={parseInt(resolvedParams.year)}
        userRole={user?.role}
        onDeleteReport={handleDeleteReport}
        isDeleting={isDeleting}
      />

      {/* Dashboard with Key Metrics */}
      {plReport && plLineItems.length > 0 && calculations?.dashboard && (
        <div className="mb-8">
          <PLDashboard 
            data={{
              netSales: calculations.dashboard.netSales,
              priorNetSales: calculations.dashboard.priorNetSales,
              sssPercentage: calculations.dashboard.sssPercentage,
              cogsPercentage: calculations.dashboard.cogsPercentage,
              laborPercentage: calculations.dashboard.laborPercentage,
              controllableProfitPercentage: calculations.dashboard.controllableProfitPercentage,
              totalTransactions: calculations.dashboard.totalTransactions,
              priorTransactions: calculations.dashboard.priorTransactions,
              sstPercentage: calculations.dashboard.sstPercentage,
              checkAverage: calculations.dashboard.checkAverage,
              priorCheckAverage: calculations.dashboard.priorCheckAverage,
              thirdPartyDigitalSales: calculations.dashboard.thirdPartyDigitalSales,
              pandaDigitalSales: calculations.dashboard.pandaDigitalSales,
            }}
          />
        </div>
      )}

      {/* Key Metrics Grid */}
      {plReport && plLineItems.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart - первый столбец */}
            <div>
              {calculations?.charts?.pieChart ? (
                (() => {
                  console.log('Main page - calculations:', calculations);
                  console.log('Main page - calculations.charts:', calculations.charts);
                  console.log('Main page - calculations.charts.pieChart:', calculations.charts.pieChart);
                  return <ChartPieLabel pieChartData={calculations.charts.pieChart} />;
                })()
              ) : (
                <div className="bg-card rounded-lg shadow p-6">
                  <div className="text-center text-muted-foreground">
                    <p>Loading chart data...</p>
                    <p className="text-sm mt-2">calculations: {calculations ? 'exists' : 'null'}</p>
                    <p className="text-sm">charts: {calculations?.charts ? 'exists' : 'null'}</p>
                    <p className="text-sm">pieChart: {calculations?.charts?.pieChart ? 'exists' : 'null'}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Второй столбец с карточками */}
            <div>
              {calculations?.keyMetrics ? (
                <KeyMetricsCards keyMetrics={calculations.keyMetrics} />
              ) : (
                <div className="bg-card rounded-lg shadow p-6">
                  <div className="text-center text-muted-foreground">
                    <p>Loading key metrics...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chart Bar Multiple */}
      {plReport && plLineItems.length > 0 && calculations?.charts?.costOfSales && (
        <div className="mb-8">
          <ChartBarMultiple costOfSalesData={calculations.charts.costOfSales} />
        </div>
      )}

      {/* Cost Of Sales Table */}
      {plReport && plLineItems.length > 0 && (
        <CollapsibleTable
          title="Cost Of Sales Table"
          plReport={plReport}
          plLineItems={plLineItems}
          filterFunction={(item: PLLineItem) => 
            item.ledgerAccount === 'Grocery' || 
            item.ledgerAccount === 'Meat' || 
            item.ledgerAccount === 'Produce' || 
            item.ledgerAccount === 'Sea Food' ||
            item.ledgerAccount === 'DRinks' ||
            item.ledgerAccount === 'Paper Goods' ||
            item.ledgerAccount === 'Other' ||
            item.ledgerAccount === 'Cost of Goods Sold'
          }
        />
      )}


      {/* Testing Table - Mock Data for Calculations */}
      <TestingTable 
        calculations={calculations} 
        lineItemsLoading={lineItemsLoading}
        storeName={currentStore?.name}
        storePIC={user?.fullName || 'N/A'}
      />

      {/* Ready to Use Table - Real Data */}
      {plReport && plLineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Ready to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <PLReportDataTable 
              report={plReport} 
              lineItems={plLineItems.filter((item: PLLineItem) => 
                item.ledgerAccount === 'Net Sales' ||
                item.ledgerAccount === 'Gross Sales' ||
                item.ledgerAccount === 'Total Labor' ||
                item.ledgerAccount === 'Direct Labor' ||
                item.ledgerAccount === 'Management Labor' ||
                item.ledgerAccount === 'Taxes and Benefits' ||
                item.ledgerAccount === 'Total Transactions' ||
                item.ledgerAccount === 'Check Avg - Net' ||
                item.ledgerAccount === 'Cost of Goods Sold' ||
                item.ledgerAccount === 'Controllable Profit' ||
                item.ledgerAccount === 'Restaurant Contribution' ||
                item.ledgerAccount === 'Cashflow' ||
                item.ledgerAccount === 'Amortization' ||
                item.ledgerAccount === 'Depreciation' ||
                item.ledgerAccount === 'Fixed Costs' ||
                item.ledgerAccount === 'Average Hourly Wage' ||
                item.ledgerAccount === 'Workers Comp'
              )} 
            />
          </CardContent>
        </Card>
      )}

      {/* File Upload - Only show when no report exists */}
      {!plReport && resolvedParams && (
        <FileUploadSection 
          storeId={parseInt(resolvedParams.storeId)}
          year={parseInt(resolvedParams.year)}
          period={resolvedParams.period}
        />
      )}

      {/* Sales Table */}
      {plReport && plLineItems.length > 0 && (
        <CollapsibleTable
          title="Sales Table"
          plReport={plReport}
          plLineItems={plLineItems}
          filterFunction={(item: PLLineItem) => 
            item.ledgerAccount === 'Food Sales' || 
            item.ledgerAccount === 'Drink Sales' || 
            item.ledgerAccount === 'Retail Sales' || 
            item.ledgerAccount === 'Gross Sales' ||
            item.ledgerAccount === 'Promotions' ||
            item.ledgerAccount === 'Employee Meals' ||
            item.ledgerAccount === '20% Emp Discount' ||
            item.ledgerAccount === 'Coupons/Promotions' ||
            item.ledgerAccount === 'Net Sales'
          }
        />
      )}

  
      {/* Labor Table */}
      {plReport && plLineItems.length > 0 && (
        <CollapsibleTable
          title="Labor Table"
          plReport={plReport}
          plLineItems={plLineItems}
          filterFunction={(item: PLLineItem) => 
            item.ledgerAccount === 'Labor' || 
            item.ledgerAccount === 'Front' || 
            item.ledgerAccount === 'Back' || 
            item.ledgerAccount === 'Overtime' ||
            item.ledgerAccount === 'Training Wages' ||
            item.ledgerAccount === 'Emergency Store Closure Pay' ||
            item.ledgerAccount === 'Direct Labor' ||
            item.ledgerAccount === 'GM Salaries' ||
            item.ledgerAccount === 'GM Overtime' ||
            item.ledgerAccount === 'Other MGMT Salaries' ||
            item.ledgerAccount === 'Other MGMT Overtime' ||
            item.ledgerAccount === 'Guaranteed Hourly' ||
            item.ledgerAccount === 'Bereavement Pay' ||
            item.ledgerAccount === 'Guaranteed Overtime' ||
            item.ledgerAccount === 'Management Labor' ||
            item.ledgerAccount === 'Payroll Taxes' ||
            item.ledgerAccount === 'Meal break Premium' ||
            item.ledgerAccount === 'Rest Break Premium' ||
            item.ledgerAccount === 'Scheduling Premium Pay' ||
            item.ledgerAccount === 'Workers Comp' ||
            item.ledgerAccount === 'Benefits' ||
            item.ledgerAccount === 'Bonus' ||
            item.ledgerAccount === 'Vacation' ||
            item.ledgerAccount === 'Taxes and Benefits' ||
            item.ledgerAccount === 'Total Labor'
          }
        />
      )}

      {/* Controllables Table */}
      {plReport && plLineItems.length > 0 && (
        <CollapsibleTable
          title="Controllables Table"
          plReport={plReport}
          plLineItems={plLineItems}
          filterFunction={(item: PLLineItem) => 
            item.ledgerAccount === 'Controllables' || 
            item.ledgerAccount === 'Third Party Delivery Fee' || 
            item.ledgerAccount === 'Credit Card Fees' || 
            item.ledgerAccount === 'Broadband' ||
            item.ledgerAccount === 'Electricity' ||
            item.ledgerAccount === 'Gas' ||
            item.ledgerAccount === 'Telephone' ||
            item.ledgerAccount === 'Waste Disposal' ||
            item.ledgerAccount === 'Water' ||
            item.ledgerAccount === 'Computer Software Expense' ||
            item.ledgerAccount === 'Office and Computer Supplies' ||
            item.ledgerAccount === 'Education and Training Other' ||
            item.ledgerAccount === 'Recruitment' ||
            item.ledgerAccount === 'Professional Services' ||
            item.ledgerAccount === 'Travel Expenses' ||
            item.ledgerAccount === 'Bank Fees' ||
            item.ledgerAccount === 'Dues and Subscriptions' ||
            item.ledgerAccount === 'Moving and Relocation Expenses' ||
            item.ledgerAccount === 'Other Expenses' ||
            item.ledgerAccount === 'Postage and Courier Service' ||
            item.ledgerAccount === 'Repairs' ||
            item.ledgerAccount === 'Maintenance' ||
            item.ledgerAccount === 'Restaurant Expenses' ||
            item.ledgerAccount === 'Restaurant Supplies' ||
            item.ledgerAccount === 'Total Controllables'
          }
        />
      )}

      {/* Controllable Profit Table */}
      {plReport && plLineItems.length > 0 && (
        <CollapsibleTable
          title="Controllable Profit Table"
          plReport={plReport}
          plLineItems={plLineItems}
          filterFunction={(item: PLLineItem) => 
            item.ledgerAccount === 'Profit Before Adv' || 
            item.ledgerAccount === 'Advertising' || 
            item.ledgerAccount === 'Corporate Advertising' || 
            item.ledgerAccount === 'Media' ||
            item.ledgerAccount === 'Local Store Marketing' ||
            item.ledgerAccount === 'Grand Opening' ||
            item.ledgerAccount === 'Lease Marketing' ||
            item.ledgerAccount === 'Advertising' ||
            item.ledgerAccount === 'Controllable Profit'
          }
        />
      )}

      {/* Fixed Costs Table */}
      {plReport && plLineItems.length > 0 && (
        <CollapsibleTable
          title="Fixed Costs Table"
          plReport={plReport}
          plLineItems={plLineItems}
          filterFunction={(item: PLLineItem) => 
            item.ledgerAccount === 'Fixed Costs' || 
            item.ledgerAccount === 'Rent - MIN' || 
            item.ledgerAccount === 'Rent - Storage' || 
            item.ledgerAccount === 'Rent - Percent' ||
            item.ledgerAccount === 'Rent - Other' ||
            item.ledgerAccount === 'Rent - Deferred Preopening' ||
            item.ledgerAccount === 'Insurance' ||
            item.ledgerAccount === 'Taxes' ||
            item.ledgerAccount === 'License and Fees' ||
            item.ledgerAccount === 'Amortization' ||
            item.ledgerAccount === 'Depreciation' ||
            item.ledgerAccount === 'Total Fixed Cost'
          }
        />
      )}

      {/* RC&Cash Flow Table */}
      {plReport && plLineItems.length > 0 && (
        <CollapsibleTable
          title="RC&Cash Flow Table"
          plReport={plReport}
          plLineItems={plLineItems}
          filterFunction={(item: PLLineItem) => 
            item.ledgerAccount === 'Restaurant Contribution' ||
            item.ledgerAccount === 'Cashflow'
          }
        />
      )}

      {/* Sales Data Statistics Table */}
      {plReport && plLineItems.length > 0 && (
        <CollapsibleTable
          title="Sales Data Statistics Table"
          plReport={plReport}
          plLineItems={plLineItems}
          filterFunction={(item: PLLineItem) => 
            item.ledgerAccount === 'Total Transactions' || 
            item.ledgerAccount === 'Check Avg - Net' || 
            item.ledgerAccount === 'Fundraising Events Sales' || 
            item.ledgerAccount === 'Virtual Fundraising Sales' ||
            item.ledgerAccount === 'Catering Sales' ||
            item.ledgerAccount === 'Panda Digital Sales' ||
            item.ledgerAccount === '3rd Party Digital Sales' ||
            item.ledgerAccount === 'Reward Redemptions' ||
            item.ledgerAccount === 'Daypart & Sales Channel %' ||
            item.ledgerAccount === 'Breakfast %' ||
            item.ledgerAccount === 'Lunch %' ||
            item.ledgerAccount === 'Afternoon %' ||
            item.ledgerAccount === 'Evening %' ||
            item.ledgerAccount === 'Dinner %' ||
            item.ledgerAccount === 'Dine In %' ||
            item.ledgerAccount === 'Take Out %' ||
            item.ledgerAccount === 'Drive Thru %' ||
            item.ledgerAccount === '3rd Party Digital %' ||
            item.ledgerAccount === 'Panda Digital %' ||
            item.ledgerAccount === 'In Store Catering %'
          }
        />
      )}

      {/* Labor Statistics Table */}
      {plReport && plLineItems.length > 0 && (
        <CollapsibleTable
          title="Labor Statistics Table"
          plReport={plReport}
          plLineItems={plLineItems}
          filterFunction={(item: PLLineItem) => 
            item.ledgerAccount === 'Direct Labor Hours Total' || 
            item.ledgerAccount === 'Average Hourly Wage' || 
            item.ledgerAccount === 'Direct Labor Hours' || 
            item.ledgerAccount === 'Overtime Hours' ||
            item.ledgerAccount === 'Training Hours' ||
            item.ledgerAccount === 'Guaranteed Hours' ||
            item.ledgerAccount === 'Management Hours' ||
            item.ledgerAccount === 'Direct Hours Productivity' ||
            item.ledgerAccount === 'Total Hours Productivity' ||
            item.ledgerAccount === 'Direct Hours Transaction Productivity' ||
            item.ledgerAccount === 'Total Hours Transaction Productivity' ||
            item.ledgerAccount === 'Management Headcount' ||
            item.ledgerAccount === 'Assistant Manager Headcount' ||
            item.ledgerAccount === 'Chef Headcount'
          }
        />
      )}

      {/* PSA Table */}
      {plReport && plLineItems.length > 0 && (
        <CollapsibleTable
          title="PSA Table"
          plReport={plReport}
          plLineItems={plLineItems}
          filterFunction={(item: PLLineItem) => 
            item.ledgerAccount === 'PSA - Per Store Average' || 
            item.ledgerAccount === 'Store Period' || 
            item.ledgerAccount === 'PSA - Transactions' || 
            item.ledgerAccount === 'PSA - Net Sales' ||
            item.ledgerAccount === 'PSA - Total Labor' ||
            item.ledgerAccount === 'PSA - Controllables' ||
            item.ledgerAccount === 'PSA - Control Profit' ||
            item.ledgerAccount === 'PSA - Fixed Costs' ||
            item.ledgerAccount === 'PSA - Rests Contribution' ||
            item.ledgerAccount === 'PSA - Cash Flow'
          }
        />
      )}
    </div>
  );
}