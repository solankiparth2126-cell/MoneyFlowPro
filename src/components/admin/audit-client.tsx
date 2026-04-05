"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Loader2, Calendar, FileText, User, MoreVertical, Trash2, Bomb, AlertTriangle } from "lucide-react";
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
            toast({ title: "Audit Cleared", description: `Removed ${count} log entries.` });
            setShowLogConfirm(false);
        } catch (e: any) {
            toast({ variant: "destructive", title: "Error", description: e.message });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleNuclearWipe = async () => {
        if (resetCode !== "RESET") {
            toast({ variant: "destructive", title: "Validation Failed", description: "Please type 'RESET' to confirm." });
            return;
        }
        setIsDeleting(true);
        try {
            const count = await nuclearWipe();
            toast({ 
                title: "System Wiped", 
                description: `Successfully removed ${count} total records. System is now clean.`,
                className: "bg-red-50 border-red-200 text-red-900" 
            });
            setShowNuclearConfirm(false);
            setResetCode("");
            router.refresh();
        } catch (e: any) {
            toast({ variant: "destructive", title: "Error", description: e.message });
        } finally {
            setIsDeleting(false);
        }
    };

    const getActionColor = (action: string) => {
        const a = action.toUpperCase();
        if (a.includes('CREATE')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30';
        if (a.includes('UPDATE')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30';
        if (a.includes('DELETE')) return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30';
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800';
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };

    if (!currentUserProfile || !canView("ADMIN", "SYSTEM_AUDIT")) return null;

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 text-white">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">System Audit</h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Compliance & Security Log</p>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="rounded-xl border-gray-200 h-10 px-4 font-bold flex gap-2">
                            <MoreVertical className="h-4 w-4" />
                            System Tools
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-0 shadow-2xl dark:bg-gray-900 ring-1 ring-gray-100 dark:ring-gray-800">
                        <div className="px-2 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Administration</div>
                        <DropdownMenuItem 
                            onClick={() => setShowLogConfirm(true)}
                            className="rounded-xl h-10 px-3 cursor-pointer group"
                        >
                            <Trash2 className="mr-2 h-4 w-4 text-gray-400 group-hover:text-rose-500 transition-colors" />
                            <span className="font-bold text-xs">Clear Audit History</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => setShowNuclearConfirm(true)}
                            className="rounded-xl h-10 px-3 cursor-pointer group text-rose-600 dark:text-rose-400"
                        >
                            <Bomb className="mr-2 h-4 w-4 text-rose-600 dark:text-rose-400" />
                            <span className="font-bold text-xs font-black">Global System Wipe</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md ring-1 ring-gray-100 dark:bg-gray-900/80 dark:ring-gray-800 overflow-hidden rounded-[2rem]">
                <CardContent className="p-0">
                    {isLogsLoading ? (
                        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-indigo-500" /></div>
                    ) : logs.length === 0 ? (
                        <div className="p-16 text-center text-gray-500">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 inline-block rounded-2xl mb-4">
                                <ShieldAlert className="h-8 w-8 text-gray-300" />
                            </div>
                            <p className="font-bold">No security logs found.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                                <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4">Timestamp</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4">User</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4">Action</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4">Module</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log: any) => (
                                    <TableRow key={log.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors border-b border-gray-50 dark:border-gray-800">
                                        <TableCell className="text-[11px] font-mono text-gray-500">{new Date(log.timestamp).toLocaleString()}</TableCell>
                                        <TableCell className="font-black text-gray-900 dark:text-gray-100 text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] text-indigo-600">
                                                    {log.username?.charAt(0).toUpperCase()}
                                                </div>
                                                {log.username}
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge className={`rounded-lg border-0 px-2 py-0.5 font-bold text-[10px] tracking-tight ${getActionColor(log.action)}`}>{log.action}</Badge></TableCell>
                                        <TableCell className="text-xs font-bold text-gray-500 uppercase tracking-tighter">{log.module}</TableCell>
                                        <TableCell className="text-[11px] font-medium text-gray-600 dark:text-gray-400 max-w-sm truncate">{log.details}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Clear Logs Dialog */}
            <AlertDialog open={showLogConfirm} onOpenChange={setShowLogConfirm}>
                <AlertDialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-8">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <Trash2 className="h-6 w-6 text-rose-500" /> Clear Audit History?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 font-medium py-2">
                            This will permanently remove the history of all system actions. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="rounded-xl font-bold h-12">Keep Logs</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleClearLogs}
                            className="rounded-xl font-bold h-12 bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            {isDeleting ? "Clearing..." : "Yes, Purge Logs"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Nuclear Reset Dialog */}
            <AlertDialog open={showNuclearConfirm} onOpenChange={setShowNuclearConfirm}>
                <AlertDialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-8">
                    <AlertDialogHeader>
                        <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-3xl inline-block w-fit mb-4">
                            <AlertTriangle className="h-8 w-8 text-rose-600" />
                        </div>
                        <AlertDialogTitle className="text-3xl font-black tracking-tighter text-gray-900 dark:text-gray-100">
                            GLOBAL SYSTEM WIPE
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 dark:text-gray-400 font-bold space-y-4 py-2">
                            <p className="border-l-4 border-rose-500 pl-4 py-2 bg-rose-50/50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400">
                                DANGER: This will permanently delete ALL transactions, bank accounts, categories, and logs. This is a total factory reset.
                            </p>
                            <p>To confirm this nuclear action, please type <span className="text-indigo-600 dark:text-indigo-400 underline font-black">RESET</span> below:</p>
                            <Input 
                                value={resetCode}
                                onChange={e => setResetCode(e.target.value)}
                                placeholder="Type RESET here"
                                className="h-12 rounded-xl border-gray-200 focus:ring-rose-500 font-black text-center tracking-widest uppercase"
                            />
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 pt-4">
                        <AlertDialogCancel onClick={() => setResetCode("")} className="rounded-xl font-bold h-12 flex-1">Abort Reset</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                handleNuclearWipe();
                            }}
                            disabled={resetCode !== "RESET" || isDeleting}
                            className="rounded-xl font-bold h-12 bg-rose-600 hover:bg-rose-700 text-white flex-1"
                        >
                            {isDeleting ? "Wiping System..." : "CONFIRM WIPE"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}
