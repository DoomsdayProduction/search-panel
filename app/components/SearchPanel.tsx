"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  uploadLines,
  getUploadedCredentials,
  getStats,
  addRecentSearch,
  getRecentSearches,
  getUploadProgress,
} from "../actions/uploadLines"
import { Stats } from "./Stats"
import { RecentSearches } from "./RecentSearches"
import { LoadingScreen } from "./LoadingScreen"

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

export default function SearchPanel() {
  const [adminPassword, setAdminPassword] = useState("")
  const [uploadText, setUploadText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadedCredentials, setUploadedCredentials] = useState<Credential[]>([])
  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>([])
  const [message, setMessage] = useState("")
  const [sortBy, setSortBy] = useState<"domain" | "subdomain">("domain")
  const [stats, setStats] = useState<Stats>({
    totalLogs: 0,
    uniqueCredentials: 0,
    uniqueDomains: 0,
    uniqueSubdomains: 0,
  })
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isCancelled, setIsCancelled] = useState(false) // Added state for cancellation
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      const credentials = await getUploadedCredentials()
      setUploadedCredentials(credentials)
      const fetchedStats = await getStats()
      setStats(fetchedStats)
      const searches = await getRecentSearches()
      setRecentSearches(searches)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const sorted = [...uploadedCredentials].sort((a, b) => a[sortBy].localeCompare(b[sortBy]))
    setFilteredCredentials(
      sorted.filter(
        (cred) =>
          cred.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cred.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cred.username.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    )
  }, [searchQuery, uploadedCredentials, sortBy])

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setUploadProgress(0)
    setIsCancelled(false)

    const formData = new FormData()
    formData.append("password", adminPassword)
    if (fileInputRef.current?.files?.[0]) {
      formData.append("file", fileInputRef.current.files[0])
    } else if (uploadText) {
      formData.append("lines", uploadText)
    } else {
      setMessage("Please provide a file or enter credentials manually")
      setIsUploading(false)
      return
    }

    const uploadPromise = uploadLines(formData)

    // Start progress tracking
    const progressInterval = setInterval(async () => {
      if (isCancelled) {
        clearInterval(progressInterval)
        setIsUploading(false)
        setMessage("Upload cancelled")
        return
      }
      const progress = await getUploadProgress()
      setUploadProgress(progress)
    }, 1000)

    try {
      const result = await uploadPromise
      setMessage(result.message)
      if (result.success) {
        const credentials = await getUploadedCredentials()
        setUploadedCredentials(credentials)
        const fetchedStats = await getStats()
        setStats(fetchedStats)
        setUploadText("")
        setAdminPassword("")
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    } catch (error) {
      if (!isCancelled) {
        setMessage("An error occurred during upload")
      }
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setIsCancelled(true)
  }

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (query.trim() !== "") {
      await addRecentSearch(query)
      const searches = await getRecentSearches()
      setRecentSearches(searches)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      {isUploading && <LoadingScreen percentage={uploadProgress} onCancel={handleCancel} />}

      <motion.h1
        className="text-4xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Credential Search Panel
      </motion.h1>

      <Stats {...stats} />

      <div className="grid gap-8 md:grid-cols-3">
        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Admin Section */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Admin Upload</h2>
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              <Input type="file" accept=".txt" ref={fileInputRef} />
              <Textarea
                placeholder="Or enter credentials here (domain:subdomain:username:password)"
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                rows={5}
              />
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload Credentials"}
              </Button>
            </form>
            {message && <p className="mt-4 text-sm text-blue-600">{message}</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <RecentSearches searches={recentSearches} />
        </motion.div>
      </div>

      {/* Search Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex space-x-4 mb-6">
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="flex-grow"
          />
          <Select value={sortBy} onValueChange={(value: "domain" | "subdomain") => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="domain">Sort by Domain</SelectItem>
              <SelectItem value="subdomain">Sort by Subdomain</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subdomain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCredentials.map((cred, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{cred.domain}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cred.subdomain}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cred.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cred.password}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

