'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Clock,
  BarChart3,
  FileText,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface PLReportData {
  id: number;
  storeName: string;
  company: string;
  period: string;
  translationCurrency: string;
  year: number;
  fileName: string;
  fileSize: number;
  uploadStatus: string;
  errorMessage?: string;
  uploadedBy?: number;
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

interface PLReportDisplayProps {
  report: PLReportData;
}

export function PLReportDisplay({ report }: PLReportDisplayProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: report.translationCurrency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 20,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatNumber = (value: number) => {
    return value.toString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* File Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            File Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">File Name</span>
              </div>
              <p className="text-sm text-muted-foreground truncate" title={report.fileName}>
                {report.fileName || 'N/A'}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">File Size</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {report.fileSize ? formatFileSize(report.fileSize) : 'N/A'}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(report.uploadStatus)}
                <span className="text-sm font-medium">Status</span>
              </div>
              <Badge className={getStatusColor(report.uploadStatus)}>
                {report.uploadStatus || 'Unknown'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Year</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {report.year || 'N/A'}
              </p>
            </div>
          </div>
          
          {report.errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-800">Error Message</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{report.errorMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(report.netSales)}</div>
            <p className="text-xs text-muted-foreground">
              Gross: {formatCurrency(report.grossSales)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Labor</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(report.totalLabor)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(report.directLaborHours)} hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Controllable Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(report.controllableProfit)}</div>
            <p className="text-xs text-muted-foreground">
              Margin: {formatPercentage(report.controllableProfit / report.netSales)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(report.cashflow)}</div>
            <p className="text-xs text-muted-foreground">
              Transactions: {formatNumber(report.totalTransactions)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Net Sales</span>
              <span className="font-mono">{formatCurrency(report.netSales)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Gross Sales</span>
              <span className="font-mono">{formatCurrency(report.grossSales)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Catering Sales</span>
              <span className="font-mono">{formatCurrency(report.cateringSales)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Panda Digital</span>
              <span className="font-mono">{formatCurrency(report.pandaDigitalSales)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Third Party Digital</span>
              <span className="font-mono">{formatCurrency(report.thirdPartyDigitalSales)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cost of Goods Sold</span>
              <span className="font-mono">{formatCurrency(report.costOfGoodsSold)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Labor</span>
              <span className="font-mono">{formatCurrency(report.totalLabor)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Controllables</span>
              <span className="font-mono">{formatCurrency(report.controllables)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Advertising</span>
              <span className="font-mono">{formatCurrency(report.advertising)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Fixed Costs</span>
              <span className="font-mono">{formatCurrency(report.fixedCosts)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Check Average</span>
              <span className="font-mono">{formatCurrency(report.checkAverage)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Transactions</span>
              <span className="font-mono">{formatNumber(report.totalTransactions)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Dine In</span>
              <Badge variant="outline">{formatPercentage(report.dineInPercentage)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Take Out</span>
              <Badge variant="outline">{formatPercentage(report.takeOutPercentage)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Drive Thru</span>
              <Badge variant="outline">{formatPercentage(report.driveThruPercentage)}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daypart Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Breakfast</span>
              <Badge variant="outline">{formatPercentage(report.breakfastPercentage)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Lunch</span>
              <Badge variant="outline">{formatPercentage(report.lunchPercentage)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Afternoon</span>
              <Badge variant="outline">{formatPercentage(report.afternoonPercentage)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Evening</span>
              <Badge variant="outline">{formatPercentage(report.eveningPercentage)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Dinner</span>
              <Badge variant="outline">{formatPercentage(report.dinnerPercentage)}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Labor Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Labor Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Headcount</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Management</span>
                  <span>{report.managementHeadcount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Assistant Managers</span>
                  <span>{report.assistantManagerHeadcount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Chefs</span>
                  <span>{report.chefHeadcount}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Hours & Wages</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Direct Labor Hours</span>
                  <span>{formatNumber(report.directLaborHours)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Average Hourly Wage</span>
                  <span>{formatCurrency(report.averageHourlyWage)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Digital Sales</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Panda Digital</span>
                  <Badge variant="outline">{formatPercentage(report.pandaDigitalPercentage)}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Third Party Digital</span>
                  <Badge variant="outline">{formatPercentage(report.thirdPartyDigitalPercentage)}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>In-Store Catering</span>
                  <Badge variant="outline">{formatPercentage(report.inStoreCateringPercentage)}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

