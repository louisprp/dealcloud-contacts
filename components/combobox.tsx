"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

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

export interface ComboBoxOption<T> {
  value: T
  label: string
}

interface ComboBoxProps<T> {
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
}

/**
 * A generic ComboBox component that works similarly to a combobox.
 */
export function Combobox<T extends string>({
  options,
  value,
  onSelect,
  placeholder = "Select an option...",
  className,
}: ComboBoxProps<T>) {
  const [open, setOpen] = React.useState(false)

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
          filter={(value, search) => {
            const label = options.find(
              (option) => option.value === value
            )?.label
            if (label && label.toLowerCase().includes(search.toLowerCase())) {
              return 1
            }
            return 0
          }}
        >
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
