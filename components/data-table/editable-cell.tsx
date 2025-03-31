import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Table, RowData } from "@tanstack/react-table";

interface EditableCellProps<TData extends RowData> {
  initialValue: string;
  rowIndex: number;
  columnId: string;
  table: Table<TData>;
}

export function EditableCell<TData extends RowData>({
  initialValue,
  rowIndex,
  columnId,
  table,
}: EditableCellProps<TData>) {
  const [value, setValue] = useState(initialValue);

  const onBlur = () => {
    table.options.meta?.updateData(rowIndex, columnId, value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    />
  );
}
