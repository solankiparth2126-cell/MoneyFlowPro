"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => void;
    logout: () => Promise<void>;
    companyId: string | null;
    setCompanyId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => {},
    logout: async () => {},
    companyId: null,
    setCompanyId: () => {}
} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [companyId, setCompanyIdState] = useState<string | null>(null);
    const isProcessing = useRef(false);
    const lastSyncedUser = useRef<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (isProcessing.current) return;

            try {
                if (session?.user) {
                    // Only sync if it's a new session or the user has changed
                    if (lastSyncedUser.current === session.user.id && event !== 'SIGNED_IN') {
                        return;
                    }
                    
                    isProcessing.current = true;
                    await syncUserProfile(session.user);
                    lastSyncedUser.current = session.user.id;
                } else {
                    setUser(null);
                    lastSyncedUser.current = null;
                    setLoading(false);
                }
            } catch (err: any) {
                if (err.message?.includes('Lock') && err.message?.includes('stole it')) {
                    // Silently handle lock contention
                } else {
                    console.error("[AUTH] State change error:", err);
                }
            } finally {
                isProcessing.current = false;
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const syncUserProfile = async (supabaseUser: any) => {
        try {
            // 1. Fetch existing profile to preserve role and other manual settings
            const { data: existingProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', supabaseUser.id)
                .maybeSingle();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.warn("Profile fetch error (non-fatal)");
            }

            // Data to sync from Auth metadata
            const syncData: any = {
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                username: existingProfile?.username || supabaseUser.email?.split('@')[0] || 'user',
                full_name: supabaseUser.user_metadata?.full_name || existingProfile?.full_name || '',
                role: existingProfile?.role || 'User',
                status: existingProfile?.status || 'Active',
                rights: existingProfile?.rights || [],
                bank_account_count: existingProfile?.bank_account_count || 0,
                credit_card_count: existingProfile?.credit_card_count || 0
            };

            // Use upsert to handle both first-time registration and subsequent logins
            const { data: profile, error } = await supabase
                .from('profiles')
                .upsert([syncData], { onConflict: 'id' })
                .select()
                .single();

            if (error) {
                console.error("[AUTH] Profile sync failed:", error.message, error.details, error.hint);
                throw error;
            }

            if (!profile) {
                throw new Error("Profile synchronization failed: No record returned after upsert");
            }

            // Map legacy User interface fields to Supabase profile fields
            const mappedUser: User = {
                id: profile.id,
                email: profile.email,
                username: profile.username || profile.email?.split('@')[0] || 'user',
                name: profile.full_name,
                image: profile.avatar_url,
                role: profile.role || 'User',
                status: profile.status || 'Active',
                rights: profile.rights || [],
                bankAccountCount: profile.bank_account_count || 0,
                creditCardCount: profile.credit_card_count || 0,
                createdAt: new Date(profile.created_at).getTime()
            };

            setUser(mappedUser);

            // Fetch user's companies from server (safe method)
            await fetchUserCompanies(profile.id);
        } catch (err: any) {
            console.error("[AUTH] Profile sync error:", err.message || err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserCompanies = async (userId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_company_access?user_id=eq.${userId}&select=company_id`,
                {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    }
                }
            );

            if (response.ok) {
                const companies: { company_id: string }[] = await response.json();
                
                // If user has no companies, they shouldn't see anyone else's data
                if (companies.length === 0) {
                    setCompanyIdState(null);
                    localStorage.removeItem('companyId');
                    return;
                }

                // If currently stored companyId is NOT in the user's access list, reset it
                const currentStored = localStorage.getItem('companyId');
                const hasAccess = companies.some(c => c.company_id === currentStored);

                if (!hasAccess || !currentStored) {
                    const firstCompany = companies[0].company_id;
                    setCompanyIdState(firstCompany);
                    localStorage.setItem('companyId', firstCompany);
                }
            } else {
                // If API fails, clear the state for security
                console.error("[AUTH] Failed to fetch user companies");
                setCompanyIdState(null);
                localStorage.removeItem('companyId');
            }
        } catch (err) {
            // Silently fail - user can select company manually
        }
    };

    useEffect(() => {
        const storedCompanyId = localStorage.getItem('companyId');
        // Simple UUID validation to avoid "invalid input syntax for type uuid" error
        const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        if (storedCompanyId && isUuid(storedCompanyId)) {
            setCompanyIdState(storedCompanyId);
        } else if (storedCompanyId) {
            console.warn("Invalid company ID in storage:", storedCompanyId);
            localStorage.removeItem('companyId');
        }
    }, []);

    const setCompanyId = React.useCallback((id: string | null) => {
        if (id) {
            setCompanyIdState(id);
            localStorage.setItem('companyId', id);
        } else {
            setCompanyIdState(null);
            localStorage.removeItem('companyId');
        }
    }, []);

    const logout = React.useCallback(async () => {
        // Clear local storage and state IMMEDIATELY and synchronously
        localStorage.removeItem('companyId');
        setCompanyIdState(null);
        setUser(null);
        lastSyncedUser.current = null;
        
        try {
            // Attempt to sign out of Supabase, but don't hang for more than 1s
            await Promise.race([
                supabase.auth.signOut(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Signout timeout')), 1000))
            ]);
        } catch (err) {
            console.warn("Sign out cleanup warning:", err);
        } finally {
            // Force a hard reload to clear all in-memory states and stale providers
            window.location.href = '/login';
        }
    }, []);

    const login = React.useCallback(() => {
        router.push('/login');
    }, [router]);

    const contextValue = React.useMemo(() => ({
        user,
        loading,
        login,
        logout,
        companyId,
        setCompanyId
    }), [user, loading, login, logout, companyId, setCompanyId]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
