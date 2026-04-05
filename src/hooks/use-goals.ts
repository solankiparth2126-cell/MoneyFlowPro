"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { useTransactions } from "./use-transactions";
import { useLedgers } from "./use-ledgers";
import { useBudgets } from "./use-budgets";
import { supabase } from "@/lib/supabase";

export interface Goal {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category?: string;
  color?: string;
  ledgerId?: string;
}

export interface GoalContribution {
  id?: string;
  _id?: string;
  goalId: string;
  amount: number;
  date: string;
  notes?: string;
}

export function useGoals() {
  const { companyId, loading } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (loading || !companyId) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/goals?companyId=${companyId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const { data } = await response.json();
      const mappedGoals: Goal[] = (data || []).map((g: any) => ({
        id: g.id,
        title: g.name,
        description: g.description,
        targetAmount: Number(g.target_amount),
        currentAmount: Number(g.current_amount),
        deadline: g.deadline,
        status: g.status,
        companyId: g.company_id
      }));

      setGoals(mappedGoals);
    } catch (err) {
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, loading]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    isLoading,
    refresh: fetchGoals,
    createGoal: async (goal: any) => {
      if (!companyId) throw new Error("Company ID is required");

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          companyId,
          name: goal.title,
          description: goal.description,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount || 0,
          deadline: goal.deadline
        })
      });

      if (!response.ok) throw new Error("Failed to create");
      await fetchGoals();
    },
    updateGoal: async (id: string, data: any) => {
      if (!companyId) return;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          companyId,
          name: data.title,
          description: data.description,
          target_amount: data.targetAmount,
          current_amount: data.currentAmount,
          deadline: data.deadline
        })
      });

      if (!response.ok) throw new Error("Failed to update");
      await fetchGoals();
    },
    updateGoalAmount: async (id: string, amount: number) => {
      if (!companyId) return;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          companyId,
          current_amount: amount
        })
      });

      if (!response.ok) throw new Error("Failed to update");
      await fetchGoals();
    },
    deleteGoal: async (id: string) => {
      if (!companyId) return;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ companyId })
      });

      if (!response.ok) throw new Error("Failed to delete");
      await fetchGoals();
    },
    addContribution: async (args: any) => {
      if (!companyId) return;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/goals/${args.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          companyId,
          current_amount: args.amount
        })
      });

      if (!response.ok) throw new Error("Failed to add contribution");
      await fetchGoals();
    }
  };
}

export interface SmartInsight {
  type: 'success' | 'warning' | 'info' | 'goal';
  title: string;
  message: string;
}

export function useGoalHistory(goalId?: string) {
  return {
    history: [],
    isLoading: false,
    isError: false,
    refresh: () => {}
  };
}

export function useSmartInsights() {
  const { companyId } = useAuth();
  const { allTransactions, isLoading: loadingTx } = useTransactions();
  const { ledgers, isLoading: loadingLedgers } = useLedgers();
  
  const now = new Date();
  const { status: budgetStatus, isLoading: loadingBudgets } = useBudgets(now.getMonth() + 1, now.getFullYear());

  const insights = useMemo(() => {
    if (loadingTx || loadingLedgers || loadingBudgets || !companyId) return [];

    const result: SmartInsight[] = [];

    // 1. Low Balance Analyzer
    ledgers.forEach(l => {
      const balance = Number(l.balance) || 0;
      if (balance < 1000 && l.balance !== undefined) {
        result.push({
          type: 'warning',
          title: "Low Liquidity",
          message: `Your balance in '${l.name}' is ₹${balance.toLocaleString()}. Consider replenishing it.`
        });
      }
    });

    // 2. Budget Alert Analyzer
    budgetStatus.forEach(b => {
      if (b.percentUsed >= 85) {
        result.push({
          type: b.percentUsed >= 100 ? 'warning' : 'info',
          title: b.percentUsed >= 100 ? "Budget Exceeded" : "Budget Near Limit",
          message: `Spending in '${b.categoryName}' has reached ${b.percentUsed.toFixed(0)}% of your monthly limit.`
        });
      }
    });

    // 3. Data Hygiene Analyzer (Uncategorized)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const orphanCount = allTransactions.filter(tx => 
      (!tx.category || tx.category === "") && 
      new Date(tx.date) >= sevenDaysAgo
    ).length;

    if (orphanCount > 0) {
      result.push({
        type: 'info',
        title: "Reporting Gap",
        message: `You have ${orphanCount} uncategorized transactions from this week. Categorize them for accurate reports.`
      });
    }

    // 4. Positive Cash Flow Analyzer
    const monthlyIncome = allTransactions
      .filter(tx => tx.type === 'income' && new Date(tx.date).getMonth() === now.getMonth())
      .reduce((sum, tx) => sum + tx.amount, 0);
    const monthlyExpense = allTransactions
      .filter(tx => tx.type === 'expense' && new Date(tx.date).getMonth() === now.getMonth())
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (monthlyIncome > monthlyExpense && monthlyExpense > 0) {
      const savings = monthlyIncome - monthlyExpense;
      result.push({
        type: 'success',
        title: "Strong Performance",
        message: `Your income is higher than your expenses this month! You've potentially saved ₹${savings.toLocaleString()}.`
      });
    }

    return result;
  }, [allTransactions, ledgers, budgetStatus, loadingTx, loadingLedgers, loadingBudgets, companyId]);

  return {
    insights,
    isLoading: loadingTx || loadingLedgers || loadingBudgets,
    isError: false,
    refresh: () => {}
  };
}

