"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RecentSearchesProps {
  searches: string[]
}

export function RecentSearches({ searches }: RecentSearchesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Searches</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {searches.map((search, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-secondary p-2 rounded-md"
            >
              {search}
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

