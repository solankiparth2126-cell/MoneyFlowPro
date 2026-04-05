"use client";

import dynamic from "next/dynamic";
import { DashboardSkeleton, SummaryCardsSkeleton, DashboardChartsSkeleton } from "@/components/dashboard/dashboard-skeleton";

const SummaryCards = dynamic(() => import("@/components/dashboard/summary-cards").then(m => m.SummaryCards), {
  ssr: false,
  loading: () => <SummaryCardsSkeleton />
});

const DashboardCharts = dynamic(() => import("@/components/dashboard/dashboard-charts").then(m => m.DashboardCharts), {
  ssr: false,
  loading: () => <DashboardChartsSkeleton />
});

const AiCoach = dynamic(() => import("@/components/dashboard/ai-coach").then(m => m.AiCoach), {
  ssr: false
});

const SmartInsights = dynamic(() => import("@/components/dashboard/smart-insights").then(m => m.SmartInsights), {
  ssr: false
});

const CashFlowCalendar = dynamic(() => import("@/components/dashboard/cash-flow-calendar").then(m => m.CashFlowCalendar), {
  ssr: false
});

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Activity, 
  Wallet, 
  PieChart, 
  NotebookTabs,
  Info,
  Loader2,
  ReceiptText,
  PiggyBank,
  Banknote,
  CreditCard,
  ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { useTransactions } from "@/hooks/use-transactions";
import { useLedgers } from "@/hooks/use-ledgers";
import { useAuth } from "@/context/auth-context"
import { useUsers } from "@/hooks/use-users";
import { useBudgets } from "@/hooks/use-budgets";
import { type Transaction, type Ledger } from "@/lib/types";
import { usePermissions } from "@/hooks/use-permissions";
import { FYSelector } from "@/components/fy-selector";
import { getCurrentFinancialYear } from "@/lib/financial-year-utils";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils"
import { motion } from "framer-motion";

const iconMap: Record<string, any> = {
  Wallet,
  PiggyBank,
  TrendingUp,
  CreditCard,
  Banknote
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { canView } = usePermissions();

  const [selectedFY, setSelectedFY] = useState(getCurrentFinancialYear());
  const now = new Date();
  const { status: budgetStats, isLoading: loadingBudgets } = useBudgets(now.getMonth() + 1, now.getFullYear());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { transactions, isLoading: loadingTx } = useTransactions(selectedFY.startDate, selectedFY.endDate);
  const { ledgers, isLoading: loadingLedgers } = useLedgers();

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);
  const topLedgers = useMemo(() => ledgers.slice(0, 4), [ledgers]);

  // Show skeleton during initial auth load or until mounted
  if (!mounted || authLoading) {
    return <DashboardSkeleton />;
  }

  if (!canView("CORE", "DASHBOARD")) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
            <ShieldCheck className="h-12 w-12 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Access Restricted</h1>
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Permission sync required to view dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 container mx-auto px-6 max-w-7xl pt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase leading-none">
            Dashboard
          </h1>
          <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-3 ml-1">
            Real-time insights for {selectedFY.label !== 'All Time' ? selectedFY.label : 'Lifetime performance'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FYSelector value={selectedFY} onValueChange={setSelectedFY} />
        </div>
      </div>

      <SummaryCards startDate={selectedFY.startDate} endDate={selectedFY.endDate} />

      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 group transition-all hover:shadow-indigo-300 active:scale-[0.99]">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
          <TrendingUp className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <Info className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Financial Performance Insight</h3>
            <p className="text-indigo-100 mt-2 font-bold text-sm leading-relaxed max-w-2xl">
              Your savings rate has improved by <span className="text-white underline decoration-2 underline-offset-4 decoration-emerald-400">12% compared to last month</span>. 
              Our AI recommends rebalancing your portfolio to maximize yield on idle funds.
            </p>
          </div>
          <div className="ml-auto">
            <Link href="/reports" className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all shadow-lg flex items-center gap-2">
              Deep Dive <Activity className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <DashboardCharts startDate={selectedFY.startDate} endDate={selectedFY.endDate} />

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Card className="border-0 shadow-xl shadow-gray-200/20 rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-gray-900 uppercase">Recent Activity</CardTitle>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Live transaction feed</p>
                </div>
                <Link href="/transactions" className="flex items-center gap-2 px-4 py-2 border-2 border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-indigo-100 hover:text-indigo-600 transition-all">
                  Full Ledger <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-b border-gray-50">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">Description</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">Category</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTx ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-24 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
                      </TableCell>
                    </TableRow>
                  ) : recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-24 text-center text-gray-300 font-black uppercase tracking-widest text-xs">
                        No transactions recorded
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTransactions.map((tx: Transaction) => (
                      <TableRow key={tx.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                        <TableCell className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-gray-900 uppercase tracking-tight text-sm">{tx.description}</span>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{tx.date}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-0 font-black uppercase text-[9px] tracking-widest px-2.5 py-1 transition-colors">
                            {tx.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-8 py-6">
                          <span className={cn(
                            "font-black text-base tabular-nums flex items-center justify-end gap-1",
                            tx.type === 'income' ? 'text-indigo-600' : 'text-rose-500'
                          )}>
                            {tx.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            ₹{tx.amount.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-0 shadow-xl shadow-gray-200/20 rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-gray-50">
              <CardTitle className="text-sm font-black flex items-center gap-2 text-gray-900 uppercase tracking-widest">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <NotebookTabs className="h-4 w-4" />
                </div>
                Primary Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {loadingLedgers ? (
                 <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                 </div>
              ) : topLedgers.map((ledger: Ledger) => {
                const IconComp = iconMap[ledger.icon] || Wallet;
                return (
                  <div key={ledger.id} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-50 transition-all border border-gray-100">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{ledger.name}</span>
                    </div>
                    <span className="text-base font-black text-gray-900 tabular-nums">₹{(ledger.balance || 0).toLocaleString()}</span>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl shadow-gray-200/20 rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-gray-50">
              <CardTitle className="text-sm font-black flex items-center gap-2 text-gray-900 uppercase tracking-widest">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <PieChart className="h-4 w-4" />
                </div>
                Budget Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {loadingBudgets ? (
                 <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600" />
              ) : budgetStats.slice(0, 3).map((stat: any) => (
                <div key={stat.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{stat.categoryName}</span>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest py-0.5 px-2 rounded-lg",
                      stat.percentUsed > 90 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      {stat.percentUsed.toFixed(0)}% Utilized
                    </span>
                  </div>
                  <Progress value={Math.min(stat.percentUsed, 100)} className="h-2 bg-gray-50" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <CashFlowCalendar />
    </div>
  )
}
