// DealCloud API Types

export interface Company {
  EntryId: number
  CompanyName: string
}

export interface Contact {
  Anrede: number
  ProfessionalTitle?: string
  FirstName: string
  LastName: string
  Email?: string
  Employer: Company
  ContactType: string
  JobTitle: string
}

export const CONTACT_TYPES = {
  "68656": "Private Equity Professional",
  "68652": "Corporate Development Executive",
  "68654": "Debt Professional / Lender",
  "68651": "Attorney",
  "68657": "Consultant / Service Provider",
  "68658": "Financial Accountant, Advisor, Auditor",
  "68653": "Investment Banker",
  "68655": "Media",
  "81392": "Managing Director / CEO",
  "81391": "CFO",
  "81390": "Supervisory Board Member",
  "81389": "Partner",
  "81388": "Managing Partner",
  "81387": "Shareholder",
  "129696": "Network Account Manager",
  "129977": "Corporate employee",
  "725682": "Mitglied der Geschäftsführung/Vorstand",
} as const

export const ANREDE_TYPES = {
  "661148": "Herr",
  "661147": "Frau",
} as const
