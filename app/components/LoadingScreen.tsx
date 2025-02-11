"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface LoadingScreenProps {
  percentage: number
  onCancel: () => void
}

export function LoadingScreen({ percentage, onCancel }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <motion.h2
          className="text-2xl font-bold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Processing Large File
        </motion.h2>
        <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <motion.p
          className="text-lg font-semibold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {percentage.toFixed(1)}% Complete
        </motion.p>
        <Button onClick={onCancel} variant="destructive">
          Cancel
        </Button>
      </div>
    </div>
  )
}

