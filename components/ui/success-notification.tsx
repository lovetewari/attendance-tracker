"use client"

import { CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SuccessNotificationProps {
  show: boolean
  message: string
  title?: string
  onClose?: () => void
}

export function SuccessNotification({ show, message, title = "Success!", onClose }: SuccessNotificationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md shadow-lg flex items-center"
        >
          <div className="flex-shrink-0 mr-3">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div>
            <p className="font-bold">{title}</p>
            <p className="text-sm">{message}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-4 text-green-500 hover:text-green-700 focus:outline-none"
              aria-label="Close notification"
            >
              <span className="text-xl">&times;</span>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
