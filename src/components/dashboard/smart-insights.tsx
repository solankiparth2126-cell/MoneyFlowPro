"use client"

import { useSmartInsights, SmartInsight } from "@/hooks/use-goals"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, ArrowRight, TrendingUp, AlertCircle, CheckCircle2, Target, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function SmartInsights() {
  const { insights, isLoading } = useSmartInsights()

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    )
  }

  if (insights.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Smart Insights</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {insights.map((insight: SmartInsight, index: number) => (
          <InsightCard key={index} insight={insight} index={index} />
        ))}
      </div>
    </div>
  )
}

function InsightCard({ insight, index }: { insight: SmartInsight; index: number }) {
  const config = {
    success: { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-100 dark:border-emerald-900/30" },
    warning: { icon: AlertCircle, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-100 dark:border-rose-900/30" },
    info: { icon: TrendingUp, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-100 dark:border-blue-900/30" },
    goal: { icon: Target, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-100 dark:border-purple-900/30" },
  }

  const { icon: Icon, color, bg, border } = config[insight.type] || config.info

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className={cn(
        "flex gap-4 p-4 rounded-2xl border transition-all hover:shadow-md group cursor-default",
        bg, border
      )}>
        <div className={cn("p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm shrink-0 h-fit", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 leading-none">{insight.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{insight.message}</p>
        </div>
      </div>
    </motion.div>
  )
}
