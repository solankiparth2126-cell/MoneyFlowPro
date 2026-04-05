import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/types";

export function useUsers() {
    const { user } = useAuth();
    const isAdmin = user?.role?.toLowerCase() === "admin";
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        if (!isAdmin) {
            setUsers([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mappedUsers: User[] = (data || []).map((p: any) => ({
                id: p.id,
                email: p.email,
                username: p.username,
                name: p.full_name,
                role: p.role,
                status: p.status,
                rights: p.rights || [],
                createdAt: new Date(p.created_at).getTime()
            }));

            setUsers(mappedUsers);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setIsLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return {
        users,
        isLoading,
        isAdmin,
        refresh: fetchUsers,
        update: async (args: { id: string; role?: string; status?: string; rights?: string[] }) => {
            const { error } = await supabase
                .from('profiles')
                .update({
                    role: args.role,
                    status: args.status,
                    rights: args.rights
                })
                .eq('id', args.id);
            
            if (error) throw error;
            await fetchUsers();
        },
        remove: async (args: { id: string }) => {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Not authenticated");

            const response = await fetch('/api/admin/users/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: args.id })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to delete user");
            }

            await fetchUsers();
        },
        updateProfile: async (args: { name?: string; username?: string }) => {
            if (!user?.id) return;
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: args.name,
                    username: args.username
                })
                .eq('id', user.id);
            
            if (error) throw error;
            await fetchUsers();
        },
        resetPassword: async (args: { id: string; password?: string }) => {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Not authenticated");

            const response = await fetch('/api/admin/users/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: args.id, newPassword: args.password })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to reset password");
            }
        }
    };
}

