// lib/dealcloudApi.ts
import { decode, encode } from "html-entities"

import { Company } from "@/types/dealcloud"

//
// TOKEN INTERFACES
//
export interface Tokens {
  access_token: string
  expires_in: number // in seconds
  token_type: string
  scope: string
}

//
// GENERIC QUERY RESPONSE INTERFACE
//
export interface QueryResponse<T> {
  totalRecords: number
  rows: T[]
}

//
// DEALCLOUD API HELPER CLASS
//
export class DealCloudAPI {
  private site: string
  private clientId: string
  private clientSecret: string
  private scope: string
  private urlRoot: string
  private urlRootV1: string
  private accessToken: string | null = null
  private expiryTime: number = 0

  /**
   * @param site - The DealCloud site (e.g. "mycompany.dealcloud.com" without protocol)
   * @param clientId - Your client id (string or number)
   * @param clientSecret - Your client secret
   * @param scope - Array of scopes (defaults to data, user_management, publish)
   */
  constructor(
    site: string,
    clientId: string,
    clientSecret: string,
    scope: string[] = ["data", "user_management", "publish"]
  ) {
    this.site = site
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.scope = scope.join(" ")
    this.urlRoot = `https://${this.site}/api/rest/v4`
    this.urlRootV1 = `https://${this.site}/api/rest/v1`
  }

  /**
   * Authenticates with the DealCloud API and obtains an access token.
   * Sets the token and its expiry on the instance.
   */
  private async auth(): Promise<Tokens> {
    const url = `${this.urlRootV1}/oauth/token`

    const response = await fetch(url, {
      // Mimic the Python example: GET with a body (if required by your endpoint)
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        scope: "data",
        grant_type: "client_credentials",
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(
        `Could not authenticate! Status: ${response.status}. ${text}`
      )
    }

    const tokens: Tokens = await response.json()

    // Set token and expiry time (subtracting 120 seconds for safety)
    this.accessToken = tokens.access_token
    this.expiryTime = Date.now() + (tokens.expires_in - 120) * 1000

    return tokens
  }

  /**
   * Returns the current access token, re-authenticating if necessary.
   */
  public async getAccessToken(): Promise<string> {
    if (!this.accessToken || Date.now() > this.expiryTime) {
      await this.auth()
    }
    return this.accessToken!
  }

  /**
   * A generic method to query data using DealCloud’s Query Data endpoint.
   * @param entryTypeId - The entry type (e.g. "company" or numeric id)
   * @param body - The JSON payload for the query
   * @returns An array of entries of type T.
   */
  public async queryData<T>(
    entryTypeId: string | number,
    body: object
  ): Promise<T[]> {
    const token = await this.getAccessToken()
    const url = `${this.urlRoot}/data/entrydata/rows/query/${entryTypeId}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Query data failed with status: ${response.status}`)
    }

    const data: QueryResponse<T> = await response.json()
    return data.rows
  }

  /**
   * Inserts new entries for a given entry type.
   * @param entryTypeId - The entry type (e.g. "contact")
   * @param data - An array of objects to insert
   * @returns The inserted rows as returned by the API.
   */
  public async insertData<T>(
    entryTypeId: string | number,
    data: T[]
  ): Promise<T[]> {
    const token = await this.getAccessToken()
    const url = `${this.urlRoot}/data/entrydata/rows/${entryTypeId}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Insert data failed with status: ${response.status} - ${errorText}`
      )
    }

    // Assuming the API returns an object with a "rows" property similar to queryData
    const dataResult: QueryResponse<T> = await response.json()
    return dataResult.rows
  }
}

//
// COMPANY-SPECIFIC FUNCTIONS
//

/**
 * Searches for companies using a single search term.
 * Uses the "$contains" operator on the CompanyName field.
 *
 * @param api - An instance of DealCloudAPI
 * @param search - The search term
 * @returns An array of Company objects.
 */
export async function queryCompany(
  api: DealCloudAPI,
  search: string
): Promise<Company[]> {
  if (!search) return []

  const fields = ["CompanyName", "EntryId"]

  const body = {
    query: JSON.stringify({ CompanyName: { $contains: encode(search) } }),
    fields,
    limit: 10,
    skip: 0,
    resolveReferenceUrls: false,
    wrapIntoArrays: true,
  }

  const response = await api.queryData<Company>("company", body)
  const flattened = flattenData(response, "name")
  const decoded = flattened.map((company) => {
    company.CompanyName = decode(company.CompanyName)
    return company
  })
  return decoded
}

