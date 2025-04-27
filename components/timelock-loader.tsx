"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TimelockLoaderProps {
  isLoading?: boolean
}

export function TimelockLoader({ isLoading = true }: TimelockLoaderProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isLoading) {
      setProgress(0)
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + Math.random() * 5 + 1
          return next > 100 ? 100 : next
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [isLoading])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="relative flex flex-col items-center">
            <div className="relative h-32 w-32">
              {/* Outer dashed circle */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300" />

              {/* Inner dashed circle */}
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-gray-300" />

              {/* Center circle */}
              <div className="absolute inset-8 flex items-center justify-center rounded-full bg-gray-100">
                <div className="text-sm font-bold">{Math.round(progress)}%</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
