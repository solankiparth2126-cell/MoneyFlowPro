'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full text-center space-y-10 relative z-10"
      >
        <div className="relative inline-block">
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-[180px] font-black text-indigo-600/10 leading-none select-none tracking-tighter"
          >
            404
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center ring-8 ring-indigo-50/50">
              <Search className="w-10 h-10 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Lost in the Flow?</h1>
          <p className="text-gray-500 text-lg font-medium max-w-md mx-auto leading-relaxed">
            We couldn't find the page you're looking for. It might have been moved, renamed, or never existed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-8 py-7 rounded-2xl font-bold border-2 hover:bg-gray-50 transition-all text-gray-600 flex items-center gap-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            asChild
            className="w-full sm:w-auto px-10 py-7 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-3"
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
