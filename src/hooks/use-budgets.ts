"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export function useBudgets(month?: number, year?: number) {
  const { companyId, loading } = useAuth();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [status, setStatus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBudgets = useCallback(async () => {
    if (loading || !companyId) {
      setBudgets([]);
      setStatus([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const params = new URLSearchParams({
        companyId,
        ...(month !== undefined && { month: month.toString() }),
        ...(year !== undefined && { year: year.toString() })
      });

      const response = await fetch(`/api/budgets?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const { data } = await response.json();
      setBudgets(data.budgets || []);
      setStatus(data.status || []);
    } catch (err) {
      // Silently fail
      setBudgets([]);
      setStatus([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, loading, month, year]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return {
    budgets,
    status,
    isLoading,
    refresh: fetchBudgets,
    create: async (args: any) => {
      if (!companyId) throw new Error("Company ID is required");

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ companyId, ...args })
      });

      if (!response.ok) throw new Error("Failed to create");
      await fetchBudgets();
    },
    update: async (args: any) => {
      if (!companyId) return;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/budgets/${args.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ companyId, ...args })
      });

      if (!response.ok) throw new Error("Failed to update");
      await fetchBudgets();
    },
    remove: async (args: any) => {
      if (!companyId) return;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/budgets/${args.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ companyId })
      });

      if (!response.ok) throw new Error("Failed to delete");
      await fetchBudgets();
    }
  };
}

