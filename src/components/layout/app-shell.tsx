"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { UserNav } from "@/components/user-nav";
import { useAuth } from "@/context/auth-context";
import { CompanySelector } from "@/components/company-selector";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, companyId, loading } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const isAuthPage = pathname === "/login" || pathname === "/register";

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!loading && mounted) {
            if (!user && !isAuthPage) {
                router.replace("/login");
            } else if (user && isAuthPage) {
                router.replace("/");
            }
        }
    }, [user, loading, isAuthPage, router, mounted]);

    // 1. First-pass: Prevent hydration mismatch
    if (!mounted) {
        return <div className="h-screen w-full bg-background" />;
    }

    // 2. Auth Loading & Redirects
    // We only show a blank screen during initial redirect logic to prevent flashes
    if (loading || (!user && !isAuthPage)) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }


    // Auth Pages: Login/Register
    if (isAuthPage) {
        if (user) {
            return (
                <div className="h-screen w-full flex items-center justify-center bg-background">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                </div>
            );
        }
        return <main className="h-screen w-full overflow-hidden">{children}</main>;
    }

    // Missing Company: Show Selector
    // We only show the selector if we're CERTAIN there's no companyId after fully loading
    if (!companyId) {
        return (
            <div className="h-screen w-full bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950 dark:to-gray-950 overflow-hidden flex items-center justify-center">
                <CompanySelector />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden font-body relative">
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-indigo-950/20 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <AppSidebar 
                isExpanded={isSidebarExpanded} 
                isMobileOpen={isMobileMenuOpen}
                toggle={() => setIsSidebarExpanded(!isSidebarExpanded)} 
                closeMobile={() => setIsMobileMenuOpen(false)}
            />

            <div className="flex flex-col flex-1 min-w-0 h-full relative">
                <header className="flex h-12 shrink-0 items-center justify-between px-3 lg:px-6 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-30">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 lg:hidden text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
                        </button>
                        <h2 className="text-[10px] lg:text-xs font-black text-gray-400 uppercase tracking-[0.25em] lg:tracking-[0.4em] truncate">MoneyFlow Pro</h2>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <ThemeToggle />
                        <UserNav />
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-2 lg:p-4 bg-gray-50/30 dark:bg-gray-950/30">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                        className="max-w-[2000px] mx-auto w-full min-h-full"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            {/* Floating Watermark */}
            <div className="fixed bottom-4 right-4 pointer-events-none z-50 opacity-100 transition-opacity duration-500 hidden sm:block">
                <div className="bg-white shadow-md backdrop-blur-md border border-indigo-100 px-3 py-1.5 rounded-full flex items-center gap-2 ring-1 ring-indigo-500/10">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[8px] text-white font-black shadow-sm">
                        P
                    </div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.15em] whitespace-nowrap">
                        Created By <span className="text-indigo-600">Parth Solanki</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
