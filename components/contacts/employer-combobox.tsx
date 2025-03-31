import React, { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { RowData, Table } from "@tanstack/react-table"
import { Check, ChevronsUpDown } from "lucide-react"
import { useDebounce } from "use-debounce"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { fetchCompany } from "@/app/actions"

// --- Types ---
export interface ComboBoxOption<T> {
  value: T
  label: string
}

export interface Company {
  EntryId: number
  CompanyName: string
}

// --- Modified Combobox component ---
export interface ComboBoxProps<T> {
  /** Options available to select */
  options: ComboBoxOption<T>[]
  /** Currently selected value */
  value: T | null
  /** Callback when a new value is selected */
  onSelect: (value: T | null) => void
  /** Placeholder text when no option is selected */
  placeholder?: string
  /** Optional additional classes for the trigger button */
  className?: string
  /** Controlled search text */
  search?: string
  /** Called when the search text changes */
  onSearchChange?: (value: string) => void
  /** Loading state */
  loading?: boolean
}

export function Combobox<T extends string>({
  options,
  value,
  onSelect,
  placeholder = "Select an option...",
  className,
  search = "",
  onSearchChange,
  loading = false,
}: ComboBoxProps<T>) {
  const [open, setOpen] = useState(false)

  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[200px] items-center font-normal justify-between",
            className
          )}
        >
          <span className="min-w-0 truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command
          filter={(optionValue, searchText) => {
            const label = options.find(
              (option) => option.value === optionValue
            )?.label
            if (
              label &&
              label.toLowerCase().includes(searchText.toLowerCase())
            ) {
              return 1
            }
            return 0
          }}
        >
          <CommandInput
            placeholder="Search..."
            className="h-9"
            value={search}
            onValueChange={onSearchChange}
          />
          <CommandList>
            <>
              <CommandEmpty>
                {loading ? "Loading..." : "No results found."}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    className="flex items-center gap-4"
                    onSelect={() => {
                      onSelect(option.value)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// --- Modified ComboBoxCell component ---
interface ComboBoxCellProps<TData extends RowData> {
  initialValue?: string
  rowIndex: number
  columnId: string
  table: Table<TData>
  /** Options can be either an object or an array of ComboBoxOption */
  options?: { [key: string]: string } | ComboBoxOption<string>[]
  /** Optional callback when an option is selected (used to update the cache) */
  onSelectOption?: (selected: string) => void
  /** Controlled search text */
  search?: string
  /** Callback for search text change */
  onSearchChange?: (value: string) => void
  /** Loading state */
  loading?: boolean
}

export function ComboBoxCell<TData extends RowData>({
  initialValue,
  rowIndex,
  columnId,
  table,
  options,
  onSelectOption,
  search,
  onSearchChange,
  loading,
}: ComboBoxCellProps<TData>) {
  const [value, setValue] = useState(initialValue || "")

  useEffect(() => {
    setValue(initialValue || "")
  }, [initialValue])

  const handleValueChange = (newValue: string | null) => {
    if (newValue === null) return
    setValue(newValue)
    if (onSelectOption) {
      onSelectOption(newValue)
    }
    table.options.meta?.updateData(rowIndex, columnId, newValue)
  }

  // If options is an object, convert it into an array
  const comboboxOptions = Array.isArray(options)
    ? options
    : options
      ? Object.entries(options).map(([key, label]) => ({ value: key, label }))
      : []

  return (
    <Combobox
      options={comboboxOptions}
      value={value}
      onSelect={handleValueChange}
      placeholder="Select an option"
      className="w-[240px]"
      search={search}
      onSearchChange={onSearchChange}
      loading={loading}
    />
  )
}

// --- EmployerComboBoxCell that wires everything together ---
function EmployerComboBoxCell<TData>({
  initialValue,
  rowIndex,
  columnId,
  table,
}: {
  initialValue?: string
  rowIndex: number
  columnId: string
  table: Table<TData>
}) {
  // Cached employers from query (assumed to be a record: { id: label })
  const { data: companies } = useQuery<Record<string, string>>({
    queryKey: ["employers"],
    enabled: false,
  })
  const queryClient = useQueryClient()

  // Local state for search input, debounced search text, search results, and loading state
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebounce(search, 300)
  const [searchResults, setSearchResults] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)

  // When the debounced search text changes, fetch additional companies.
  useEffect(() => {
    if (debouncedSearch.trim() === "") {
      setSearchResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    // Call the server action to get companies by name.
    fetchCompany(debouncedSearch)
      .then((results) => {
        setSearchResults(results?.data ?? [])
        setLoading(false)
      })
      .catch((error) => {
        console.error("Search error:", error)
        setLoading(false)
      })
  }, [debouncedSearch])

  // Convert cached companies into options.
  const cachedOptions: ComboBoxOption<string>[] = companies
    ? Object.entries(companies).map(([key, label]) => ({ value: key, label }))
    : []

  // Convert search results into options.
  const searchOptions: ComboBoxOption<string>[] = searchResults.map(
    (company) => ({
      value: company.EntryId.toString(),
      label: company.CompanyName,
    })
  )

  // When there is a search term, show both cached and search results.
  // We deduplicate by company label.
  const combinedOptions: ComboBoxOption<string>[] =
    search.trim() === ""
      ? cachedOptions
      : Array.from(
          new Map(
            [...cachedOptions, ...searchOptions].map((opt) => [opt.label, opt])
          ).values()
        )

  // When the user selects an option, if it came from search results (i.e. not in the cached list)
  // add it to the cached employers.
  const handleSelectOption = (selectedValue: string) => {
    const isInCache = cachedOptions.some((opt) => opt.value === selectedValue)
    if (!isInCache) {
      const selectedOption = combinedOptions.find(
        (opt) => opt.value === selectedValue
      )
      if (selectedOption) {
        // Update the cached employers query with the new company.
        queryClient.setQueryData(
          ["employers"],
          (oldData: Record<string, string> | undefined) => {
            const newData = oldData ? { ...oldData } : {}
            newData[selectedOption.value] = selectedOption.label
            return newData
          }
        )
      }
    }
    // Clear search so the combobox reverts to only showing cached options.
    setSearch("")
  }

  return (
    <ComboBoxCell
      initialValue={initialValue}
      rowIndex={rowIndex}
      columnId={columnId}
      table={table}
      // Pass the combined options (cached + search) to the ComboBoxCell.
      options={combinedOptions}
      onSelectOption={handleSelectOption}
      search={search}
      onSearchChange={setSearch}
      loading={loading}
    />
  )
}

export default EmployerComboBoxCell
