"use client"

import {
  ColumnDef,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowData,
  Table,
  useReactTable,
} from "@tanstack/react-table"

interface UseDefaultReactTableProps<TData extends RowData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  meta?: {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

export function useDefaultReactTable<TData extends RowData, TValue>({
  data,
  columns,
  meta,
}: UseDefaultReactTableProps<TData, TValue>): Table<TData> {
  return useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta,
  })
}