/**
 * Searches for companies using an array of search terms.
 * Combines the individual queries using the "$or" operator.
 *
 * @param api - An instance of DealCloudAPI
 * @param searches - Array of search strings
 * @returns An array of Company objects.
 */
export async function fetchCompaniesByNames(
  api: DealCloudAPI,
  searches: string[],
  options?: object
): Promise<Company[]> {
  const fields = ["CompanyName", "EntryId"]

  const body = {
    query: JSON.stringify(
      searches.length > 1
        ? {
            $or: searches.map((name) => ({
              CompanyName: { $contains: encode(name) },
            })),
          }
        : { CompanyName: { $contains: encode(searches[0]) } }
    ),
    fields,
    limit: 1000,
    skip: 0,
    resolveReferenceUrls: false,
    wrapIntoArrays: true,
    ...options,
  }
  const response = await api.queryData<Company>("company", body)
  return flattenData(response, "name").map((x) => {
    x.CompanyName = decode(x.CompanyName)
    return x
  })
}
/**
 * Searches for contacts using an array of search terms.
 * Combines the individual queries using the "$or" operator.
 *
 * @param api - An instance of DealCloudAPI
 * @param searches - Array of search strings (contact names or emails)
 * @returns An array of Contact objects.
 */
export async function fetchContactsByEmails(
  api: DealCloudAPI,
  searches: string[]
): Promise<{ EntryId: number; FullName: string; Email: string }[]> {
  const fields = ["FullName", "Email", "EntryId"]

  const body = {
    query: JSON.stringify({
      $or: searches.map((email) => ({
        Email: { $eq: email },
      })),
    }),
    fields,
    limit: 1000,
    skip: 0,
    resolveReferenceUrls: false,
    wrapIntoArrays: true,
  }

  const response = await api.queryData<{
    EntryId: number
    FullName: string
    Email: string
  }>("contact", body)
  return flattenData(response, "id")
}

// Define which property to use when “resolving” a nested object.
type ResolveOption = "id" | "name"

/**
 * Given a value and a resolve option, return a flattened value.
 * - If the value is an array, resolve each element and join them with "; ".
 * - If the value is an object and contains the property indicated by resolve,
 *   return that property.
 * - Otherwise, return the value as is.
 */
function resolveValue(value: any, resolve: ResolveOption): any {
  if (Array.isArray(value)) {
    // For arrays, resolve each element and join with a semicolon.
    return value.map((item) => resolveValue(item, resolve)).join("; ")
  } else if (value && typeof value === "object") {
    // If the object contains the resolve key, return that property.
    if (resolve in value) {
      return value[resolve]
    }
  }
  return value
}

/**
 * Flattens an object by iterating over its keys.
 * If a key’s value is a nested object and a resolve option is provided,
 * it replaces the nested object with its resolved value.
 */
function flattenObject(obj: any, resolve?: ResolveOption): any {
  const flattened: { [key: string]: any } = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      // When a resolve option is provided and the value is an object,
      // use resolveValue to extract the desired value.
      flattened[key] =
        resolve && value && typeof value === "object"
          ? resolveValue(value, resolve)
          : value
    }
  }
  return flattened
}

/**
 * Helper to flatten an array of objects.
 */
function flattenData<T>(data: T[], resolve?: ResolveOption): T[] {
  return data.map((item) => flattenObject(item, resolve))
}

// A module-scoped variable that holds the singleton instance.
let dealCloudApiInstance: DealCloudAPI | null = null

/**
 * Returns the singleton DealCloudAPI instance.
 * On the first call, it creates the instance using environment variables.
 */
export function getDealCloudApiInstance(): DealCloudAPI {
  if (!dealCloudApiInstance) {
    // Use environment variables or another secure method to supply credentials.
    const site = process.env.DEALCLOUD_SITE // e.g., "mycompany.dealcloud.com"
    const clientId = process.env.DEALCLOUD_CLIENT_ID
    const clientSecret = process.env.DEALCLOUD_CLIENT_SECRET

    if (!site || !clientId || !clientSecret) {
      throw new Error("DealCloud credentials are not properly configured.")
    }
    dealCloudApiInstance = new DealCloudAPI(site, clientId, clientSecret)
  }
  return dealCloudApiInstance
}
