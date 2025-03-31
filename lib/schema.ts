import { z } from "zod"

import { ANREDE_TYPES, CONTACT_TYPES } from "@/types/dealcloud"

// define a schema for the notifications
export const companyListSchema = z.string().describe("The name of the company")

function typedKeys<T extends object>(obj: T) {
  return Object.keys(obj) as [keyof T]
}

export const employerSchema = z.object({
  EntryId: z.string().describe("Unique identifier for the company"),
  CompanyName: z.string().describe("The name of the company"),
})

export type Employer = z.infer<typeof employerSchema>

// Create the Contact schema, attaching metadata to the enum fields
export const contactSchema = z.object({
  Anrede: z
    .enum(typedKeys(ANREDE_TYPES))
    .describe(JSON.stringify(ANREDE_TYPES)),
  ProfessionalTitle: z
    .string()
    .optional()
    .describe("Optional professional title"),
  FirstName: z.string().describe("The first name of the contact"),
  LastName: z.string().describe("The last name of the contact"),
  Email: z.string().describe("Email address of the contact"),
  BusinessPhone: z
    .string()
    .optional()
    .describe("Telephone number of the contact"),
  Employer: z
    .string()
    .optional()
    .describe("The EntryID of company that employs the contact"),
  ContactType: z
    .enum(typedKeys(CONTACT_TYPES))
    .describe(JSON.stringify(CONTACT_TYPES)),
  JobTitle: z.string().optional().describe("The job title of the contact"),
})

export type Contact = z.infer<typeof contactSchema>

export const normalizeEmployers = (
  employers: Employer[]
): Record<string, string> =>
  employers.reduce<Record<string, string>>((acc, employer) => {
    acc[employer.EntryId] = employer.CompanyName
    return acc
  }, {})
