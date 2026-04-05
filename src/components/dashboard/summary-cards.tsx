"use client";

import { Card, CardContent } from "@/components/ui/card"
import { Wallet, ArrowUpCircle, ArrowDownCircle, Percent, TrendingUp, Loader2 } from "lucide-react"
import { useStats } from "@/hooks/use-stats";

interface SummaryCardsProps {
  startDate?: string;
  endDate?: string;
}

export function SummaryCards({ startDate, endDate }: SummaryCardsProps) {
  const { summary, isLoading } = useStats(startDate, endDate);

  const stats = [
    {
      title: "Total Balance",
      value: `₹${(summary.totalBalance ?? summary.balance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      description: "Available across all accounts",
      icon: Wallet,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
      trend: (summary.totalBalance ?? summary.balance) >= 0 ? "up" : "down"
    },
    {
      title: "Monthly Income",
      value: `₹${summary.totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      description: "Real-time earnings tracked",
      icon: ArrowUpCircle,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      trend: "up"
    },
    {
      title: "Monthly Expenses",
      value: `₹${summary.totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      description: `${summary.totalIncome > 0 ? ((summary.totalExpenses / summary.totalIncome) * 100).toFixed(1) : 0}% of income`,
      icon: ArrowDownCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
      trend: "down"
    },
    {
      title: "Savings Rate",
      value: `${summary.totalIncome > 0 ? (((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100).toFixed(1) : 0}%`,
      description: "Goal: 70%",
      icon: Percent,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      trend: "neutral"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={stat.title} className="border-0 shadow-lg hover-lift glass-iris overflow-hidden relative group reveal" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">{stat.title}</p>
              <div className={`p-2 rounded-xl shadow-sm ${stat.bg} border border-white/20`}>
                {isLoading ? <Loader2 className={`h-3.5 w-3.5 animate-spin ${stat.color}`} /> : <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />}
              </div>
            </div>
            <div className="text-xl font-black mt-0.5 text-gray-900 dark:text-gray-100 tracking-tighter uppercase tabular-nums">
              {isLoading ? (
                <div className="h-9 w-28 bg-gray-100/50 dark:bg-gray-800/50 animate-pulse rounded-lg" />
              ) : stat.value}
            </div>
            <div className="mt-3">
              {isLoading ? (
                <div className="h-2 w-24 bg-gray-100/50 dark:bg-gray-800/50 animate-pulse rounded-full" />
              ) : (
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center">
                  {stat.description}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
