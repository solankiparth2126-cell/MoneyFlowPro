'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    if (process.env.NODE_ENV === 'development') {
      console.error(error)
    }
  }, [error])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6 border border-red-50"
      >
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Something went wrong</h1>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            We encountered an unexpected error while processing your request. Our team has been notified.
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-2xl text-left">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Error Details</p>
          <p className="text-xs font-mono text-gray-600 break-all bg-white p-2 rounded-lg border border-gray-100">
            {error.message || "An unknown error occurred"}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => window.location.assign('/')}
            variant="outline"
            className="flex-1 rounded-xl py-6 font-bold"
          >
            Go Home
          </Button>
          <Button
            onClick={() => reset()}
            className="flex-1 rounded-xl py-6 bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
