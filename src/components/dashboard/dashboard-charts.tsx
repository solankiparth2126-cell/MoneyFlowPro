"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wallet, PieChart as PieIcon, Activity } from "lucide-react";
import { useMonthlyTrends } from "@/hooks/use-monthly-trends";
import { useCategoryBreakdown, useWealthDistribution } from "@/hooks/use-stats";
import { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { Transaction } from "@/lib/types";

const AreaChartComponent = dynamic(() => import("./charts-wrapper").then(m => m.AreaChartComponent), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-50/50 animate-pulse rounded-xl" />
});

const PieChartComponent = dynamic(() => import("./charts-wrapper").then(m => m.PieChartComponent), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-50/50 animate-pulse rounded-full" />
});

interface DashboardChartsProps {
    startDate?: string;
    endDate?: string;
}

export function DashboardCharts({ startDate, endDate }: DashboardChartsProps) {
    const { transactions, isLoading: txLoading } = useTransactions(startDate, endDate);
    const { trends, isLoading: trendsLoading } = useMonthlyTrends();
    const { breakdown, isLoading: breakdownLoading } = useCategoryBreakdown();
    const { distribution, isLoading: distLoading } = useWealthDistribution();
    
    const [breakdownMode, setBreakdownMode] = useState<"expense" | "wealth">("expense");

    const monthlyData = useMemo(() => {
        if (trends.length > 0 && !startDate && !endDate) {
            return trends.map(t => ({
                name: new Date(t.month).toLocaleString('default', { month: 'short' }),
                income: t.income,
                expense: t.expense
            }));
        }

        // Fallback or FY filtered logic
        let months: string[] = [];
        if (startDate && endDate) {
            months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
        } else {
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                months.push(d.toLocaleString('default', { month: 'short' }));
            }
        }

        const dataMap: Record<string, { income: number, expense: number }> = {};
        months.forEach(m => dataMap[m] = { income: 0, expense: 0 });

        transactions.forEach((t: Transaction) => {
            const date = new Date(t.date);
            const monthName = date.toLocaleString('default', { month: 'short' });
            if (dataMap[monthName]) {
                if (t.type === 'income') dataMap[monthName].income += t.amount;
                else dataMap[monthName].expense += t.amount;
            }
        });

        return months.map(m => ({
            name: m,
            income: dataMap[m].income,
            expense: dataMap[m].expense
        }));
    }, [transactions, trends, startDate, endDate]);

    const categoryData = useMemo(() => {
        const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];
        
        if (breakdownMode === "expense") {
            return breakdown.map((item, i) => ({
                name: item.category,
                value: item.amount,
                color: colors[i % colors.length]
            })).slice(0, 5);
        } else {
            return distribution.map((item, i) => ({
                name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
                value: item.balance,
                color: colors[i % colors.length]
            }));
        }
    }, [breakdown, distribution, breakdownMode]);

    const isLoading = txLoading || trendsLoading || breakdownLoading || distLoading;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12 2xl:grid-cols-16">
            <Card className="lg:col-span-12 xl:col-span-7 2xl:col-span-8 border-0 shadow-xl glass-iris overflow-hidden reveal" style={{ animationDelay: '300ms' }}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground/80">
                             <Activity className="h-4 w-4 text-indigo-500" />
                             Cash Flow Performance
                        </CardTitle>
                    </div>
                    <Tabs defaultValue="area" className="w-[120px]">
                        <TabsList className="grid w-full grid-cols-2 bg-indigo-50/50 dark:bg-indigo-900/20">
                            <TabsTrigger value="area">Area</TabsTrigger>
                            <TabsTrigger value="bar">Bar</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                    <div className={`${monthlyData.every(d => d.income === 0 && d.expense === 0) ? 'h-auto py-8' : 'h-[320px]'} w-full mt-4 flex items-center justify-center`}>
                        {trendsLoading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-500 opacity-20" />
                        ) : monthlyData.every(d => d.income === 0 && d.expense === 0) ? (
                            <div className="text-center space-y-2">
                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full w-fit mx-auto">
                                    <Activity className="h-5 w-5 text-gray-400" />
                                </div>
                                <p className="text-[11px] font-medium text-muted-foreground italic uppercase tracking-wider opacity-60">No cash flow activity recorded yet.</p>
                            </div>
                        ) : (
                            <AreaChartComponent data={monthlyData} />
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-12 xl:col-span-5 2xl:col-span-8 border-0 shadow-xl glass-iris overflow-hidden reveal" style={{ animationDelay: '400ms' }}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground/80">
                        {breakdownMode === "expense" ? <PieIcon className="h-4 w-4 text-purple-500" /> : <Wallet className="h-4 w-4 text-emerald-500" />}
                        {breakdownMode === "expense" ? "Expense Split" : "Wealth Mix"}
                    </CardTitle>
                    <div className="flex bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-lg ring-1 ring-gray-100 dark:ring-gray-800">
                         <button 
                            onClick={() => setBreakdownMode("expense")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${breakdownMode === "expense" ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                         >
                            Spent
                         </button>
                         <button 
                            onClick={() => setBreakdownMode("wealth")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${breakdownMode === "wealth" ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                         >
                            Wealth
                         </button>
                    </div>
                </CardHeader>
                <CardContent className={`flex flex-col items-center justify-center ${categoryData.length === 0 ? 'min-h-[220px] py-6' : 'min-h-[350px]'}`}>
                    {breakdownLoading || distLoading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500 opacity-20" />
                        </div>
                    ) : categoryData.length === 0 ? (
                        <div className="text-center p-4 space-y-3">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl w-fit mx-auto">
                                <PieIcon className="h-6 w-6 text-indigo-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-black tracking-tight text-gray-900 dark:text-gray-100 uppercase">
                                    {breakdownMode === "expense" ? "No Expenses Yet" : "No Accounts Found"}
                                </p>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-60 max-w-[200px] mx-auto">
                                    {breakdownMode === "expense" 
                                        ? "Add transactions to see spending" 
                                        : "Link a Bank account"}
                                </p>
                            </div>
                            <a 
                                href={breakdownMode === "expense" ? "/transactions" : "/ledgers"}
                                className="inline-block px-5 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/20"
                            >
                                {breakdownMode === "expense" ? "Add Transaction" : "Scale Accounts"}
                            </a>
                        </div>
                    ) : (
                        <>
                            <div className="h-[250px] w-full">
                                <PieChartComponent data={categoryData} />

                            </div>
                            <div className="grid grid-cols-1 gap-2 w-full mt-6 px-4">
                                {categoryData.map((item) => (
                                    <div key={item.name} className="flex items-center group cursor-default">
                                        <div className="h-2 w-2 rounded-full transition-all group-hover:scale-150" style={{ backgroundColor: item.color }} />
                                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 ml-3 truncate uppercase tracking-tight">{item.name}</span>
                                        <span className="text-sm font-black ml-auto text-gray-900 dark:text-gray-100">₹{item.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
