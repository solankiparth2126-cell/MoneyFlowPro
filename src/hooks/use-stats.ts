"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export interface CategoryStat {
    category: string;
    amount: number;
    count: number;
}

export interface WealthDistribution {
    type: string;
    balance: number;
}

export function useCategoryBreakdown(type: "income" | "expense" = "expense") {
    const { companyId, loading } = useAuth();
    const [breakdown, setBreakdown] = useState<CategoryStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBreakdown = useCallback(async () => {
        if (loading || !companyId) {
            setBreakdown([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Not authenticated");

            const response = await fetch(
                `/api/stats/breakdown?type=${type}&companyId=${encodeURIComponent(companyId)}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                    credentials: 'include',
                }
            );

            if (!response.ok) throw new Error("Failed to fetch");

            const { data } = await response.json();
            setBreakdown(data || []);
        } catch (err) {
            // Silently fail
            setBreakdown([]);
        } finally {
            setIsLoading(false);
        }
    }, [companyId, loading, type]);

    useEffect(() => {
        fetchBreakdown();
    }, [fetchBreakdown]);

    return {
        breakdown,
        isLoading,
        refresh: fetchBreakdown
    };
}

export function useWealthDistribution() {
    const { companyId, loading } = useAuth();
    const [distribution, setDistribution] = useState<WealthDistribution[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDistribution = useCallback(async () => {
        if (loading || !companyId) {
            setDistribution([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Not authenticated");

            const response = await fetch(
                `/api/stats/wealth?companyId=${encodeURIComponent(companyId)}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                    credentials: 'include',
                }
            );

            if (!response.ok) throw new Error("Failed to fetch");

            const { data } = await response.json();
            setDistribution(data || []);
        } catch (err) {
            // Silently fail
            setDistribution([]);
        } finally {
            setIsLoading(false);
        }
    }, [companyId, loading]);

    useEffect(() => {
        fetchDistribution();
    }, [fetchDistribution]);

    return {
        distribution,
        isLoading,
        refresh: fetchDistribution
    };
}

export function useStats(startDate?: string, endDate?: string) {
    const { companyId, loading } = useAuth();
    const [summary, setSummary] = useState({
        totalBalance: 0,
        balance: 0,
        totalIncome: 0,
        totalExpenses: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        if (loading || !companyId) {
            setSummary({
                totalBalance: 0,
                balance: 0,
                totalIncome: 0,
                totalExpenses: 0
            });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Not authenticated");

            // Fetch income, expense and wealth distribution
            const [incomeRes, expenseRes, wealthRes] = await Promise.all([
                fetch(
                    `/api/stats/breakdown?type=income&companyId=${encodeURIComponent(companyId)}`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` },
                        credentials: 'include',
                    }
                ),
                fetch(
                    `/api/stats/breakdown?type=expense&companyId=${encodeURIComponent(companyId)}`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` },
                        credentials: 'include',
                    }
                ),
                fetch(
                    `/api/stats/wealth?companyId=${encodeURIComponent(companyId)}`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` },
                        credentials: 'include',
                    }
                )
            ]);

            if (!incomeRes.ok || !expenseRes.ok || !wealthRes.ok) throw new Error("Failed to fetch");

            const { data: incomeData } = await incomeRes.json();
            const { data: expenseData } = await expenseRes.json();
            const { data: wealthData } = await wealthRes.json();

            const totalIncome = (incomeData || []).reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
            const totalExpenses = (expenseData || []).reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
            const totalBalance = (wealthData || []).reduce((sum: number, item: any) => sum + (item.balance || 0), 0);

            setSummary({
                totalBalance,
                balance: totalBalance,
                totalIncome,
                totalExpenses
            });
        } catch (err) {
            setSummary({
                totalBalance: 0,
                balance: 0,
                totalIncome: 0,
                totalExpenses: 0
            });
        } finally {
            setIsLoading(false);
        }
    }, [companyId, loading, startDate, endDate]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        summary,
        isLoading,
        refresh: fetchStats
    };
}

