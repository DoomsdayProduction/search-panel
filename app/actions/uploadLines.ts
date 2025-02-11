"use server"

import { cookies } from "next/headers"

interface Credential {
  domain: string
  subdomain: string
  username: string
  password: string
}

interface Stats {
  totalLogs: number
  uniqueCredentials: number
  uniqueDomains: number
  uniqueSubdomains: number
}

let uploadedCredentials: Credential[] = []
let recentSearches: string[] = []

export async function uploadLines(formData: FormData) {
  const password = formData.get("password") as string
  const file = formData.get("file") as File | null
  const lines = formData.get("lines") as string | null

  if (password !== "CashOutGang") {
    return { success: false, message: "Invalid password" }
  }

  let newCredentials: Credential[] = []

  if (file) {
    const chunkSize = 1024 * 1024 // 1MB chunks
    const fileSize = file.size
    let offset = 0
    let processedSize = 0

    while (offset < fileSize) {
      const chunk = file.slice(offset, offset + chunkSize)
      const text = await chunk.text()
      const chunkCredentials = parseCredentials(text)
      newCredentials = [...newCredentials, ...chunkCredentials]

      offset += chunkSize
      processedSize += chunk.size

      // Report progress
      const progress = (processedSize / fileSize) * 100
      cookies().set("uploadProgress", progress.toString())
    }
  } else if (lines) {
    newCredentials = parseCredentials(lines)
  } else {
    return { success: false, message: "No data provided" }
  }

  uploadedCredentials = [...uploadedCredentials, ...newCredentials].filter(
    (credential, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.domain === credential.domain &&
          t.subdomain === credential.subdomain &&
          t.username === credential.username &&
          t.password === credential.password,
      ),
  )

  uploadedCredentials.sort((a, b) => a.domain.localeCompare(b.domain))

  cookies().set("uploadedCredentials", JSON.stringify(uploadedCredentials))

  // Reset progress
  cookies().set("uploadProgress", "0")

  return { success: true, message: "Credentials uploaded and sorted successfully" }
}

export async function getUploadedCredentials(): Promise<Credential[]> {
  const storedCredentials = cookies().get("uploadedCredentials")
  return storedCredentials ? JSON.parse(storedCredentials.value) : []
}

export async function getStats(): Promise<Stats> {
  const credentials = await getUploadedCredentials()
  const uniqueCredentials = new Set(
    credentials.map((cred) => `${cred.domain}:${cred.subdomain}:${cred.username}:${cred.password}`),
  ).size
  const uniqueDomains = new Set(credentials.map((cred) => cred.domain)).size
  const uniqueSubdomains = new Set(credentials.map((cred) => `${cred.domain}:${cred.subdomain}`)).size

  return {
    totalLogs: credentials.length,
    uniqueCredentials,
    uniqueDomains,
    uniqueSubdomains,
  }
}

export async function addRecentSearch(search: string) {
  recentSearches = [search, ...recentSearches.slice(0, 6)]
  cookies().set("recentSearches", JSON.stringify(recentSearches))
}

export async function getRecentSearches(): Promise<string[]> {
  const storedSearches = cookies().get("recentSearches")
  return storedSearches ? JSON.parse(storedSearches.value) : []
}

export async function getUploadProgress(): Promise<number> {
  const progress = cookies().get("uploadProgress")
  return progress ? Number.parseFloat(progress.value) : 0
}

function parseCredentials(text: string): Credential[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line) => {
      const [domain, subdomain, username, password] = line.split(":")
      return { domain, subdomain, username, password }
    })
    .filter((cred) => cred.domain && cred.subdomain && cred.username && cred.password)
}

