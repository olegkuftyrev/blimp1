'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PLReportDataTable } from '@/components/PLReportDataTable';
import { PLLineItem } from '@/hooks/useSWRPL';

interface CollapsibleTableProps {
  title: string;
  plReport: any;
  plLineItems: PLLineItem[];
  filterFunction: (item: PLLineItem) => boolean;
}

export function CollapsibleTable({ title, plReport, plLineItems, filterFunction }: CollapsibleTableProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle>{title}</CardTitle>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <PLReportDataTable 
              report={plReport} 
              lineItems={plLineItems.filter(filterFunction)} 
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
