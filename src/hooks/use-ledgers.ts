"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { Ledger } from "@/lib/types";
import { supabase } from "@/lib/supabase";

/**
 * Custom hook to fetch and cache ledgers via secure API routes
 */
export function useLedgers() {
    const { companyId, loading } = useAuth();
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const fetchLedgers = useCallback(async () => {
        if (loading || !companyId) {
            setLedgers([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setIsError(false);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Not authenticated");

            const response = await fetch(
                `/api/ledgers?companyId=${encodeURIComponent(companyId)}`,
                {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                
                throw new Error(`Failed to fetch ledgers: ${response.statusText}`);
            }

            const { data } = await response.json();

            const mappedLedgers: Ledger[] = (data || []).map((l: any) => ({
                id: l.id,
                name: l.name,
                description: l.description,
                balance: Number(l.balance),
                initialBalance: Number(l.initial_balance),
                icon: l.icon,
                accountType: l.account_type,
                currency: l.currency,
                companyId: l.company_id,
                isDeleted: l.is_deleted
            }));

            setLedgers(mappedLedgers);
        } catch (err) {
            console.error("Failed to fetch ledgers:", err);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }, [companyId, loading]);

    useEffect(() => {
        fetchLedgers();
    }, [fetchLedgers]);

    return {
        ledgers,
        isLoading,
        isError,
        refresh: fetchLedgers,
        create: async (args: any) => {
            if (!companyId) throw new Error("Company ID is required");

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Not authenticated");

            const response = await fetch('/api/ledgers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    companyId,
                    name: args.name,
                    description: args.description,
                    initialBalance: args.initialBalance ?? args.balance ?? 0,
                    balance: args.balance ?? 0,
                    icon: args.icon,
                    accountType: args.accountType,
                    currency: args.currency || "INR"
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Unknown Error' }));
                throw new Error(error.error || "Failed to create ledger");
            }

            await fetchLedgers();
        },
        update: async (args: any) => {
            if (!companyId) return;

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Not authenticated");

            const response = await fetch(`/api/ledgers/${args.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    companyId,
                    name: args.name,
                    description: args.description,
                    balance: args.balance,
                    initialBalance: args.initialBalance,
                    icon: args.icon,
                    accountType: args.accountType,
                    currency: args.currency
                })
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("You do not have access to this ledger");
                }
                const error = await response.json();
                throw new Error(error.error || "Failed to update ledger");
            }

            await fetchLedgers();
        },
        remove: async (args: any) => {
            if (!companyId) return;

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Not authenticated");

            const response = await fetch(`/api/ledgers/${args.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({ companyId })
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("You do not have access to this ledger");
                }
                const error = await response.json();
                throw new Error(error.error || "Failed to delete ledger");
            }

            await fetchLedgers();
        }
    };
}

