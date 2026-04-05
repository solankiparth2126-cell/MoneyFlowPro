"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export interface RecurringTransaction {
    id?: string;
    _id?: string;
    description: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    paymentMethod: string;
    ledgerId?: string;
    interval: "daily" | "weekly" | "monthly" | "yearly";
    dayOfInterval: number;
    nextRunDate: string;
    lastRunDate?: string;
    isActive: boolean;
}

export function useRecurring() {
    const { companyId, loading } = useAuth();
    const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRecurring = useCallback(async () => {
        if (loading || !companyId) {
            setRecurring([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Not authenticated");

            const response = await fetch(`/api/recurring?companyId=${companyId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include',
            });

            if (!response.ok) throw new Error("Failed to fetch");

            const { data } = await response.json();
            const mappedRecurring: RecurringTransaction[] = (data || []).map((r: any) => ({
                id: r.id,
                description: r.description,
                amount: Number(r.amount),
                type: r.type,
                category: r.category_id,
                paymentMethod: "Bank",
                ledgerId: r.ledger_id,
                interval: r.frequency,
                dayOfInterval: 1,
                nextRunDate: r.next_occurrence,
                isActive: r.is_active
            }));

            setRecurring(mappedRecurring);
        } catch (err) {
            setRecurring([]);
        } finally {
            setIsLoading(false);
        }
    }, [companyId, loading]);

    useEffect(() => {
        fetchRecurring();
    }, [fetchRecurring]);

    const create = async (data: any) => {
        if (!companyId) throw new Error("Company ID is required");

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not authenticated");

        const response = await fetch('/api/recurring', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({
                companyId,
                description: data.description,
                amount: data.amount,
                type: data.type,
                frequency: data.interval,
                start_date: new Date().toISOString().split('T')[0],
                next_occurrence: data.nextRunDate,
                is_active: data.isActive ?? true,
                ledger_id: data.ledgerId,
                category_id: data.category
            })
        });

        if (!response.ok) throw new Error("Failed to create");
        await fetchRecurring();
    };

    const update = async (id: any, data: any) => {
        if (!companyId) return;

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not authenticated");

        const response = await fetch(`/api/recurring/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({
                companyId,
                description: data.description,
                amount: data.amount,
                type: data.type,
                frequency: data.interval,
                next_occurrence: data.nextRunDate,
                is_active: data.isActive,
                ledger_id: data.ledgerId,
                category_id: data.category
            })
        });

        if (!response.ok) throw new Error("Failed to update");
        await fetchRecurring();
    };

    const remove = async (id: any) => {
        if (!companyId) return;

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not authenticated");

        const response = await fetch(`/api/recurring/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({ companyId })
        });

        if (!response.ok) throw new Error("Failed to delete");
        await fetchRecurring();
    };

    return {
        recurring,
        isLoading,
        refresh: fetchRecurring,
        create,
        update,
        remove,
        mutate: () => {}
    };
}

