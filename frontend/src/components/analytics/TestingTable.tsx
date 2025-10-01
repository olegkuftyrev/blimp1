'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PLCalculations } from '@/hooks/useSWRPL';

interface TestingTableProps {
  calculations: PLCalculations | null;
  lineItemsLoading: boolean;
  storeName?: string;
  storePIC?: string;
}

export function TestingTable({ calculations, lineItemsLoading, storeName, storePIC }: TestingTableProps) {
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
              <TableCell className="font-medium">Store Name</TableCell>
              <TableCell>
                {storeName ? (
                  <span className="text-blue-600 font-semibold">{storeName}</span>
                ) : (
                  <span className="text-gray-500">No store name available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Store PIC</TableCell>
              <TableCell>
                {storePIC ? (
                  <span className="text-green-600 font-semibold">{storePIC}</span>
                ) : (
                  <span className="text-gray-500">No PIC available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Avg Weekly Sales</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.dashboard?.netSales !== undefined ? (
                  <span className="text-purple-600 font-semibold">
                    ${(calculations.dashboard.netSales / 4).toLocaleString()}
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
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
              <TableCell className="font-medium">SSS YTD (Same Store Sales Year-to-Date)</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.sssYtd !== undefined ? (
                  <span className={calculations.sssYtd >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {calculations.sssYtd.toFixed(2)}%
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
              <TableCell className="font-medium">SST YTD (Same Store Transactions Year-to-Date)</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.sstYtd !== undefined ? (
                  <span className={calculations.sstYtd >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {calculations.sstYtd.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Cost of Goods Sold Total %</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.dashboard?.cogsPercentage !== undefined ? (
                  <span className={calculations.dashboard.cogsPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                    {calculations.dashboard.cogsPercentage.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">COGS YTD %</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.cogsYtdPercentage !== undefined ? (
                  <span className={calculations.cogsYtdPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                    {calculations.cogsYtdPercentage.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">TL (Total Labor) Actual %</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.dashboard?.laborPercentage !== undefined ? (
                  <span className={calculations.dashboard.laborPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                    {calculations.dashboard.laborPercentage.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">TL YTD %</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.laborYtdPercentage !== undefined ? (
                  <span className={calculations.laborYtdPercentage <= 30 ? 'text-green-600' : 'text-red-600'}>
                    {calculations.laborYtdPercentage.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">CP (Controllable Profit) %</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.dashboard?.controllableProfitPercentage !== undefined ? (
                  <span className={calculations.dashboard.controllableProfitPercentage >= 15 ? 'text-green-600' : 'text-red-600'}>
                    {calculations.dashboard.controllableProfitPercentage.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">CP YTD %</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.controllableProfitYtdPercentage !== undefined ? (
                  <span className={calculations.controllableProfitYtdPercentage >= 15 ? 'text-green-600' : 'text-red-600'}>
                    {calculations.controllableProfitYtdPercentage.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">RC (Restaurant Contribution) YTD %</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.restaurantContributionYtdPercentage !== undefined ? (
                  <span className={calculations.restaurantContributionYtdPercentage >= 10 ? 'text-green-600' : 'text-red-600'}>
                    {calculations.restaurantContributionYtdPercentage.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Rent Min $</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.rentMin !== undefined ? (
                  <span className="text-purple-600">
                    ${calculations.rentMin.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Rent %</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.rentPercentage !== undefined ? (
                  <span className="text-purple-600">
                    {calculations.rentPercentage.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Rent Other $</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.rentOther !== undefined ? (
                  <span className="text-purple-600">
                    ${calculations.rentOther.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Rent Total $</TableCell>
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
              <TableCell className="font-medium">Adjusted Controllable Profit This Year</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.adjustedControllableProfitThisYear !== undefined ? (
                  <span className="text-green-600 font-semibold">
                    ${calculations.adjustedControllableProfitThisYear.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Adjusted Controllable Profit Last Year</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.adjustedControllableProfitLastYear !== undefined ? (
                  <span className="text-blue-600 font-semibold">
                    ${calculations.adjustedControllableProfitLastYear.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">GM Bonus</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.gmBonus !== undefined ? (
                  <span className={`font-semibold ${calculations.gmBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${calculations.gmBonus.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">SM Bonus</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.smBonus !== undefined ? (
                  <span className={`font-semibold ${calculations.smBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${calculations.smBonus.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-gray-500">No calculation available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">AM/Chef Bonus</TableCell>
              <TableCell>
                {lineItemsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : calculations?.amChefBonus !== undefined ? (
                  <span className={`font-semibold ${calculations.amChefBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${calculations.amChefBonus.toLocaleString()}
                  </span>
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
