'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PLReportData {
  id: number;
  storeName: string;
  company: string;
  period: string;
  translationCurrency: string;
  netSales: number;
  grossSales: number;
  costOfGoodsSold: number;
  totalLabor: number;
  controllables: number;
  controllableProfit: number;
  advertising: number;
  fixedCosts: number;
  restaurantContribution: number;
  cashflow: number;
  totalTransactions: number;
  checkAverage: number;
  directLaborHours: number;
  averageHourlyWage: number;
  managementHeadcount: number;
  assistantManagerHeadcount: number;
  chefHeadcount: number;
  breakfastPercentage: number;
  lunchPercentage: number;
  afternoonPercentage: number;
  eveningPercentage: number;
  dinnerPercentage: number;
  dineInPercentage: number;
  takeOutPercentage: number;
  driveThruPercentage: number;
  thirdPartyDigitalPercentage: number;
  pandaDigitalPercentage: number;
  inStoreCateringPercentage: number;
  cateringSales: number;
  pandaDigitalSales: number;
  thirdPartyDigitalSales: number;
  rewardRedemptions: number;
  fundraisingEventsSales: number;
  virtualFundraisingSales: number;
  createdAt: string;
  updatedAt: string;
}

interface PLReportTableProps {
  report: PLReportData;
  lineItems?: any[];
}

export function PLReportTable({ report, lineItems = [] }: PLReportTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: report.translationCurrency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Use real line items data from props, or fallback to empty array
  const displayLineItems = lineItems.length > 0 ? lineItems : [];

  const formatValue = (value: number, isPercentage: boolean = false) => {
    if (isPercentage) {
      return formatPercentage(value);
    }
    return formatCurrency(value);
  };

  const getValueStyle = (value: number, isPercentage: boolean = false) => {
    if (value < 0) {
      return 'text-red-600';
    }
    return 'text-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>P&L Report - {report.period}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {report.storeName} - {report.company}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Ledger Account</th>
                <th className="text-right p-2 font-medium">Actuals</th>
                <th className="text-right p-2 font-medium">Actuals %</th>
                <th className="text-right p-2 font-medium">Plan</th>
                <th className="text-right p-2 font-medium">Plan %</th>
                <th className="text-right p-2 font-medium">VFP</th>
                <th className="text-right p-2 font-medium">Prior Year</th>
                <th className="text-right p-2 font-medium">Prior Year %</th>
                <th className="text-right p-2 font-medium">Actual YTD</th>
                <th className="text-right p-2 font-medium">Actual YTD %</th>
                <th className="text-right p-2 font-medium">Plan YTD</th>
                <th className="text-right p-2 font-medium">Plan YTD %</th>
                <th className="text-right p-2 font-medium">VFP YTD</th>
                <th className="text-right p-2 font-medium">Prior Year YTD</th>
                <th className="text-right p-2 font-medium">Prior Year %</th>
              </tr>
            </thead>
            <tbody>
              {displayLineItems.map((item, index) => (
                <tr 
                  key={index} 
                  className={`border-b ${
                    item.isSubtotal || item.isTotal 
                      ? 'border-t-2 border-b-2 font-bold bg-muted/50' 
                      : ''
                  }`}
                >
                  <td className="p-2">
                    {item.isSubtotal || item.isTotal ? (
                      <div className="font-bold">{item.ledgerAccount}</div>
                    ) : (
                      <div className="pl-4">{item.ledgerAccount}</div>
                    )}
                  </td>
                  <td className={`text-right p-2 ${getValueStyle(item.actuals)}`}>
                    {formatValue(item.actuals)}
                  </td>
                  <td className={`text-right p-2 ${getValueStyle(item.actualsPercentage, true)}`}>
                    {formatValue(item.actualsPercentage, true)}
                  </td>
                  <td className={`text-right p-2 ${getValueStyle(item.plan)}`}>
                    {formatValue(item.plan)}
                  </td>
                  <td className={`text-right p-2 ${getValueStyle(item.planPercentage, true)}`}>
                    {formatValue(item.planPercentage, true)}
                  </td>
                  <td className={`text-right p-2 ${getValueStyle(item.vfp)}`}>
                    {formatValue(item.vfp)}
                  </td>
                  <td className={`text-right p-2 ${getValueStyle(item.priorYear)}`}>
                    {formatValue(item.priorYear)}
                  </td>
                  <td className={`text-right p-2 ${getValueStyle(item.priorYearPercentage, true)}`}>
                    {formatValue(item.priorYearPercentage, true)}
                  </td>
                  <td className={`text-right p-2 ${getValueStyle(item.actualYtd)}`}>
                    {formatValue(item.actualYtd)}
                  </td>
                  <td className={`text-right p-2 ${getValueStyle(item.actualYtdPercentage, true)}`}>
                    {formatValue(item.actualYtdPercentage, true)}
                  </td>
                  <td className={`text-right p-2 ${getValueStyle(item.planYtd)}`}>
                    {formatValue(item.planYtd)}
                  </td>
                  <td className={`text-right p-2 ${getValueStyle(item.planYtdPercentage, true)}`}>
                    {formatValue(item.planYtdPercentage, true)}
                  </td>
                  <td className={`text-right p-2 ${getValueStyle(item.vfpYtd)}`}>
                    {formatValue(item.vfpYtd)}
                  </td>
                  <td className={`text-right p-2 ${getValueStyle(item.priorYearYtd)}`}>
                    {formatValue(item.priorYearYtd)}
                  </td>
                  <td className={`text-right p-2 ${getValueStyle(item.priorYearYtdPercentage, true)}`}>
                    {formatValue(item.priorYearYtdPercentage, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
