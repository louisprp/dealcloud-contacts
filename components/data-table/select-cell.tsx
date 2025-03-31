import React, { useState, useEffect } from "react";
import { Table, RowData } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectCellProps<TData extends RowData> {
  initialValue: string;
  rowIndex: number;
  columnId: string;
  table: Table<TData>;
  options: { [key: string]: string };
}

export function SelectCell<TData extends RowData>({
  initialValue,
  rowIndex,
  columnId,
  table,
  options,
}: SelectCellProps<TData>) {
  const [value, setValue] = useState(initialValue);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    table.options.meta?.updateData(rowIndex, columnId, newValue);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {Object.entries(options).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
