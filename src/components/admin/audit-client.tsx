"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Loader2, Trash2, Bomb, AlertTriangle, MoreVertical, ShieldCheck, History } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useAuditLogs } from "@/hooks/use-audit";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuditClient() {
    const { user: currentUserProfile } = useAuth();
    const { canView } = usePermissions();
    const router = useRouter();
    const { toast } = useToast();
    const { logs, isLoading: isLogsLoading, deleteAllLogs, nuclearWipe } = useAuditLogs();

    const [isDeleting, setIsDeleting] = useState(false);
    const [showLogConfirm, setShowLogConfirm] = useState(false);
    const [showNuclearConfirm, setShowNuclearConfirm] = useState(false);
    const [resetCode, setResetCode] = useState("");

    useEffect(() => {
        if (currentUserProfile && !canView("ADMIN", "SYSTEM_AUDIT")) {
            router.replace("/");
        }
    }, [currentUserProfile, router, canView]);

    const handleClearLogs = async () => {
        setIsDeleting(true);
        try {
            const count = await deleteAllLogs();
            toast({ title: "Audit Synchronized", description: `Purged ${count} legacy entries.` });
            setShowLogConfirm(false);
        } catch (e: any) {
            toast({ variant: "destructive", title: "Operation Failed", description: e.message });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleNuclearWipe = async () => {
        if (resetCode !== "RESET") {
            toast({ variant: "destructive", title: "Identity Validation Failed", description: "Authorization code 'RESET' required." });
            return;
        }
        setIsDeleting(true);
        try {
            const count = await nuclearWipe();
            toast({ 
                title: "Global Wipe Executed", 
                description: `Purged ${count} records. Environment reset to factory default.`,
                className: "bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px]" 
            });
            setShowNuclearConfirm(false);
            setResetCode("");
            router.refresh();
        } catch (e: any) {
            toast({ variant: "destructive", title: "Wipe Interrupted", description: e.message });
        } finally {
            setIsDeleting(false);
        }
    };

    const getActionColor = (action: string) => {
        const a = action.toUpperCase();
        if (a.includes('CREATE')) return 'text-emerald-600 bg-emerald-50';
        if (a.includes('UPDATE')) return 'text-indigo-600 bg-indigo-50';
        if (a.includes('DELETE') || a.includes('WIPE')) return 'text-rose-600 bg-rose-50';
        return 'text-gray-400 bg-gray-50';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    if (!currentUserProfile || !canView("ADMIN", "SYSTEM_AUDIT")) return null;

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8 p-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div>
                   <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase leading-none">
                     Audit Trail
                   </h1>
                   <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-3 ml-1">
                     Security compliance & detailed system activity logs
                   </p>
                </div>

                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-10 rounded-xl px-6 border-gray-100 font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-gray-50 transition-all flex gap-2">
                                <MoreVertical className="h-3 w-3" />
                                Maintenance Options
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-3 rounded-2xl border-0 shadow-2xl bg-white ring-1 ring-gray-100">
                            <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Administrative Privileges</div>
                            <DropdownMenuItem 
                                onClick={() => setShowLogConfirm(true)}
                                className="rounded-xl h-11 px-3 cursor-pointer group hover:bg-rose-50 focus:bg-rose-50"
                            >
                                <Trash2 className="mr-3 h-4 w-4 text-gray-400 group-hover:text-rose-500 transition-colors" />
                                <span className="font-black text-[10px] uppercase tracking-widest text-gray-700 group-hover:text-rose-600">Clear Entry History</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => setShowNuclearConfirm(true)}
                                className="rounded-xl h-11 px-3 cursor-pointer group hover:bg-red-50 focus:bg-red-50 mt-1"
                            >
                                <Bomb className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-600 transition-colors" />
                                <span className="font-black text-[10px] uppercase tracking-widest text-red-600">Nuclear Factory Reset</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Card className="border-0 shadow-xl shadow-gray-200/20 rounded-[2.5rem] overflow-hidden bg-white">
                <CardContent className="p-0">
                    {isLogsLoading ? (
                        <div className="py-24 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="py-24 text-center">
                           <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-gray-100">
                                <History className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Vault Is Empty</h3>
                            <p className="text-[11px] text-gray-300 font-bold mt-2">No system activity has been recorded yet</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="hover:bg-transparent border-b border-gray-50">
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">Timestamp Reference</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">Subject Identity</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">Operation Type</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">Target Domain</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">Activity Metadata</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log: any) => (
                                    <TableRow key={log.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0 bg-transparent">
                                        <TableCell className="px-8 py-6">
                                            <span className="text-[11px] font-mono font-bold text-gray-400 group-hover:text-indigo-600 transition-colors">
                                                {new Date(log.timestamp).toLocaleString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 border border-indigo-100 group-hover:scale-110 transition-all">
                                                    {log.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-black text-gray-900 uppercase tracking-tight text-xs">{log.username}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-8 py-6">
                                            <Badge className={cn(
                                                "border-0 px-3 py-1 font-black text-[9px] uppercase tracking-widest",
                                                getActionColor(log.action)
                                            )}>
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-8 py-6">
                                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-gray-100 px-2.5 py-1">
                                                {log.module}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-8 py-6">
                                            <p className="text-[11px] font-bold text-gray-600 max-w-sm truncate group-hover:text-gray-900 transition-colors">
                                                {log.details}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={showLogConfirm} onOpenChange={setShowLogConfirm}>
                <AlertDialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-10">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-5 mb-4">
                            <div className="h-14 w-14 bg-rose-50 rounded-[1.5rem] flex items-center justify-center text-rose-500 border border-rose-100">
                                <Trash2 className="h-6 w-6" />
                            </div>
                            <div>
                                <AlertDialogTitle className="text-2xl font-black tracking-tight text-gray-900 uppercase">Purge Entry History?</AlertDialogTitle>
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mt-1">Irreversible Data Erasure</p>
                            </div>
                        </div>
                        <AlertDialogDescription className="text-gray-500 font-bold text-sm leading-relaxed">
                            This operation will permanently remove the chronological history of all system actions. Compliance data will be lost forever.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 mt-8">
                        <AlertDialogCancel className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] flex-1 hover:bg-gray-50">Abort Operation</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleClearLogs}
                            className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] bg-rose-600 hover:bg-rose-700 text-white flex-1 shadow-lg shadow-rose-100"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Purge"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showNuclearConfirm} onOpenChange={setShowNuclearConfirm}>
                <AlertDialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-10 max-w-lg">
                    <AlertDialogHeader>
                        <div className="h-20 w-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-600 border border-red-100 mx-auto mb-6 animate-pulse">
                            <AlertTriangle className="h-10 w-10" />
                        </div>
                        <AlertDialogTitle className="text-3xl font-black tracking-tighter text-center text-red-600 uppercase">
                            GLOBAL RESET PROTOCOL
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-6 pt-4">
                            <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
                                <p className="text-xs font-black text-red-700 leading-relaxed uppercase tracking-tight">
                                    DANGER: This action will permanently erase all transactions, banking connections, saved categories, and system logs. The environment will be reset to a clean state.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Authorize wipe by typing the access code below:</p>
                                <div className="text-center">
                                    <span className="text-xl font-black text-indigo-600 tracking-[0.5em] opacity-80">RESET</span>
                                </div>
                                <Input 
                                    value={resetCode}
                                    onChange={e => setResetCode(e.target.value)}
                                    placeholder="Type access code here"
                                    className="h-14 rounded-2xl border-gray-100 focus:ring-red-600/10 focus:border-red-600 font-black text-center tracking-[0.2em] uppercase text-lg shadow-inner bg-gray-50/50"
                                />
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 pt-6">
                        <AlertDialogCancel onClick={() => setResetCode("")} className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] flex-1 hover:bg-gray-50 transition-all border-gray-100">Cancel Protocol</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                handleNuclearWipe();
                            }}
                            disabled={resetCode !== "RESET" || isDeleting}
                            className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-red-600 hover:bg-red-700 text-white flex-1 shadow-2xl shadow-red-200 transition-all active:scale-[0.98]"
                        >
                            {isDeleting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Total Wipe"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}
