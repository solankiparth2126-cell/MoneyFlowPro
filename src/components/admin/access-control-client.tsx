"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Save, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useUsers } from "@/hooks/use-users";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";
import { Switch } from "@/components/ui/switch";

const SECTIONS = [
    { id: "CORE", title: "Core Features", pages: [{ id: "DASHBOARD", name: "Dashboard" }, { id: "TRANSACTIONS", name: "Transactions" }] },
    { id: "ADMIN", title: "Administration", pages: [{ id: "USER_MANAGEMENT", name: "Users" }] }
];

const ACTIONS = [{ id: "VIEW", name: "View" }, { id: "CREATE", name: "Create" }, { id: "EDIT", name: "Edit" }, { id: "DELETE", name: "Delete" }];

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
            await update({ id: selectedUserId, role: user.role, status: user.status || "Active", rights: Array.from(rightsMap) });
            toast({ title: "Permissions updated" });
        } catch (error) { toast({ variant: "destructive", title: "Failed" }); }
        finally { setIsSaving(false); }
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

    if (!currentUserProfile || !checkView("ADMIN", "ACCESS_CONTROL")) return null;

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            <h1 className="text-xl font-bold tracking-tight">Access Control</h1>
            <Card className="p-6">
                <Select value={selectedUserId} onValueChange={handleUserChange}>
                    <SelectTrigger className="w-full md:w-1/3"><SelectValue placeholder="Select User" /></SelectTrigger>
                    <SelectContent>
                        {users.map(u => <SelectItem key={u.id || ""} value={u.id || ""}>{u.username}</SelectItem>)}
                    </SelectContent>
                </Select>

                {isLoading ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>
                ) : !selectedUserId ? (
                    <div className="p-12 text-center text-gray-500"><ShieldAlert className="h-12 w-12 mx-auto mb-3" /> Select a user.</div>
                ) : (
                    <div className="space-y-6 mt-6">
                        {SECTIONS.map(s => (
                            <div key={s.id}>
                                <h3 className="text-sm font-bold uppercase mb-3">{s.title}</h3>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Page</TableHead>{ACTIONS.map(a => <TableHead key={a.id}>{a.name}</TableHead>)}</TableRow></TableHeader>
                                    <TableBody>
                                        {s.pages.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell>{p.name}</TableCell>
                                                {ACTIONS.map(a => (
                                                    <TableCell key={a.id}>
                                                        <Switch checked={rightsMap.has(`${s.id}_${p.id}_${a.id}`)} onCheckedChange={c => handleToggle(`${s.id}_${p.id}_${a.id}`, c)} />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
            {selectedUserId && (
                <div className="flex justify-end gap-3"><Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button></div>
            )}
        </motion.div>
    );
}
