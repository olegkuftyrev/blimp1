'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLLineItem } from '@/hooks/useSWRPL';

interface KeyMetricsCardsProps {
  plLineItems: PLLineItem[];
}

export function KeyMetricsCards({ plLineItems }: KeyMetricsCardsProps) {
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
              <span className={`text-lg font-bold ${
                (plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Cost of Goods Sold') ? parseFloat(plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Cost of Goods Sold')?.actualsPercentage?.toString() || '0') * 100 : 0) < 30 
                ? 'text-green-600' : 'text-red-600'
              }`}>
                {plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Cost of Goods Sold') ? (parseFloat(plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Cost of Goods Sold')?.actualsPercentage?.toString() || '0') * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Labor%</span>
              <span className={`text-lg font-bold ${
                (plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Total Labor') ? parseFloat(plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Total Labor')?.actualsPercentage?.toString() || '0') * 100 : 0) < 30 
                ? 'text-green-600' : 'text-red-600'
              }`}>
                {plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Total Labor') ? (parseFloat(plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Total Labor')?.actualsPercentage?.toString() || '0') * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Prime Cost</span>
                <span className={`text-xl font-bold ${
                  ((plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Cost of Goods Sold') ? parseFloat(plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Cost of Goods Sold')?.actualsPercentage?.toString() || '0') * 100 : 0) + 
                   (plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Total Labor') ? parseFloat(plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Total Labor')?.actualsPercentage?.toString() || '0') * 100 : 0)) > 60 
                  ? 'text-red-600' : 'text-green-600'
                }`}>
                  {((plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Cost of Goods Sold') ? parseFloat(plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Cost of Goods Sold')?.actualsPercentage?.toString() || '0') * 100 : 0) + 
                    (plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Total Labor') ? parseFloat(plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Total Labor')?.actualsPercentage?.toString() || '0') * 100 : 0)).toFixed(1)}%
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
            ${parseFloat(plLineItems.find((item: PLLineItem) => item.ledgerAccount === 'Controllable Profit')?.actuals?.toString() || '0').toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
