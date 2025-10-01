'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react";

interface LeaderboardItem {
  restaurantId: number;
  restaurantName: string;
  netSales: number;
  cogs: number;
  labor: number;
  controllableProfit: number;
  profitMargin: number;
  laborPct: number;
  cogsPct: number;
  reportCount: number;
}

interface SSSTableProps {
  selectedRestaurants: number[];
  selectedYear: string;
  selectedPeriod: string;
  basis: string;
  restaurants: any[];
  leaderboardData: LeaderboardItem[];
  loading: boolean;
  error: any;
}

export default function SSSTable({ selectedRestaurants, selectedYear, selectedPeriod, basis, restaurants, leaderboardData, loading, error }: SSSTableProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Use leaderboard data directly
  const sssData = leaderboardData || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleSort = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const getSortIcon = () => {
    return sortOrder === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />;
  };

  const sortedData = [...sssData].sort((a, b) => {
    return sortOrder === 'desc' 
      ? b.netSales - a.netSales 
      : a.netSales - b.netSales;
  });

  const getSSSBadgeVariant = (sss: number) => {
    if (sss >= 5) return 'default'; // Green
    if (sss >= 0) return 'secondary'; // Yellow
    return 'destructive'; // Red
  };

  const getSSSColor = (sss: number) => {
    if (sss >= 5) return 'text-green-600';
    if (sss >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Net Sales Actual Performance</span>
          <Badge variant="outline">
            {sssData.length} stores
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Current Year {selectedYear} {selectedPeriod} Net Sales ({basis} basis)
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading Net Sales data...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Error loading Net Sales data
          </div>
        ) : sssData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No Net Sales data available for the selected filters
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={handleSort}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Net Sales</span>
                      {getSortIcon()}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item, index) => (
                  <TableRow key={item.restaurantId}>
                    <TableCell className="font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.restaurantName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-green-600">
                          {formatCurrency(item.netSales)}
                        </span>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Summary Stats */}
        {sssData.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(sssData.reduce((sum, item) => sum + item.netSales, 0))}
                </div>
                <div className="text-muted-foreground">Total Net Sales</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {sssData.length}
                </div>
                <div className="text-muted-foreground">Active Stores</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
