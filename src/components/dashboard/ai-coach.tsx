"use client"

import { useAiCoach, DashboardInsight } from "@/hooks/use-ai-coach"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, ArrowRight, Zap, Target, Loader2, CheckCircle2, TrendingDown, TrendingUp, AlertCircle, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useState, useEffect } from "react"

export function AiCoach() {
  const { insight, isLoading, refresh } = useAiCoach()
  const [analyzing, setAnalyzing] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setAnalyzing(false), 800)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (isLoading || analyzing) {
    return (
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-950 ring-1 ring-indigo-100 dark:ring-indigo-900/30 overflow-hidden">
        <CardContent className="p-10 flex flex-col items-center justify-center space-y-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="p-4 bg-indigo-100 dark:bg-indigo-900/40 rounded-full"
          >
            <Sparkles className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </motion.div>
          <div className="space-y-1 text-center">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-indigo-500 animate-pulse">Syncing Intelligence</h3>
            <p className="text-sm text-muted-foreground font-medium">Drafting your personalized financial roadmap...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!insight) return null

  const { summary, topCategories, efficiencyTarget, checklist } = insight
  const isSaving = summary.savings > 0
  const momChange = summary.momChange

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-100 dark:ring-gray-800 overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-12 gap-0">
            {/* Left Panel: Pulse Analysis */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-indigo-50/30 dark:bg-indigo-950/10 border-r border-gray-100 dark:border-gray-800 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight dark:text-white uppercase leading-none italic">AI Financial Coach</h2>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1.5">Live Intelligence Active</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-black uppercase tracking-tighter">Current Spending Pulse</p>
                      <h3 className="text-3xl font-black tracking-tighter">₹{summary.currentExpenses.toLocaleString()}</h3>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-sm",
                      momChange > 0 ? "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    )}>
                      {momChange > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {Math.abs(momChange).toFixed(1)}% {momChange > 0 ? 'UP' : 'DOWN'}
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-black text-muted-foreground opacity-70">
                      <span>Monthly Distribution</span>
                      <span>Target: ₹{summary.lastExpenses.toLocaleString()}</span>
                    </div>
                    <div className="h-3 grow bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                        {topCategories.map((cat, i) => (
                            <div 
                                key={cat.name}
                                style={{ width: `${(cat.amount / Math.max(summary.currentExpenses, 1)) * 100}%` }}
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    i === 0 ? "bg-indigo-500" : i === 1 ? "bg-purple-400" : "bg-pink-300"
                                )}
                            />
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                 <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm relative overflow-hidden group/tip">
                    <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12">
                        <Target className="h-12 w-12 text-indigo-600" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Next Month Target</span>
                    </div>
                    <p className="text-xs font-bold leading-relaxed text-gray-700 dark:text-gray-300 tracking-tight">
                        {efficiencyTarget}
                    </p>
                 </div>
              </div>
            </div>

            {/* Right Panel: Action Roadmap */}
            <div className="lg:col-span-7 p-6 sm:p-8 bg-white dark:bg-gray-900 flex flex-col justify-between relative">
               <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Strategic Roadmap</h3>
                        <button onClick={refresh} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group/refresh">
                            <RefreshCw className="h-4 w-4 text-gray-400 group-hover/refresh:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence mode="wait">
                            {checklist.length > 0 ? checklist.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link href={item.action}>
                                        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group/item bg-gray-50/40 dark:bg-gray-800/20">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                                    item.priority === 'high' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                                                )}>
                                                    {item.priority === 'high' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-black tracking-tight text-gray-900 dark:text-white group-hover/item:text-indigo-600 transition-colors">{item.task}</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.priority} Priority • Core Workflow</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-gray-300 group-hover/item:text-indigo-500 group-hover/item:translate-x-1 transition-all" />
                                        </div>
                                    </Link>
                                </motion.div>
                            )) : (
                                <motion.div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                                    <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">You're all caught up!</p>
                                        <p className="text-xs text-muted-foreground">Keep importing to unlock more tips.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
               </div>

               <div className="pt-8 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 mt-6">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">AI Engine v1.0 • Stable</span>
                    </div>
                    <Link href="/reports" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1 group">
                        Full Advisory Report <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
