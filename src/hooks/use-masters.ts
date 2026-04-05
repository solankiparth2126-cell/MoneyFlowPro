"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export function useCompanies() {
  const { user, loading } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompanies = useCallback(async () => {
    if (loading || !user) {
      setCompanies([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch('/api/masters', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const { data } = await response.json();
      setCompanies(data || []);
    } catch (err) {
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, loading]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return {
    companies,
    isLoading,
    refresh: fetchCompanies,
    create: async (args: any) => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch('/api/masters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(args)
      });

      if (!response.ok) throw new Error("Failed to create");
      await fetchCompanies();
    },
    update: async (args: any) => {
      const { id, ...updateData } = args;
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/masters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error("Failed to update");
      await fetchCompanies();
    },
    remove: async (args: { id: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/masters/${args.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({})
      });

      if (!response.ok) throw new Error("Failed to delete");
      await fetchCompanies();
    },
  };
}

export function useFinancialYears() {
  const { companyId, loading } = useAuth();
  const [financialYears, setFinancialYears] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFinancialYears = useCallback(async () => {
    if (loading || !companyId) {
      setFinancialYears([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/masters/${companyId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const { data } = await response.json();
      setFinancialYears(data || []);
    } catch (err) {
      setFinancialYears([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, loading]);

  useEffect(() => {
    fetchFinancialYears();
  }, [fetchFinancialYears]);

  return {
    financialYears,
    isLoading,
    refresh: fetchFinancialYears,
    create: async (args: any) => {
      if (!companyId) return;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/masters/${companyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ companyId, ...args })
      });

      if (!response.ok) throw new Error("Failed to create");
      await fetchFinancialYears();
    },
    update: async (args: any) => {
      if (!companyId) return;

      const { id, ...updateData } = args;
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/masters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ companyId, ...updateData })
      });

      if (!response.ok) throw new Error("Failed to update");
      await fetchFinancialYears();
    },
    remove: async (args: { id: string }) => {
      if (!companyId) return;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/masters/${args.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ companyId })
      });

      if (!response.ok) throw new Error("Failed to delete");
      await fetchFinancialYears();
    },
  };
}

