"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Save, Loader2, ShieldCheck, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useUsers } from "@/hooks/use-users";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SECTIONS = [
    { 
        id: "CORE", 
        title: "Standard Platform Modules", 
        pages: [
            { id: "DASHBOARD", name: "Dashboard Analytics" }, 
            { id: "TRANSACTIONS", name: "Transactions Ledger" },
            { id: "LEDGERS", name: "Account Ledgers" },
            { id: "CATEGORIES", name: "Expense Categories" },
            { id: "BUDGETS", name: "Budget Planning" },
            { id: "GOALS", name: "Savings Goals" }
        ] 
    },
    { 
        id: "ADMIN", 
        title: "System Administration", 
        pages: [
            { id: "USER_MANAGEMENT", name: "User Management" },
            { id: "ACCESS_CONTROL", name: "Access Control" },
            { id: "AUDIT_LOGS", name: "Audit Trail" }
        ] 
    }
];

const ACTIONS = [
    { id: "VIEW", name: "Read" }, 
    { id: "CREATE", name: "Create" }, 
    { id: "EDIT", name: "Update" }, 
    { id: "DELETE", name: "Delete" }
];

export function AccessControlClient() {
    const { user: currentUserProfile } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { users, isLoading, update } = useUsers();
    const { canView: checkView } = usePermissions();
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [rightsMap, setRightsMap] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (currentUserProfile && !checkView("ADMIN", "ACCESS_CONTROL")) {
            router.replace("/");
        }
    }, [currentUserProfile, router, checkView]);

    const handleUserChange = (userId: string) => {
        setSelectedUserId(userId);
        const user = users.find(u => u.id === userId);
        setRightsMap(new Set(user?.rights || []));
    };

    const handleToggle = (rightString: string, checked: boolean) => {
        setRightsMap(prev => {
            const next = new Set(prev);
            if (checked) next.add(rightString);
            else next.delete(rightString);
            return next;
        });
    };

    const handleSave = async () => {
        if (!selectedUserId) return;
        const user = users.find(u => u.id === selectedUserId);
        if (!user) return;
        try {
            setIsSaving(true);
            await update({ 
                id: selectedUserId, 
                role: user.role, 
                status: user.status || "Active", 
                rights: Array.from(rightsMap) 
            });
            toast({ title: "Permissions synchronized successfully" });
        } catch (error) { 
            toast({ variant: "destructive", title: "Synchronization failed" }); 
        } finally { 
            setIsSaving(false); 
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    if (!currentUserProfile || !checkView("ADMIN", "ACCESS_CONTROL")) return null;

    const selectedUser = users.find(u => u.id === selectedUserId);

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8 p-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div>
                   <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase leading-none">
                     Access Control
                   </h1>
                   <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-3 ml-1">
                     Configure granular system permissions per user
                   </p>
                </div>
            </div>

            <Card className="border-0 shadow-xl shadow-gray-200/20 rounded-[2.5rem] overflow-hidden bg-white">
                <CardContent className="p-8">
                    <div className="max-w-md">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">Reference User Identity</Label>
                        <Select value={selectedUserId} onValueChange={handleUserChange}>
                            <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/30 font-bold px-4">
                                <SelectValue placeholder="Select a user to configure..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
                                {users.map(u => (
                                    <SelectItem key={u.id} value={u.id || ""}>
                                        <div className="flex flex-col py-0.5">
                                            <span className="font-bold text-gray-900">{u.username}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">{u.email}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="py-24 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
                        </div>
                    ) : !selectedUserId ? (
                        <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-indigo-100/50">
                                <ShieldAlert className="h-8 w-8 text-indigo-300" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Awaiting User Selection</h3>
                            <p className="text-[11px] text-gray-300 font-bold mt-2">Pick a user above to begin permission configuration</p>
                        </div>
                    ) : (
                        <div className="space-y-12 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100/50 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mb-0.5">Configuring Access For</p>
                                    <p className="text-lg font-black text-emerald-900 uppercase leading-none">{selectedUser?.username}</p>
                                </div>
                            </div>

                            {SECTIONS.map(s => (
                                <div key={s.id} className="space-y-6">
                                    <div className="flex items-center gap-3 ml-2">
                                        <div className="h-8 w-1 bg-indigo-600 rounded-full" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">{s.title}</h3>
                                    </div>
                                    
                                    <div className="border border-gray-100 rounded-[2.5rem] overflow-hidden bg-gray-50/20">
                                        <Table>
                                            <TableHeader className="bg-white">
                                                <TableRow className="hover:bg-transparent border-b border-gray-100">
                                                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-10 w-1/3">Target Module</TableHead>
                                                    {ACTIONS.map(a => (
                                                        <TableHead key={a.id} className="font-black text-[10px] uppercase tracking-widest py-6 px-4 text-center">{a.name}</TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {s.pages.map(p => (
                                                    <TableRow key={p.id} className="hover:bg-white transition-all border-b border-gray-50 last:border-0 bg-transparent group">
                                                        <TableCell className="px-10 py-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-indigo-400 transition-colors" />
                                                                <span className="font-bold text-gray-700 text-sm group-hover:text-gray-900 transition-colors uppercase tracking-tight">{p.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        {ACTIONS.map(a => (
                                                            <TableCell key={a.id} className="text-center py-6">
                                                                <Switch 
                                                                    checked={rightsMap.has(`${s.id}_${p.id}_${a.id}`)} 
                                                                    onCheckedChange={c => handleToggle(`${s.id}_${p.id}_${a.id}`, c)}
                                                                    className="data-[state=checked]:bg-indigo-600 scale-90"
                                                                />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedUserId && (
                <div className="flex justify-end pt-4 px-1">
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        className="bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl px-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] group"
                    >
                        {isSaving ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-3" />
                        ) : (
                            <Save className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        )}
                        {isSaving ? "Synchronizing..." : "Update Security Policy"}
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
