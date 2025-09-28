"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, TrendingUp, TrendingDown, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PLLineItem, PLUtils } from "@/hooks/useSWRPL"

interface PLReportDetailedTableProps {
  lineItems: PLLineItem[];
  currency?: string;
}

export function PLReportDetailedTable({ lineItems, currency = 'USD' }: PLReportDetailedTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({})

  // Group line items by category
  const groupedItems = PLUtils.groupByCategory(lineItems)
  const sortedItems = PLUtils.sortLineItems(lineItems)

  // Define columns for the detailed table
  const columns: ColumnDef<PLLineItem>[] = [
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("category") || "Other"}</div>
      ),
    },
    {
      accessorKey: "subcategory",
      header: "Subcategory",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("subcategory") || "—"}
        </div>
      ),
    },
    {
      accessorKey: "ledgerAccount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Ledger Account
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("ledgerAccount")}</div>
      ),
    },
    {
      accessorKey: "actuals",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Actuals
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const actuals = row.getValue("actuals") as number
        const percentage = row.original.actualsPercentage
        return (
          <div className="text-right">
            <div className="font-medium">{PLUtils.formatCurrency(actuals, currency)}</div>
            {percentage !== null && percentage !== undefined && (
              <div className="text-xs text-muted-foreground">
                {PLUtils.formatPercentage(percentage)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "plan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Plan
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const plan = row.getValue("plan") as number
        const percentage = row.original.planPercentage
        return (
          <div className="text-right">
            <div className="font-medium">{PLUtils.formatCurrency(plan, currency)}</div>
            {percentage !== null && percentage !== undefined && (
              <div className="text-xs text-muted-foreground">
                {PLUtils.formatPercentage(percentage)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "vfp",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            VFP
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const vfp = row.getValue("vfp") as number
        const status = PLUtils.getVarianceStatus(vfp)
        const colorClass = PLUtils.getVarianceColor(vfp)
        
        return (
          <div className={`text-right ${colorClass}`}>
            <div className="flex items-center justify-end gap-1">
              {status === 'positive' && <TrendingUp className="h-3 w-3" />}
              {status === 'negative' && <TrendingDown className="h-3 w-3" />}
              {status === 'neutral' && <Minus className="h-3 w-3" />}
              <span className="font-medium">{PLUtils.formatCurrency(vfp, currency)}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "priorYear",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Prior Year
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const priorYear = row.getValue("priorYear") as number
        const percentage = row.original.priorYearPercentage
        return (
          <div className="text-right">
            <div className="font-medium">{PLUtils.formatCurrency(priorYear, currency)}</div>
            {percentage !== null && percentage !== undefined && (
              <div className="text-xs text-muted-foreground">
                {PLUtils.formatPercentage(percentage)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "actualYtd",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Actual YTD
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const actualYtd = row.getValue("actualYtd") as number
        const percentage = row.original.actualYtdPercentage
        return (
          <div className="text-right">
            <div className="font-medium">{PLUtils.formatCurrency(actualYtd, currency)}</div>
            {percentage !== null && percentage !== undefined && (
              <div className="text-xs text-muted-foreground">
                {PLUtils.formatPercentage(percentage)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "planYtd",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Plan YTD
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const planYtd = row.getValue("planYtd") as number
        const percentage = row.original.planYtdPercentage
        return (
          <div className="text-right">
            <div className="font-medium">{PLUtils.formatCurrency(planYtd, currency)}</div>
            {percentage !== null && percentage !== undefined && (
              <div className="text-xs text-muted-foreground">
                {PLUtils.formatPercentage(percentage)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "vfpYtd",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            VFP YTD
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const vfpYtd = row.getValue("vfpYtd") as number
        const status = PLUtils.getVarianceStatus(vfpYtd)
        const colorClass = PLUtils.getVarianceColor(vfpYtd)
        
        return (
          <div className={`text-right ${colorClass}`}>
            <div className="flex items-center justify-end gap-1">
              {status === 'positive' && <TrendingUp className="h-3 w-3" />}
              {status === 'negative' && <TrendingDown className="h-3 w-3" />}
              {status === 'neutral' && <Minus className="h-3 w-3" />}
              <span className="font-medium">{PLUtils.formatCurrency(vfpYtd, currency)}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "priorYearYtd",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Prior Year YTD
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const priorYearYtd = row.getValue("priorYearYtd") as number
        const percentage = row.original.priorYearYtdPercentage
        return (
          <div className="text-right">
            <div className="font-medium">{PLUtils.formatCurrency(priorYearYtd, currency)}</div>
            {percentage !== null && percentage !== undefined && (
              <div className="text-xs text-muted-foreground">
                {PLUtils.formatPercentage(percentage)}
              </div>
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: sortedItems,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Calculate totals for each category
  const categoryTotals = Object.entries(groupedItems).map(([category, items]) => {
    const totals = PLUtils.calculateCategoryTotals(items)
    return { category, items, totals }
  })

  if (lineItems.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No line items found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lineItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {Object.keys(groupedItems).length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {Object.keys(groupedItems).map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Actuals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {PLUtils.formatCurrency(PLUtils.calculateCategoryTotals(lineItems).actuals, currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Category Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categoryTotals.map(({ category, items, totals }) => (
              <Collapsible
                key={category}
                open={expandedCategories[category]}
                onOpenChange={() => toggleCategory(category)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{category}</span>
                      <Badge variant="outline">{items.length} items</Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {PLUtils.formatCurrency(totals.actuals, currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        VFP: {PLUtils.formatCurrency(totals.vfp, currency)}
                      </div>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 ml-4 bg-muted/50 rounded"
                    >
                      <span className="text-sm">{item.ledgerAccount}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {PLUtils.formatCurrency(item.actuals, currency)}
                        </div>
                        <div className={`text-xs ${PLUtils.getVarianceColor(item.vfp)}`}>
                          VFP: {PLUtils.formatCurrency(item.vfp, currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detailed Line Items ({lineItems.length} rows)</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter by ledger account..."
              value={(table.getColumn("ledgerAccount")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("ledgerAccount")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
