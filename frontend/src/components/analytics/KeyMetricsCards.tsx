'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface KeyMetricsCardsProps {
  keyMetrics: {
    cogsPercentage: number;
    laborPercentage: number;
    primeCost: number;
    controllableProfit: number;
    cogsColor: 'green' | 'red';
    laborColor: 'green' | 'red';
    primeCostColor: 'green' | 'red';
  };
}

export function KeyMetricsCards({ keyMetrics }: KeyMetricsCardsProps) {
  const { cogsPercentage, laborPercentage, primeCost, controllableProfit, cogsColor, laborColor, primeCostColor } = keyMetrics;
  return (
    <div className="space-y-6">
      {/* Prime Cost Card */}
      <Card>
        <CardHeader>
          <CardTitle>Prime Cost</CardTitle>
          <CardDescription>COGS% + Labor%</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">COGS%</span>
              <span className={`text-lg font-bold ${cogsColor === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                {cogsPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Labor%</span>
              <span className={`text-lg font-bold ${laborColor === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                {laborPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Prime Cost</span>
                <span className={`text-xl font-bold ${primeCostColor === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                  {primeCost.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Controllable Profit Card */}
      <Card className="h-fit">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Controllable Profit</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold">
            ${controllableProfit.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
