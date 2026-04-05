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
import { ReceiptText, TrendingUp, NotebookTabs, ArrowUpRight, ArrowDownRight, Wallet, Banknote, CreditCard, PiggyBank, Loader2, ShieldCheck, Info, Activity, Users as UsersIcon, Database, PieChart } from "lucide-react"
import { useTransactions } from "@/hooks/use-transactions";
import { useLedgers } from "@/hooks/use-ledgers";
import { useAuth } from "@/context/auth-context";
import { useUsers } from "@/hooks/use-users";
import { useBudgets } from "@/hooks/use-budgets";
import { type Transaction, type Ledger } from "@/lib/types";
import { usePermissions } from "@/hooks/use-permissions";
import { FYSelector } from "@/components/fy-selector";
import { getCurrentFinancialYear } from "@/lib/financial-year-utils";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useMemo } from "react";

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
  const { users } = useUsers();
  const { status: budgetStats, isLoading: loadingBudgets } = useBudgets(now.getMonth() + 1, now.getFullYear());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user || !mounted) return;

    // Legacy API calls removed - pending Convex migration for Users and Budgets status
    /*
    if (canView("ADMIN", "USER_MANAGEMENT")) {
      userApi.getAll().then(data => setUsersCount(data.length)).catch(console.error);
    }

    // Fetch budgets for current month
    const now = new Date();
    setLoadingBudgets(true);
    budgetApi.getStatus(now.getMonth() + 1, now.getFullYear())
      .then(data => setBudgetStats(data))
      .catch(console.error)
      .finally(() => setLoadingBudgets(false));
    */
  }, [user?.id, mounted, canView]); // Keep canView but it's now stable

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
        <div className="p-4 bg-rose-50 rounded-full">
            <ShieldCheck className="h-12 w-12 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold">Access Restricted</h2>
        <p className="text-muted-foreground">You do not have permission to view the Dashboard.</p>
      </div>
    );
  }

  return (

    <div className="space-y-2.5 p-1 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="reveal">
          <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 leading-none uppercase">
            Financial Overview
          </h1>
          <p className="text-muted-foreground text-xs mt-1.5 font-semibold uppercase tracking-widest opacity-70">
            Intelligent Wealth & Cash Flow • {selectedFY.label !== 'All Time' ? selectedFY.label : 'Lifetime'}
          </p>
        </div>
        <div className="flex items-center gap-3 glass-iris p-1.5 rounded-2xl shadow-sm reveal" style={{ animationDelay: '100ms' }}>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-3">System Period</span>
          <FYSelector value={selectedFY} onValueChange={setSelectedFY} />
        </div>
      </div>

      <div className="pt-1">
        <SummaryCards startDate={selectedFY.startDate} endDate={selectedFY.endDate} />
      </div>

      <AiCoach />

      <SmartInsights />

      {!loadingLedgers && ledgers.length === 0 && (
          <Card className="border-0 shadow-2xl bg-mesh animate-mesh text-white overflow-hidden relative group rounded-3xl reveal" style={{ animationDelay: '200ms' }}>
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
            <div className="absolute -right-12 -top-12 h-64 w-64 bg-white/10 rounded-full blur-3xl opacity-50" />
            <CardContent className="p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="space-y-5">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xl border border-white/30 shadow-lg">
                    <Activity className="h-7 w-7 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0 uppercase tracking-widest font-black h-6 text-[10px] px-3">
                    Action Required
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-black tracking-tighter leading-none uppercase italic">Setup Your Accounts</h2>
                  <p className="text-xl text-white/80 max-w-xl font-medium pt-1">
                    Connect your financial lifelines to unlock intelligent insights.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 pt-6 justify-center md:justify-start">
                   <a href="/ledgers" className="px-8 py-4 bg-white text-indigo-600 font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl hover:shadow-white/20 transition-all transform hover:-translate-y-1 active:scale-95">
                      Initialize Ledgers
                   </a>
                   <a href="/transactions" className="px-6 py-3 bg-white/10 border border-white/20 text-white font-bold text-sm uppercase tracking-wider rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all flex items-center gap-2">
                      <ReceiptText className="h-4 w-4" /> Quick Import
                   </a>
                </div>
              </div>
              <div className="hidden lg:block relative">
                 <div className="h-48 w-48 bg-white/10 rounded-3xl rotate-12 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl">
                    <Wallet className="h-24 w-24 text-white opacity-90 transition-transform group-hover:rotate-0 duration-500" />
                 </div>
              </div>
            </CardContent>
          </Card>
      )}

      <DashboardCharts startDate={selectedFY.startDate} endDate={selectedFY.endDate} />

      <CashFlowCalendar />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 2xl:grid-cols-12">
        <div className="lg:col-span-4 2xl:col-span-8 h-full">
          <Card className="h-full border-0 shadow-lg bg-white/50 backdrop-blur-sm ring-1 ring-gray-100 dark:bg-gray-900/50 dark:ring-gray-800">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground/80">
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <ReceiptText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <Table>
                  <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingTx ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-32 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-500" />
                          <p className="text-xs text-muted-foreground mt-2">Loading activity...</p>
                        </TableCell>
                      </TableRow>
                    ) : recentTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-32 text-center text-muted-foreground text-sm">
                          No recent transactions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentTransactions.map((tx: Transaction) => (
                        <TableRow
                          key={tx.id}
                          className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 dark:text-gray-100">{tx.description}</span>
                              <span className="text-xs text-muted-foreground">{tx.date}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200">
                              {tx.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`font-bold flex items-center justify-end gap-1 ${tx.type === 'income'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-red-600 dark:text-red-400'
                              }`}>
                              {tx.type === 'income' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                              ₹{tx.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 2xl:col-span-4 h-full">
          <Card className="h-full border-0 shadow-lg bg-white/50 backdrop-blur-sm ring-1 ring-gray-100 dark:bg-gray-900/50 dark:ring-gray-800">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground/80">
                <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                  <NotebookTabs className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                </div>
                Primary Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {loadingLedgers ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                    <p className="text-sm text-muted-foreground">Syncing accounts...</p>
                  </div>
                ) : topLedgers.length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground text-sm">No accounts added yet.</p>
                ) : (
                  topLedgers.map((ledger: Ledger) => {
                    const IconComp = iconMap[ledger.icon] || Wallet;
                    const displayBalance = ledger.balance || 0;
                    return (
                      <div
                        key={ledger.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                            <IconComp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="space-y-0.5 min-w-0 overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none truncate">{ledger.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{ledger.description}</p>
                          </div>
                        </div>
                        <div className="text-right ml-4 shrink-0">
                          <p className={`text-sm font-bold ${displayBalance < 0 ? 'text-rose-500' : 'text-gray-900 dark:text-gray-100'}`}>
                            ₹{displayBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Card className="border-0 shadow-xl bg-white/50 backdrop-blur-sm ring-1 ring-gray-100 dark:bg-gray-900/50 dark:ring-gray-800">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground/80">
                <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                  <PieChart className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                Monthly Budget Utilization
              </CardTitle>
              <Badge variant="outline" className="text-gray-500 font-medium">
                {mounted ? new Date().toLocaleString('default', { month: 'long', year: 'numeric' }) : '...'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loadingBudgets ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
              </div>
            ) : budgetStats.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">No budgets set for this month. <a href="/budgets" className="text-indigo-600 font-bold">Plan Now</a></p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-6 gap-6">
                {budgetStats.slice(0, 6).map((stat: any) => (
                  <div key={stat.id} className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{stat.categoryName}</span>
                      <span className={`font-bold ${stat.percentUsed > 100 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {stat.percentUsed.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={Math.min(stat.percentUsed, 100)} className="h-2" />
                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-tight">
                      <span>Spent: ₹{stat.spent.toLocaleString()}</span>
                      <span>Limit: ₹{stat.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    {(canView("ADMIN", "USER_MANAGEMENT") || canView("ADMIN", "ACCESS_CONTROL") || canView("ADMIN", "MASTERS") || canView("ADMIN", "SYSTEM_AUDIT")) && (
        <div className="mt-8">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-rose-50 to-white dark:from-rose-950/20 dark:to-gray-900 ring-1 ring-rose-100 dark:ring-rose-900/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <ShieldCheck className="h-32 w-32 text-rose-600" />
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-rose-800 dark:text-rose-400">
                  <ShieldCheck className="h-5 w-5" />
                  Administrator Portal
                </CardTitle>
                <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800">
                  System Authorized
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/60 dark:bg-gray-800/40 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600">
                      <UsersIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-tight">Active Users</span>
                  </div>
                  <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                    {users.length === 0 ? <Loader2 className="h-6 w-6 animate-spin text-rose-400" /> : users.length}
                  </p>
                  <p className="text-xs text-rose-500 mt-1">Total registered accounts</p>
                </div>

                <div className="bg-white/60 dark:bg-gray-800/40 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600">
                      <Activity className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-tight">Total Transactions</span>
                  </div>
                  <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                    {loadingTx ? <Loader2 className="h-6 w-6 animate-spin text-rose-400" /> : transactions.length}
                  </p>
                  <p className="text-xs text-rose-500 mt-1">In selected financial year</p>
                </div>

                <div className="bg-white/60 dark:bg-gray-800/40 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600">
                      <Database className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-tight">Active Ledgers</span>
                  </div>
                  <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                    {loadingLedgers ? <Loader2 className="h-6 w-6 animate-spin text-rose-400" /> : ledgers.length}
                  </p>
                  <p className="text-xs text-rose-500 mt-1">Total linked accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
