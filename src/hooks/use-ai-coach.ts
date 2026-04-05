"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export interface DashboardInsight {
  summary: {
    currentExpenses: number;
    lastExpenses: number;
    currentIncome: number;
    savings: number;
    momChange: number;
  };
  topCategories: Array<{ name: string; amount: number }>;
  efficiencyTarget: string;
  checklist: Array<{ id: string; task: string; priority: 'high' | 'medium'; action: string }>;
}

export function useAiCoach() {
  const { companyId, loading: authLoading } = useAuth();
  const [insight, setInsight] = useState<DashboardInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInsight = useCallback(async () => {
    if (authLoading || !companyId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/ai/coach?companyId=${companyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch coach insights");
      const { data } = await response.json();
      setInsight(data);
    } catch (err) {
      console.error("[AI COACH] Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, authLoading]);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  return { insight, isLoading, refresh: fetchInsight };
}

