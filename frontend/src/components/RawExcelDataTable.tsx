'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, EyeOff, Download } from "lucide-react";

interface RawExcelDataTableProps {
  reportId: number;
}

interface LineItem {
  id: number;
  category: string;
  subcategory: string;
  ledgerAccount: string;
  actuals: number;
  actualsPercentage: number;
  plan: number;
  planPercentage: number;
  vfp: number;
  priorYear: number;
  priorYearPercentage: number;
  actualYtd: number;
  actualYtdPercentage: number;
  planYtd: number;
  planYtdPercentage: number;
  vfpYtd: number;
  priorYearYtd: number;
  priorYearYtdPercentage: number;
  sortOrder: number;
}

interface RawData {
  report: any;
  lineItems: LineItem[];
}

export default function RawExcelDataTable({ reportId }: RawExcelDataTableProps) {
  const [rawData, setRawData] = useState<RawData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllColumns, setShowAllColumns] = useState(false);

  useEffect(() => {
    const fetchRawData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching raw data for reportId:', reportId);
        
        const response = await fetch(`/api/pl-reports/${reportId}/raw-data`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        console.log('Raw data response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Report not found in database - this is expected for mock data
            console.log('Report not found in database, using mock data');
            setRawData(null);
            setError('Report not found in database. This may be mock data.');
            return;
          }
          
          const errorText = await response.text();
          console.error('Raw data fetch error:', errorText);
          throw new Error(`Failed to fetch raw data: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Raw data received:', data);
        setRawData(data);
      } catch (err) {
        console.error('Raw data fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load raw data');
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchRawData();
    }
  }, [reportId]);

  const formatNumber = (value: any) => {
    if (value === null || value === undefined) return '0';
    
    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Check if it's a valid number
    if (isNaN(numValue)) return '0';
    
    if (numValue === 0) return '0';
    
    // Show exact value without any rounding or formatting
    return numValue.toString();
  };

  const formatPercentage = (value: any) => {
    if (value === null || value === undefined) return '0.00%';
    
    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Check if it's a valid number
    if (isNaN(numValue)) return '0.00%';
    
    // Round to 2 decimal places and show as percentage
    return (numValue * 100).toFixed(2) + '%';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading raw data for report ID: {reportId}...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="space-y-2">
            <p className="text-destructive font-medium">Raw Data Not Available</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground">Report ID: {reportId}</p>
            <p className="text-xs text-muted-foreground">
              This usually means the report is using mock data or hasn't been uploaded yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rawData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No raw data available</p>
        </CardContent>
      </Card>
    );
  }

  const columns = [
    { key: 'ledgerAccount', label: 'Ledger Account', width: 'w-48' },
    { key: 'actuals', label: 'Actuals', width: 'w-24' },
    { key: 'actualsPercentage', label: 'Actuals %', width: 'w-24' },
    { key: 'plan', label: 'Plan', width: 'w-24' },
    { key: 'planPercentage', label: 'Plan %', width: 'w-24' },
    { key: 'vfp', label: 'VFP', width: 'w-24' },
    { key: 'priorYear', label: 'Prior Year', width: 'w-24' },
    { key: 'priorYearPercentage', label: 'Prior Year %', width: 'w-24' },
    { key: 'actualYtd', label: 'Actual YTD', width: 'w-24' },
    { key: 'actualYtdPercentage', label: 'Actual YTD %', width: 'w-24' },
    { key: 'planYtd', label: 'Plan YTD', width: 'w-24' },
    { key: 'planYtdPercentage', label: 'Plan YTD %', width: 'w-24' },
    { key: 'vfpYtd', label: 'VFP YTD', width: 'w-24' },
    { key: 'priorYearYtd', label: 'Prior Year YTD', width: 'w-24' },
    { key: 'priorYearYtdPercentage', label: 'Prior Year %', width: 'w-24' },
  ];

  const visibleColumns = showAllColumns ? columns : columns.slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Raw Excel Data
            <Badge variant="outline">{rawData.lineItems.length} rows</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllColumns(!showAllColumns)}
            >
              {showAllColumns ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showAllColumns ? 'Hide Columns' : 'Show All Columns'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const csvContent = generateCSV(rawData.lineItems, showAllColumns);
                downloadCSV(csvContent, `raw-excel-data-${reportId}.csv`);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableHead key={column.key} className={`${column.width} text-xs`}>
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawData.lineItems.map((item, index) => (
                <TableRow key={item.id || index}>
                  {visibleColumns.map((column) => (
                    <TableCell key={column.key} className="text-xs">
                      {column.key === 'ledgerAccount' ? (
                        <div>
                          <div className="font-medium">{item.ledgerAccount}</div>
                          {item.category && (
                            <div className="text-xs text-muted-foreground">{item.category}</div>
                          )}
                        </div>
                      ) : column.key.includes('Percentage') ? (
                        formatPercentage(item[column.key as keyof LineItem] as number)
                      ) : (
                        formatNumber(item[column.key as keyof LineItem] as number)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function generateCSV(data: LineItem[], showAllColumns: boolean) {
  const columns = [
    'Ledger Account',
    'Actuals',
    'Actuals %',
    'Plan',
    'Plan %',
    'VFP',
    'Prior Year',
    'Prior Year %',
    'Actual YTD',
    'Actual YTD %',
    'Plan YTD',
    'Plan YTD %',
    'VFP YTD',
    'Prior Year YTD',
    'Prior Year %',
  ];

  const visibleColumns = showAllColumns ? columns : columns.slice(0, 8);
  const csvRows = [visibleColumns.join(',')];

  data.forEach((item) => {
    const row = [
      `"${item.ledgerAccount}"`,
      item.actuals,
      item.actualsPercentage,
      item.plan,
      item.planPercentage,
      item.vfp,
      item.priorYear,
      item.priorYearPercentage,
      item.actualYtd,
      item.actualYtdPercentage,
      item.planYtd,
      item.planYtdPercentage,
      item.vfpYtd,
      item.priorYearYtd,
      item.priorYearYtdPercentage,
    ];

    const visibleRow = showAllColumns ? row : row.slice(0, 8);
    csvRows.push(visibleRow.join(','));
  });

  return csvRows.join('\n');
}

function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
