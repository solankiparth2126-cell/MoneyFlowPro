"use client";

import { Card, CardContent } from "@/components/ui/card"
import { Wallet, ArrowUpCircle, ArrowDownCircle, Percent, TrendingUp, Loader2, TrendingDown, Minus } from "lucide-react"
import { useStats } from "@/hooks/use-stats";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SummaryCardsProps {
  startDate?: string;
  endDate?: string;
}

export function SummaryCards({ startDate, endDate }: SummaryCardsProps) {
  const { summary, isLoading } = useStats(startDate, endDate);

  const stats = [
    {
      title: "Total Liquid Balance",
      value: `₹${(summary.totalBalance ?? summary.balance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      description: "Aggregated Portfolio Value",
      icon: Wallet,
      trend: (summary.totalBalance ?? summary.balance) >= 0 ? "up" : "down"
    },
    {
      title: "Consolidated Revenue",
      value: `₹${summary.totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      description: "Real-time Cash Inflow",
      icon: ArrowUpCircle,
      trend: "up"
    },
    {
      title: "Operational Outflow",
      value: `₹${summary.totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      description: `${summary.totalIncome > 0 ? ((summary.totalExpenses / summary.totalIncome) * 100).toFixed(1) : 0}% Revenue Usage`,
      icon: ArrowDownCircle,
      trend: "down"
    },
    {
      title: "Provisioning Rate",
      value: `${summary.totalIncome > 0 ? (((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100).toFixed(1) : 0}%`,
      description: "Retention Target: 30%",
      icon: Percent,
      trend: "neutral"
    }
  ]

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 px-1">
      {stats.map((stat, i) => (
        <motion.div
           key={stat.title}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: i * 0.1 }}
        >
          <Card className="border border-gray-100 shadow-sm bg-white rounded-[2.5rem] overflow-hidden group hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500">
            <CardContent className="p-10">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-12",
                    stat.trend === 'up' ? "bg-indigo-50 border-indigo-100 text-indigo-600 shadow-sm" :
                    stat.trend === 'down' ? "bg-rose-50 border-rose-100 text-rose-500 shadow-sm" :
                    "bg-gray-50 border-gray-100 text-gray-400"
                  )}>
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <stat.icon className="h-6 w-6" />}
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                    stat.trend === 'up' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                    stat.trend === 'down' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-gray-50 text-gray-400 border-gray-100"
                  )}>
                    {stat.trend === 'up' ? 'positive' : stat.trend === 'down' ? 'risk' : 'stable'}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{stat.title}</p>
                  <div className="text-3xl font-black text-gray-900 tracking-tighter tabular-nums leading-tight">
                    {isLoading ? (
                      <div className="h-10 w-32 bg-gray-50 animate-pulse rounded-2xl mt-1" />
                    ) : stat.value}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  {stat.trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : stat.trend === 'down' ? <TrendingDown className="w-3 h-3 text-rose-500" /> : <Minus className="w-3 h-3" />}
                  {stat.description}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
