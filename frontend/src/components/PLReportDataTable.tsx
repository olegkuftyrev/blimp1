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
import { ArrowUpDown, ChevronDown } from "lucide-react"

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

interface PLReportData {
  id: number;
  storeName: string;
  company: string;
  period: string;
  year: number;
  fileName: string;
  fileSize: number;
  uploadStatus: string;
  errorMessage?: string;
  uploadedBy: number;
  translationCurrency: string;
  lineItems?: any[];
}

interface PLReportDataTableProps {
  report: PLReportData;
  lineItems: any[];
}

export function PLReportDataTable({ report, lineItems = [] }: PLReportDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

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

  const getValueStyle = (value: number, isPercentage: boolean = false) => {
    return 'text-foreground';
  };

  const columns: ColumnDef<any>[] = [
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
      header: () => <div className="text-right">Actuals</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("actuals"))
        return (
          <div className={`text-right font-medium ${getValueStyle(amount)}`}>
            {formatCurrency(amount)}
          </div>
        )
      },
    },
    {
      accessorKey: "actualsPercentage",
      header: () => <div className="text-right">Actuals %</div>,
      cell: ({ row }) => {
        const percentage = parseFloat(row.getValue("actualsPercentage"))
        return (
          <div className={`text-right font-medium ${getValueStyle(percentage, true)}`}>
            {formatPercentage(percentage)}
          </div>
        )
      },
    },
    {
      accessorKey: "plan",
      header: () => <div className="text-right">Plan</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("plan"))
        return (
          <div className={`text-right font-medium ${getValueStyle(amount)}`}>
            {formatCurrency(amount)}
          </div>
        )
      },
    },
    {
      accessorKey: "planPercentage",
      header: () => <div className="text-right">Plan %</div>,
      cell: ({ row }) => {
        const percentage = parseFloat(row.getValue("planPercentage"))
        return (
          <div className={`text-right font-medium ${getValueStyle(percentage, true)}`}>
            {formatPercentage(percentage)}
          </div>
        )
      },
    },
    {
      accessorKey: "vfp",
      header: () => <div className="text-right">VFP</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("vfp"))
        return (
          <div className={`text-right font-medium ${getValueStyle(amount)}`}>
            {formatCurrency(amount)}
          </div>
        )
      },
    },
    {
      accessorKey: "priorYear",
      header: () => <div className="text-right">Prior Year</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("priorYear"))
        return (
          <div className={`text-right font-medium ${getValueStyle(amount)}`}>
            {formatCurrency(amount)}
          </div>
        )
      },
    },
    {
      accessorKey: "priorYearPercentage",
      header: () => <div className="text-right">Prior Year %</div>,
      cell: ({ row }) => {
        const percentage = parseFloat(row.getValue("priorYearPercentage"))
        return (
          <div className={`text-right font-medium ${getValueStyle(percentage, true)}`}>
            {formatPercentage(percentage)}
          </div>
        )
      },
    },
    {
      accessorKey: "actualYtd",
      header: () => <div className="text-right">Actual YTD</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("actualYtd"))
        return (
          <div className={`text-right font-medium ${getValueStyle(amount)}`}>
            {formatCurrency(amount)}
          </div>
        )
      },
    },
    {
      accessorKey: "actualYtdPercentage",
      header: () => <div className="text-right">Actual YTD %</div>,
      cell: ({ row }) => {
        const percentage = parseFloat(row.getValue("actualYtdPercentage"))
        return (
          <div className={`text-right font-medium ${getValueStyle(percentage, true)}`}>
            {formatPercentage(percentage)}
          </div>
        )
      },
    },
    {
      accessorKey: "planYtd",
      header: () => <div className="text-right">Plan YTD</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("planYtd"))
        return (
          <div className={`text-right font-medium ${getValueStyle(amount)}`}>
            {formatCurrency(amount)}
          </div>
        )
      },
    },
    {
      accessorKey: "planYtdPercentage",
      header: () => <div className="text-right">Plan YTD %</div>,
      cell: ({ row }) => {
        const percentage = parseFloat(row.getValue("planYtdPercentage"))
        return (
          <div className={`text-right font-medium ${getValueStyle(percentage, true)}`}>
            {formatPercentage(percentage)}
          </div>
        )
      },
    },
    {
      accessorKey: "vfpYtd",
      header: () => <div className="text-right">VFP YTD</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("vfpYtd"))
        return (
          <div className={`text-right font-medium ${getValueStyle(amount)}`}>
            {formatCurrency(amount)}
          </div>
        )
      },
    },
    {
      accessorKey: "priorYearYtd",
      header: () => <div className="text-right">Prior Year YTD</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("priorYearYtd"))
        return (
          <div className={`text-right font-medium ${getValueStyle(amount)}`}>
            {formatCurrency(amount)}
          </div>
        )
      },
    },
    {
      accessorKey: "priorYearYtdPercentage",
      header: () => <div className="text-right">Prior Year YTD %</div>,
      cell: ({ row }) => {
        const percentage = parseFloat(row.getValue("priorYearYtdPercentage"))
        return (
          <div className={`text-right font-medium ${getValueStyle(percentage, true)}`}>
            {formatPercentage(percentage)}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: lineItems,
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

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by ledger account..."
          value={(table.getColumn("ledgerAccount")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("ledgerAccount")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
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
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredRowModel().rows.length} row(s) total.
        </div>
      </div>
    </div>
  )
}
