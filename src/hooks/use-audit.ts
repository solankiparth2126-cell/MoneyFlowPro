"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export function useAuditLogs() {
  const { companyId } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!companyId) {
      setLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `/api/audit-logs?companyId=${encodeURIComponent(companyId)}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
      }

      const { data } = await response.json();
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  const logAction = useCallback(async ({
    action,
    module,
    details
  }: {
    action: string,
    module: string,
    details: string
  }) => {
    if (!companyId) return;

    try {
      // Audit logging is now handled by backend API routes
      // Frontend just logs to console for debugging
      console.log(`[Audit] ${action} - ${module}: ${details}`);
    } catch (err) {
      console.error("Log action failed:", err);
    }
  }, [companyId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    isLoading,
    refresh: fetchLogs,
    logAction,
    deleteAllLogs: async () => {
        if (!companyId) return 0;

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not authenticated");

        const response = await fetch('/api/audit-logs', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({ companyId })
        });
        if (!response.ok) throw new Error("Failed to delete logs");
        await fetchLogs();
        return 1;
    },
    nuclearWipe: async () => {
        if (!companyId) return 0;

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not authenticated");

        const response = await fetch('/api/audit-logs', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({ companyId })
        });
        if (!response.ok) throw new Error("Failed to delete logs");
        await fetchLogs();
        return 1;
    }
  };
}

