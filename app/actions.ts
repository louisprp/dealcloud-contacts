// app/actions.ts
"use server"

import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { createSafeActionClient } from "next-safe-action"
import { z } from "zod"

import {
  fetchCompaniesByNames,
  fetchContactsByEmails,
  getDealCloudApiInstance,
} from "@/lib/dealcloud"
import { companyListSchema, contactSchema } from "@/lib/schema"

const actionClient = createSafeActionClient({
  handleServerError: (e) => e.message,
})

// Action: Extract Company Names
export const extractCompanyNames = actionClient
  .schema(z.string())
  .action(async ({ parsedInput: prompt }) => {
    try {
      const result = await generateObject({
        model: google("gemini-2.0-flash-lite-preview-02-05"),
        output: "array",
        schema: companyListSchema,
        messages: [
          {
            role: "user",
            content: `From this list, extract all company names as in the provided format: \n${prompt}`,
          },
        ],
      })

      return result.object
    } catch (error) {
      console.error("Error extracting company names:", error)
      throw new Error("Failed to extract company names.")
    }
  })

export const fetchCompanies = actionClient
  .schema(z.array(z.string()))
  .action(async ({ parsedInput: companyNames }) => {
    try {
      const api = getDealCloudApiInstance()
      const result = await fetchCompaniesByNames(api, companyNames)
      return result
    } catch (error) {
      console.error("Error fetching companies:", error)
      throw new Error("Failed to fetch company details.")
    }
  })

export const fetchCompany = actionClient
  .schema(z.string())
  .action(async ({ parsedInput: companyName }) => {
    try {
      const api = getDealCloudApiInstance()
      const result = await fetchCompaniesByNames(api, [companyName], {
        limit: 10,
      })
      return result
    } catch (error) {
      console.error("Error fetching companies:", error)
      throw new Error("Failed to fetch company details.")
    }
  })

export const fetchContacts = actionClient
  .schema(z.array(z.string()))
  .action(async ({ parsedInput: emails }) => {
    try {
      const api = getDealCloudApiInstance()
      const result = await fetchContactsByEmails(api, emails)
      return result
    } catch (error) {
      console.error("Error fetching contacts:", error)
      throw new Error("Failed to fetch contact details.")
    }
  })

// Action: Generate Contacts
export const generateContacts = actionClient
  .schema(z.string())
  .action(async ({ parsedInput: prompt }) => {
    try {
      const result = await generateObject({
        model: google("gemini-2.0-flash"),
        output: "array",
        schema: contactSchema,
        messages: [
          {
            role: "user",
            content:
              "Bring the provided information on contact persons into the correct format. Use the provided mapping from company names to ids. YOU MUST ONLY use the ids that are provided. If there is no id for a given company, YOU MUST leave the field empty. Choose an appropriate Contact Type for every contact. Only supply an optional Job Title, if the position of the contact is NOT already EXACTLY covered by the Contact Type (e.g. CFO=CFO), otherwise leave it EMPTY. Also choose the appropriate Anrede. \n:" +
              prompt,
          },
        ],
      })

      return result.object
    } catch (error) {
      console.error("Error generating contacts:", error)
      throw new Error("Failed to generate contacts.")
    }
  })

export const insertContacts = actionClient
  .schema(z.array(contactSchema))
  .action(async ({ parsedInput: contacts }) => {
    try {
      const api = getDealCloudApiInstance()
      // For each contact, add a negative EntryId as required by the API.
      const contactsWithEntryId = contacts.map((contact, index) => ({
        EntryId: -(index + 1),
        ...contact,
      }))

      const result = await api.insertData("contact", contactsWithEntryId)
      return result
    } catch (error) {
      console.error("Error inserting contacts:", error)
      throw new Error("Failed to insert contacts.")
    }
  })
