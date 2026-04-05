"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export interface MonthlyTrend {
    month: string;
    income: number;
    expense: number;
    savings: number;
}

export function useMonthlyTrends() {
    const { companyId, loading } = useAuth();
    const [trends, setTrends] = useState<MonthlyTrend[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTrends = useCallback(async () => {
        if (loading || !companyId) {
            setTrends([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Not authenticated");

            const response = await fetch(`/api/monthly-trends?companyId=${companyId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include',
            });

            if (!response.ok) throw new Error("Failed to fetch");

            const { data } = await response.json();

            const monthMap = new Map<string, { income: number, expense: number }>();
            (data || []).forEach((tx: any) => {
                const month = tx.date.substring(0, 7);
                const current = monthMap.get(month) || { income: 0, expense: 0 };
                if (tx.type === 'income') current.income += Number(tx.amount);
                else if (tx.type === 'expense') current.expense += Number(tx.amount);
                monthMap.set(month, current);
            });

            const result = Array.from(monthMap.entries()).map(([month, data]) => ({
                month,
                income: data.income,
                expense: data.expense,
                savings: data.income - data.expense
            }));

            setTrends(result);
        } catch (err) {
            setTrends([]);
        } finally {
            setIsLoading(false);
        }
    }, [companyId, loading]);

    useEffect(() => {
        fetchTrends();
    }, [fetchTrends]);

    return {
        trends,
        isLoading,
        refresh: fetchTrends
    };
}

