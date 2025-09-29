'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PLCalculations } from '@/hooks/useSWRPL';

interface TestingTableProps {
  calculations: PLCalculations | null;
  lineItemsLoading: boolean;
}

export function TestingTable({ calculations, lineItemsLoading }: TestingTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Testing</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Results</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">SSS (Same Store Sales)</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.sss !== undefined ? (
                  <span className={calculations.sss >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {calculations.sss.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">SST% (Same Store Transactions)</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.sst !== undefined ? (
                  <span className={calculations.sst >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {calculations.sst.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Prime Cost</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.primeCost !== undefined ? (
                  <span className="text-blue-600">
                    {(calculations.primeCost * 100).toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Rent Total</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.rentTotal !== undefined ? (
                  <span className="text-purple-600">
                    ${calculations.rentTotal.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Overtime Hours</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.overtimeHours !== undefined ? (
                  <span className="text-orange-600">
                    {calculations.overtimeHours.toFixed(2)} hours
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Flow Thru</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.flowThru !== undefined ? (
                  <span className={calculations.flowThru >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {calculations.flowThru.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Adjusted Controllable Profit</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.adjustedControllableProfitThisYear !== undefined && calculations?.adjustedControllableProfitLastYear !== undefined ? (
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">This Year:</span> 
                      <span className="ml-2 text-green-600">${calculations.adjustedControllableProfitThisYear.toLocaleString()}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Last Year:</span> 
                      <span className="ml-2 text-blue-600">${calculations.adjustedControllableProfitLastYear.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Bonus Calculations</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.bonusCalculations ? (
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">GM Bonus:</span> 
                      <span className={`ml-2 ${calculations.bonusCalculations.gmBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${calculations.bonusCalculations.gmBonus.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">SM Bonus:</span> 
                      <span className={`ml-2 ${calculations.bonusCalculations.smBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${calculations.bonusCalculations.smBonus.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">AM/Chef Bonus:</span> 
                      <span className={`ml-2 ${calculations.bonusCalculations.amChefBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${calculations.bonusCalculations.amChefBonus.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
