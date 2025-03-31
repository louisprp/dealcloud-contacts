import { Table } from "@tanstack/react-table"

import { Contact } from "@/lib/schema"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"

export function Contacts({ table }: { table: Table<Contact[]> }) {
  return (
    <div className="min-h-[100dvh] w-full p-8">
      <h2 className="text-2xl font-bold mb-4">Contacts</h2>
      <div className="space-y-4">
        {/* Render the toolbar */}
        <DataTableToolbar table={table} />
        {/* Render the table content */}
        <DataTable table={table} />
        {/* Render the pagination controls */}
        <DataTablePagination table={table} />

        <Button onClick={() => checkEmails()}>Submit Contacts</Button>
      </div>
    </div>
  )
}
