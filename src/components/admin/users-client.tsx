"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Shield, Mail, Calendar, MoreVertical, Trash2, Edit2, ShieldCheck, UserX, Activity, Key, Loader2, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useUsers } from "@/hooks/use-users";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { usePermissions } from "@/hooks/use-permissions";

const AVAILABLE_RIGHTS = [
    { id: "CORE_TRANSACTIONS_VIEW", label: "View Transactions" },
    { id: "CORE_TRANSACTIONS_CREATE", label: "Create Transactions" },
    { id: "CORE_TRANSACTIONS_EDIT", label: "Edit Transactions" },
    { id: "CORE_TRANSACTIONS_DELETE", label: "Delete Transactions" },
    { id: "CORE_LEDGERS_VIEW", label: "View Ledgers" },
    { id: "CORE_LEDGERS_CREATE", label: "Create Ledgers" },
    { id: "CORE_LEDGERS_EDIT", label: "Edit Ledgers" },
    { id: "CORE_LEDGERS_DELETE", label: "Delete Ledgers" },
    { id: "VIEW_REPORTS", label: "View Reports" },
];

export function UsersClient() {
    const { user: currentUserProfile } = useAuth();
    const { canView, canCreate, canEdit, canDelete } = usePermissions();
    const router = useRouter();
    const { toast } = useToast();

    const { users, isLoading: isUsersLoading, update, remove, resetPassword } = useUsers();
    
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [editForm, setEditForm] = useState<any>({ 
        username: "", role: "", status: "Active", rights: [], bankAccountCount: 0, creditCardCount: 0 
    });

    const [isResetOpen, setIsResetOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ 
        username: "", email: "", password: "", role: "User", bankAccountCount: 0, creditCardCount: 0
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (currentUserProfile && !canView("ADMIN", "USER_MANAGEMENT")) {
            router.replace("/");
        }
    }, [currentUserProfile, router, canView]);

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setIsSubmitting(true);
        try {
            await update({ id: selectedUser.id, ...editForm });
            toast({ title: "User updated" });
            setIsEditOpen(false);
        } catch (error) { toast({ variant: "destructive", title: "Failed" }); }
        finally { setIsSubmitting(false); }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !newPassword) return;
        setIsSubmitting(true);
        try {
            await resetPassword({ id: selectedUser.id, password: newPassword });
            toast({ title: "Password updated successfully" });
            setIsResetOpen(false);
            setNewPassword("");
        } catch (error: any) {
            toast({ variant: "destructive", title: "Reset failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentUserProfile || !canView("ADMIN", "USER_MANAGEMENT")) return null;

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8 p-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-xl font-bold tracking-tight">User Management</h1>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-rose-600 h-9 font-bold">Invite User</Button>
            </div>

            <Card className="border-0 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {isUsersLoading ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-10">Loading...</TableCell></TableRow>
                            ) : users.map((u: any) => (
                                <TableRow key={u.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{u.username}</p>
                                                <p className="text-xs text-muted-foreground">{u.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="secondary" className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-100">{u.role}</Badge></TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={u.status === 'Active' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-gray-500'}>
                                            {u.status || 'Active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 text-rose-500">
                                            <Button size="icon" variant="ghost" onClick={() => { setSelectedUser(u); setEditForm({ ...u }); setIsEditOpen(true); }} className="hover:text-rose-600 hover:bg-rose-50"><Edit2 className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => { setSelectedUser(u); setIsResetOpen(true); }} className="hover:text-rose-600 hover:bg-rose-50"><Key className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => remove({ id: u.id })} className="hover:text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <DialogContent className="rounded-2xl">
                    <form onSubmit={handleResetPassword}>
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                                    <Key className="h-5 w-5" />
                                </div>
                                <DialogTitle className="text-xl font-bold">Reset Password</DialogTitle>
                            </div>
                            <DialogDescription>
                                Set a new password for <span className="font-bold text-rose-600">{selectedUser?.username}</span> ({selectedUser?.email}).
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-8">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input 
                                    id="new-password"
                                    type="password" 
                                    placeholder="Enter new secure password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="focus:ring-2 focus:ring-rose-500/20"
                                    required
                                    minLength={6}
                                />
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Minimum 6 characters required</p>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="ghost" onClick={() => setIsResetOpen(false)} className="rounded-xl">Cancel</Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700 rounded-xl px-8 font-bold">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Now"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <form onSubmit={handleUpdateUser}>
                        <DialogHeader>
                            <DialogTitle>Edit User Profile</DialogTitle>
                            <DialogDescription>
                                Manage account details, roles, and system permissions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Input value={editForm.username} disabled />
                        </div>
                        <DialogFooter><Button type="submit" disabled={isSubmitting}>Save</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
