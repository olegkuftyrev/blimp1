'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for the table
const mockData = [
  { id: 1, name: 'PX2475', revenue: '$125,430' },
  { id: 2, name: 'PX2476', revenue: '$98,750' },
  { id: 3, name: 'PX2477', revenue: '$156,890' },
  { id: 4, name: 'PX2478', revenue: '$87,320' },
  { id: 5, name: 'PX2479', revenue: '$203,150' },
  { id: 6, name: 'PX2480', revenue: '$142,670' },
  { id: 7, name: 'PX2481', revenue: '$95,430' },
  { id: 8, name: 'PX2482', revenue: '$178,920' },
  { id: 9, name: 'PX2483', revenue: '$134,580' },
  { id: 10, name: 'PX2484', revenue: '$167,340' },
];

export default function AreaPl() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Area P&L - Restaurant Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg font-semibold">Restaurant Name</TableHead>
                  <TableHead className="text-lg font-semibold">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell className="font-medium text-base">
                      {restaurant.name}
                    </TableCell>
                    <TableCell className="text-base">
                      {restaurant.revenue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
