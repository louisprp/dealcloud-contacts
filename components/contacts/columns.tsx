"use client"

import { ColumnDef } from "@tanstack/react-table"

import { ANREDE_TYPES, CONTACT_TYPES } from "@/types/dealcloud"
import { Contact } from "@/lib/schema"
import EmployerComboBoxCell from "@/components/contacts/employer-combobox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { EditableCell } from "@/components/data-table/editable-cell"
import { SelectCell } from "@/components/data-table/select-cell"

import { ComboBoxCell } from "../data-table/combobox-cell"

export const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: "Anrede",
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue() as string
      return (
        <SelectCell
          initialValue={initialValue}
          rowIndex={index}
          columnId={id}
          table={table}
          options={ANREDE_TYPES}
        />
      )
    },
    meta: {
      title: "Anrede",
    },
  },
  {
    accessorKey: "FirstName",
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue() as string
      return (
        <EditableCell
          initialValue={initialValue}
          rowIndex={index}
          columnId={id}
          table={table}
        />
      )
    },
    meta: {
      title: "First Name",
    },
  },
  {
    accessorKey: "LastName",
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue() as string
      return (
        <EditableCell
          initialValue={initialValue}
          rowIndex={index}
          columnId={id}
          table={table}
        />
      )
    },
    meta: {
      title: "Last Name",
    },
  },
  {
    accessorKey: "Email",
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue() as string
      return (
        <EditableCell
          initialValue={initialValue}
          rowIndex={index}
          columnId={id}
          table={table}
        />
      )
    },
    meta: {
      title: "Email",
    },
  },
  {
    accessorKey: "BusinessPhone",
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue() as string
      return (
        <EditableCell
          initialValue={initialValue}
          rowIndex={index}
          columnId={id}
          table={table}
        />
      )
    },
    meta: {
      title: "Business Phone",
    },
  },
  {
    accessorKey: "ContactType",
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue() as string
      return (
        <ComboBoxCell
          initialValue={initialValue}
          rowIndex={index}
          columnId={id}
          table={table}
          options={CONTACT_TYPES}
        />
      )
    },
    meta: {
      title: "Contact Type",
    },
  },
  {
    accessorKey: "JobTitle",
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue() as string
      return (
        <EditableCell
          initialValue={initialValue}
          rowIndex={index}
          columnId={id}
          table={table}
        />
      )
    },
    meta: {
      title: "Job Title",
    },
  },
  {
    accessorKey: "Employer",
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row, column: { id }, table }) => {
      const employer = row.original.Employer
      return (
        <EmployerComboBoxCell
          initialValue={employer}
          rowIndex={row.index}
          columnId={id}
          table={table}
        />
      )
    },
    meta: {
      title: "Employer",
    },
  },
]

// function EmployerComboBoxCell({
//   initialValue,
//   rowIndex,
//   columnId,
//   table,
// }: {
//   initialValue?: string
//   rowIndex: number
//   columnId: string
//   table: any
// }) {
//   const { data: companies } = useQuery<Record<string, string>>({
//     queryKey: ["employers"],
//     enabled: false,
//   })
//   return (
//     <ComboBoxCell
//       initialValue={initialValue}
//       rowIndex={rowIndex}
//       columnId={columnId}
//       table={table}
//       options={companies}
//     />
//   )
// }
