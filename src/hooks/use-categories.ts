"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { Category } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export function useCategories() {
  const { companyId, loading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (loading || !companyId) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `/api/categories?companyId=${encodeURIComponent(companyId)}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const { data } = await response.json();

      const mappedCategories: Category[] = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        icon: c.icon,
        color: c.color,
        companyId: c.company_id,
        parentId: c.parent_id,
        keywords: c.keywords,
        isDeleted: c.is_deleted
      }));

      setCategories(mappedCategories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, loading]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Create the return object in parts so seed can reference create
  const createCategory = async (args: any) => {
    if (!companyId) return;

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Not authenticated");

    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({
        companyId,
        name: args.name,
        type: args.type,
        icon: args.icon,
        color: args.color || "#4f46e5",
        parentId: args.parentId,
        keywords: args.keywords
      })
    });

    if (!response.ok) {
      
      const error = await response.json();
      throw new Error(error.error || "Failed to create category");
    }

    await fetchCategories();
  };

  const updateCategory = async (args: any) => {
    if (!companyId) return;

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`/api/categories/${args.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({
        companyId,
        name: args.name,
        type: args.type,
        icon: args.icon,
        color: args.color,
        parentId: args.parentId,
        keywords: args.keywords
      })
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("You do not have access to this category");
      }
      const error = await response.json();
      throw new Error(error.error || "Failed to update category");
    }

    await fetchCategories();
  };

  const removeCategory = async (args: any) => {
    if (!companyId) return;

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`/api/categories/${args.id}`, {
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
        throw new Error("You do not have access to this category");
      }
      const error = await response.json();
      throw new Error(error.error || "Failed to delete category");
    }

    await fetchCategories();
  };

  const seedCategories = async () => {
    if (!companyId) return;

    const defaultCategories = [
      { name: "Salary", type: "income", icon: "Wallet", color: "#10b981" },
      { name: "Food & Dining", type: "expense", icon: "Utensils", color: "#f59e0b" },
      { name: "Shopping", type: "expense", icon: "ShoppingBag", color: "#8b5cf6" },
      { name: "Transportation", type: "expense", icon: "Bus", color: "#3b82f6" },
      { name: "Rent & Utilities", type: "expense", icon: "Home", color: "#ef4444" },
      { name: "Entertainment", type: "expense", icon: "Film", color: "#ec4899" },
      { name: "Health", type: "expense", icon: "HeartPulse", color: "#ef4444" },
      { name: "Investment", type: "income", icon: "TrendingUp", color: "#10b981" },
    ];

    for (const cat of defaultCategories) {
      await createCategory({ ...cat });
    }
  };

  return {
    categories,
    isLoading,
    refresh: fetchCategories,
    create: createCategory,
    update: updateCategory,
    remove: removeCategory,
    seed: seedCategories,
  };
}

