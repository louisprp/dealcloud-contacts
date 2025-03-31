import React, { useEffect, useState } from "react"
import { RowData, Table } from "@tanstack/react-table"

// Import your combobox component and alias it as Combobox
import { Combobox } from "@/components/combobox"

interface ComboBoxCellProps<TData extends RowData> {
  initialValue?: string
  rowIndex: number
  columnId: string
  table: Table<TData>
  options?: { [key: string]: string }
}

export function ComboBoxCell<TData extends RowData>({
  initialValue,
  rowIndex,
  columnId,
  table,
  options,
}: ComboBoxCellProps<TData>) {
  const [value, setValue] = useState(initialValue || "")

  useEffect(() => {
    setValue(initialValue || "")
  }, [initialValue])

  const handleValueChange = (newValue: string | null) => {
    if (newValue === null) return
    setValue(newValue)
    table.options.meta?.updateData(rowIndex, columnId, newValue)
  }

  // Convert the options object into an array format for the combobox
  const comboboxOptions = options
    ? Object.entries(options).map(([key, label]) => ({
        value: key,
        label,
      }))
    : []

  return (
    <Combobox
      options={comboboxOptions}
      value={value}
      onSelect={handleValueChange}
      placeholder="Select an option"
      className="w-[240px]"
    />
  )
}
