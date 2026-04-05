"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Trash2, Edit2, Key, Loader2, ShieldCheck, Mail, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useUsers } from "@/hooks/use-users";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";

export function UsersClient() {
    const { user: currentUserProfile } = useAuth();
    const { canView } = usePermissions();
    const router = useRouter();
    const { toast } = useToast();

    const { users, isLoading: isUsersLoading, update, remove, resetPassword } = useUsers();
    
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [editForm, setEditForm] = useState<any>({ 
        username: "", role: "", status: "Active"
    });

    const [isResetOpen, setIsResetOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    if (!currentUserProfile || !canView("ADMIN", "USER_MANAGEMENT")) return null;

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8 p-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div>
                   <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase leading-none">
                     User Management
                   </h1>
                   <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-3 ml-1">
                     Manage system users, roles and permissions
                   </p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 h-10 rounded-xl px-6 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]">
                    <UserPlus className="w-3 h-3 mr-2" />
                    Invite User
                </Button>
            </div>

            <Card className="border-0 shadow-xl shadow-gray-200/20 rounded-[2.5rem] overflow-hidden bg-white">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent border-b border-gray-50">
                                <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">User Profile</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">Access Level</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">Status</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8 text-right">Operations</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isUsersLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-24 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
                                    </TableCell>
                                </TableRow>
                            ) : users.map((u: any) => (
                                <TableRow key={u.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                    <TableCell className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-11 w-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-all border border-indigo-100">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 uppercase tracking-tight text-sm">{u.username}</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{u.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 py-6">
                                        <Badge className="bg-white text-indigo-600 border border-indigo-100 font-black uppercase text-[9px] tracking-widest px-2.5 py-1">
                                            {u.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-8 py-6">
                                        <Badge variant="outline" className={cn(
                                            "font-black uppercase text-[9px] tracking-widest px-2.5 py-1 transition-colors border-0",
                                            u.status === 'Active' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-50'
                                        )}>
                                            {u.status || 'Active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right px-8 py-6">
                                        <div className="flex justify-end gap-2 text-gray-400">
                                            <Button size="icon" variant="ghost" onClick={() => { setSelectedUser(u); setEditForm({ ...u }); setIsEditOpen(true); }} className="h-9 w-9 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-all"><Edit2 className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => { setSelectedUser(u); setIsResetOpen(true); }} className="h-9 w-9 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-all"><Key className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => remove({ id: u.id })} className="h-9 w-9 rounded-xl hover:text-rose-600 hover:bg-rose-50 transition-all"><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <DialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-8">
                    <form onSubmit={handleResetPassword}>
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                    <Key className="h-6 w-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 uppercase">Reset Password</DialogTitle>
                                    <DialogDescription className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                                        Security Account Update
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="space-y-6 py-8">
                            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                <p className="text-xs font-bold text-gray-600 leading-relaxed">
                                    You are updating the secure access for <span className="text-indigo-600 font-black">{selectedUser?.username}</span>.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="new-password" title="Enter New Password" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">New Secure Password</Label>
                                <Input 
                                    id="new-password"
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:border-indigo-600 focus:ring-indigo-600/10 font-bold px-4"
                                    required
                                    minLength={6}
                                />
                                <div className="flex items-center gap-2 text-gray-400 ml-1">
                                    <ShieldCheck className="w-3 h-3" />
                                    <p className="text-[9px] uppercase tracking-widest font-black">Minimum 6 characters / High Entropy recommended</p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsResetOpen(false)} className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 flex-1">Abort</Button>
                            <Button type="submit" disabled={isSubmitting} className="h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl px-10 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-200 transition-all flex-1">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-8">
                    <form onSubmit={handleUpdateUser}>
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                    <Edit2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 uppercase">Edit User</DialogTitle>
                                    <DialogDescription className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                                        Update Profile Metadata
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="space-y-6 py-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Username (Immutable)</Label>
                                <Input value={editForm.username} disabled className="h-12 rounded-xl border-gray-100 bg-gray-100 opacity-60 font-bold px-4" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Role Allocation</Label>
                                    <Select value={editForm.role} onValueChange={(val) => setEditForm({ ...editForm, role: val })}>
                                        <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/30 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
                                            <SelectItem value="Admin">Admin</SelectItem>
                                            <SelectItem value="User">User</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Operational Status</Label>
                                    <Select value={editForm.status} onValueChange={(val) => setEditForm({ ...editForm, status: val })}>
                                        <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/30 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Disabled">Disabled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 flex-1">Cancel</Button>
                            <Button type="submit" disabled={isSubmitting} className="h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl px-10 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-200 transition-all flex-1">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
