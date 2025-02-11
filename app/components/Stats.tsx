"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsProps {
  totalLogs: number
  uniqueCredentials: number
  uniqueDomains: number
  uniqueSubdomains: number
}

export function Stats({ totalLogs, uniqueCredentials, uniqueDomains, uniqueSubdomains }: StatsProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs}</div>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCredentials}</div>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueDomains}</div>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Subdomains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueSubdomains}</div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

