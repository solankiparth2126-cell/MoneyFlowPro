"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Transaction, Ledger } from "@/lib/types";
import { supabase } from "@/lib/supabase";

const EMPTY_ARRAY: any[] = [];

/**
 * Custom hook for fetching and caching transactions via secure API routes
 */
export function useTransactions(startDate?: string, endDate?: string, page: number = 1, pageSize: number = 50) {
    const { toast } = useToast();
    const { companyId, loading } = useAuth();
    const [transactionsAll, setTransactionsAll] = useState<Transaction[]>([]);
    const [dbLedgers, setDbLedgers] = useState<Ledger[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const fetchData = useCallback(async () => {
        if (loading || !companyId) {
            setTransactionsAll([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setIsError(false);
        try {
            // Get JWT token for Authorization header
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                throw new Error("Not authenticated");
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            // 1. Fetch transactions via secure API
            const txResponse = await fetch(
                `/api/transactions?companyId=${encodeURIComponent(companyId)}`,
                {
                    credentials: 'include',
                    headers
                }
            );

            if (!txResponse.ok) {
                
                throw new Error(`Failed to fetch transactions: ${txResponse.statusText}`);
            }

            const { data: txData } = await txResponse.json();

            const mappedTransactions: Transaction[] = (txData || []).map((t: any) => ({
                id: t.id,
                description: t.description,
                amount: Number(t.amount),
                date: t.date,
                type: t.type,
                category: t.category_id,
                paymentMethod: t.payment_method,
                ledgerId: t.ledger_id,
                companyId: t.company_id,
                isDeleted: t.is_deleted
            }));

            setTransactionsAll(mappedTransactions);

            // 2. Fetch ledgers via secure API
            const ledgerResponse = await fetch(
                `/api/ledgers?companyId=${encodeURIComponent(companyId)}`,
                {
                    credentials: 'include',
                    headers
                }
            );

            if (!ledgerResponse.ok) {
                
                throw new Error(`Failed to fetch ledgers: ${ledgerResponse.statusText}`);
            }

            const { data: ledgerData } = await ledgerResponse.json();
            setDbLedgers(ledgerData || []);

        } catch (err) {
            console.error("Failed to fetch transactions:", err);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }, [companyId, loading]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredTransactions = useMemo(() => {
        if (!startDate || !endDate) return transactionsAll;
        return transactionsAll.filter(tx => tx.date >= startDate && tx.date <= endDate);
    }, [transactionsAll, startDate, endDate]);

    const totalCount = filteredTransactions.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedTransactions = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);

    // Private helper for API requests
    const callApi = async (url: string, method: string, body: any) => {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not authenticated");

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Failed to ${method} ${url}`);
        }

        return response.json();
    };

    return {
        allTransactions: transactionsAll,
        transactions: paginatedTransactions,
        totalCount,
        totalPages,
        isLoading,
        isError,
        refresh: fetchData,
        create: async (args: Partial<Transaction>) => {
            if (!companyId) throw new Error("Company ID is required");
            
            await callApi('/api/transactions', 'POST', {
                companyId,
                description: args.description,
                amount: args.amount,
                date: args.date,
                type: args.type,
                ledgerId: args.ledgerId,
                category: args.category, // Backend expects 'category' for single POST
                paymentMethod: args.paymentMethod || "bank",
            });

            toast({ title: "Success", description: `Created transaction: ${args.description}` });
            await fetchData();
        },
        update: async (args: Transaction) => {
            if (!companyId) return;

            await callApi(`/api/transactions/${args.id}`, 'PUT', {
                companyId,
                description: args.description,
                amount: args.amount,
                date: args.date,
                type: args.type,
                ledgerId: args.ledgerId,
                category: args.category,
                paymentMethod: args.paymentMethod,
            });

            toast({ title: "Success", description: `Updated transaction: ${args.description}` });
            await fetchData();
        },
        remove: async (args: { id: string }) => {
            if (!companyId) return;

            await callApi(`/api/transactions/${args.id}`, 'DELETE', { companyId });

            toast({ title: "Success", description: "Transaction deleted" });
            await fetchData();
        },
        importCsv: async (file: File, ledgerId?: string) => {
            try {
                const { parseFile } = await import("@/lib/import-utils");
                const importedData = await parseFile(file);

                if (importedData.length === 0) {
                    throw new Error("No valid transactions found in the file.");
                }

                if (!ledgerId || ledgerId === "none") {
                    throw new Error("Please select a ledger before importing.");
                }

                toast({ title: "Processing...", description: `Importing ${importedData.length} entries.` });

                // Map categories using secure API
                const { data: dbCategories } = await callApi(`/api/categories?companyId=${encodeURIComponent(companyId!)}`, 'GET', null);

                const categoryMap = new Map(
                    (dbCategories || []).map((c: any) => [c.name.toLowerCase(), c.id])
                );

                const insertData = importedData.map(tx => {
                    let matchedCatID = tx.category ? categoryMap.get(tx.category.toLowerCase()) : undefined;
                    if (!matchedCatID && tx.category && tx.category !== "Uncategorized") {
                        matchedCatID = categoryMap.get("miscellaneous");
                    }

                    return {
                        description: tx.description,
                        amount: tx.amount,
                        date: tx.date,
                        type: tx.type,
                        paymentMethod: tx.paymentMethod || 'bank',
                        companyId,
                        ledgerId: ledgerId,
                        category: matchedCatID || null, // API validation expects 'category'
                        currency: "INR"
                    };
                });

                await callApi('/api/transactions', 'POST', { batch: insertData, companyId });

                toast({
                    title: "Import Complete",
                    description: `Successfully imported ${importedData.length} transactions.`,
                    className: "bg-green-50 border-green-200 text-green-900"
                });
                await fetchData();
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Import Failed",
                    description: error.message || "An error occurred during parsing."
                });
                throw error;
            }
        },
        clearAllByLedger: async (ledgerId: string) => {
            if (!companyId) return;
            const ids = transactionsAll.filter(t => t.ledgerId === ledgerId).map(t => t.id);
            if (ids.length === 0) return;

            await callApi('/api/transactions/bulk', 'POST', { ids, companyId, action: 'DELETE' });
            
            toast({ title: "Success", description: "All transactions cleared for this ledger" });
            await fetchData();
        },
        deleteAll: async () => {
            if (!companyId) return;
            const ids = transactionsAll.map(t => t.id);
            if (ids.length === 0) return;

            await callApi('/api/transactions/bulk', 'POST', { ids, companyId, action: 'DELETE' });

            toast({ title: "Success", description: "All transactions deleted" });
            await fetchData();
        },
        purgeOrphans: async () => {
            if (!companyId) return 0;
            const orphans = transactionsAll.filter(tx => !tx.ledgerId || !tx.category);

            if (orphans.length === 0) {
                toast({ title: "No orphans", description: "All transactions are correctly assigned" });
                return 0;
            }

            await callApi('/api/transactions/bulk', 'POST', { ids: orphans.map(t => t.id), companyId, action: 'HARD_DELETE' });

            toast({ title: "Success", description: `Purged ${orphans.length} orphaned transactions` });
            await fetchData();
            return orphans.length;
        },
        hardDelete: async () => {
            if (!companyId) return 0;
            const ids = transactionsAll.map(t => t.id);
            if (ids.length === 0) return 0;

            await callApi('/api/transactions/bulk', 'POST', { ids, companyId, action: 'HARD_DELETE' });

            toast({ title: "Success", description: `Permanently deleted ${ids.length} transactions` });
            await fetchData();
            return ids.length;
        }
    };
}

