"use client"

import React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Contact } from "@/lib/schema"
import { cn } from "@/lib/utils"
import { useDefaultReactTable } from "@/hooks/use-default-react-table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { columns } from "@/components/contacts/columns"
import { DataTable } from "@/components/data-table/data-table"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { InputCard } from "@/components/input-card"

import {
  extractCompanyNames,
  fetchCompanies,
  fetchContacts,
  generateContacts,
  insertContacts,
} from "./actions"

export default function Page() {
  // Store the contact data in state.
  const [data, setData] = React.useState<Contact[]>([])
  const [inputText, setInputText] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [loadingStatus, setLoadingStatus] = React.useState("")
  const [contacts, setContacts] = React.useState<
    Array<Contact & { isDuplicate: boolean }>
  >([])
  const [showDialog, setShowDialog] = React.useState(false)

  const queryClient = useQueryClient()

  const handleGenerateContacts = async () => {
    try {
      setIsLoading(true)
      setProgress(0)
      setLoadingStatus("Extracting company names...")

      // Step 1: Extract company names
      const companyNames = await extractCompanyNames(inputText)
      if (companyNames?.serverError) throw new Error(companyNames.serverError)

      setProgress(33)
      setLoadingStatus("Fetching companies...")

      // Step 2: Fetch companies
      const companies = await fetchCompanies(companyNames?.data)
      if (companies?.serverError) throw new Error(companies.serverError)

      queryClient.setQueryData<Record<string, string>>(
        ["employers"],
        (oldData = {}) => {
          const newData = { ...oldData }
          companies?.data.forEach((emp) => {
            newData[emp.EntryId] = emp.CompanyName
          })
          return newData
        }
      )

      setProgress(66)
      setLoadingStatus("Generating contacts...")

      // Step 3: Generate contacts
      const contacts = await generateContacts(
        `${inputText} + ${JSON.stringify(companies?.data)}`
      )
      if (contacts?.serverError) throw new Error(contacts.serverError)

      setProgress(100)
      setLoadingStatus("Done")

      setData(contacts?.data)
    } catch (error) {
      toast.error("Error", { description: (error as Error).message })
    } finally {
      setIsLoading(false)
    }
  }

  const checkEmails = async () => {
    try {
      setIsLoading(true)

      const dbContacts = await fetchContacts(
        data.map((contact) => contact.Email)
      )
      if (dbContacts?.serverError) throw new Error(dbContacts.serverError)
      const dbEmails = new Set(
        (dbContacts?.data ?? []).map((contact) => contact.Email)
      )

      const contacts = data.map((contact) => ({
        ...contact,
        isDuplicate: dbEmails.has(contact.Email),
      }))

      setContacts(contacts)
      setShowDialog(true)
    } catch (error) {
      toast.error("Error", { description: (error as Error).message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = async () => {
    setShowDialog(false)
    setIsLoading(true)
    try {
      // Exclude duplicates from current data
      const filteredContacts = contacts.filter((x) => !x.isDuplicate)
      // Call the server action to insert the filtered contacts
      const result = await insertContacts(filteredContacts)
      console.log("Insert result:", result)
      toast.success("Success", {
        description: "Contacts have been inserted.",
      })
    } catch (error) {
      console.error("Error inserting contacts:", error)
      toast.error("Error", {
        description:
          (error as Error).message || "An unexpected error occurred.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Create the table instance with our default settings and meta update function.
  const table = useDefaultReactTable<Contact, unknown>({
    data: data,
    columns,
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setData((prevData) =>
          prevData.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...row,
                [columnId]: value,
              }
            }
            return row
          })
        )
      },
    },
  })

  if (data.length > 0) {
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

          <div className="gap-4 flex items-center">
            <Button
              variant="secondary"
              onClick={() => {
                setData([])
                setContacts([])
              }}
            >
              Go back
            </Button>
            <Button onClick={() => checkEmails()}>
              <span className="flex items-center space-x-2">
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Continue</span>
              </span>
            </Button>
          </div>

          {showDialog && (
            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Contact Submission Overview
                  </AlertDialogTitle>
                  <div className="text-sm text-muted-foreground">
                    Below is the list of contacts to be submitted:
                    <pre className="mb-4 mt-6 max-h-[350px] whitespace-pre overflow-x-auto rounded-xl bg-muted">
                      <code className="rounded px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        {contacts.map(({ Email, isDuplicate }, index) => (
                          <span
                            key={index}
                            className={cn(
                              "line",
                              isDuplicate && "text-destructive"
                            )}
                          >
                            {isDuplicate ? `- ${Email}` : `+ ${Email}`}
                          </span>
                        ))}
                      </code>
                    </pre>
                    <span className="block mt-2">
                      If you continue, duplicates (marked in red) will be
                      skipped.
                    </span>
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleContinue}>
                    Submit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] w-full flex justify-center">
      <InputCard
        inputText={inputText}
        onInputChange={setInputText}
        isLoading={isLoading}
        progress={progress}
        loadingStatus={loadingStatus}
        onGenerate={handleGenerateContacts}
      />
      {/* <button onClick={() => loadDummyData()}>Dummy Data</button> */}
    </div>
  )
}
