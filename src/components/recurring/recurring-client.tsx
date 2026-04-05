"use client";

import { useState } from "react";
import { Plus, Clock, Pencil, Trash2, Loader2, Calendar, Wallet, ArrowUpCircle, ArrowDownCircle, Activity, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRecurring, RecurringTransaction } from "@/hooks/use-recurring";
import { useLedgers } from "@/hooks/use-ledgers";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";

export function RecurringClient() {
    const { toast } = useToast();
    const { canCreate, canEdit, canDelete } = usePermissions();
    const { recurring, isLoading, create, update, remove } = useRecurring();
    const { ledgers } = useLedgers();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({
        description: "",
        amount: 0,
        type: "expense",
        category: "Subscription",
        paymentMethod: "bank",
        interval: "monthly",
        dayOfInterval: 1,
        isActive: true,
        ledgerId: "none"
    });

    const handleOpenDialog = (schedule: any | null = null) => {
        if (schedule) {
            setEditingSchedule(schedule);
            setFormData({
                description: schedule.description,
                amount: schedule.amount,
                type: schedule.type,
                category: schedule.category,
                paymentMethod: schedule.paymentMethod,
                interval: schedule.interval,
                dayOfInterval: schedule.dayOfInterval,
                isActive: schedule.isActive,
                ledgerId: schedule.ledgerId || "none"
            });
        } else {
            setEditingSchedule(null);
            setFormData({
                description: "",
                amount: 0,
                type: "expense",
                category: "Subscription",
                paymentMethod: "bank",
                interval: "monthly",
                dayOfInterval: 1,
                isActive: true,
                ledgerId: "none"
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingSchedule) {
                await update(editingSchedule._id, {
                    ...formData,
                    ledgerId: formData.ledgerId === "none" ? undefined : formData.ledgerId
                });
                toast({ title: "Success", description: "Schedule updated" });
            } else {
                const nextRunDate = new Date();
                if (formData.dayOfInterval) {
                    nextRunDate.setDate(formData.dayOfInterval);
                    if (nextRunDate < new Date()) {
                        nextRunDate.setMonth(nextRunDate.getMonth() + (formData.interval === 'yearly' ? 12 : 1));
                    }
                }

                await create({
                    ...formData,
                    nextRunDate: nextRunDate.toISOString().split('T')[0],
                    ledgerId: formData.ledgerId === "none" ? undefined : formData.ledgerId
                });
                toast({ title: "Success", description: "Recurring transaction scheduled" });
            }
            setIsDialogOpen(false);
            setEditingSchedule(null);
        } catch (error) {
            toast({ title: "Error", description: "Failed to save schedule", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async (rt: any) => {
        try {
            await update(rt._id, { isActive: !rt.isActive });
            toast({ title: "Updated", description: `Schedule ${rt.isActive ? 'paused' : 'activated'}` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="container mx-auto py-2 px-2 max-w-7xl space-y-4"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div>
                    <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2 leading-none">
                        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                            <Clock className="h-5 w-5" />
                        </div>
                        Automated Finances
                    </h1>
                    <p className="text-muted-foreground mt-1 text-[11px] font-medium leading-none">
                        Manage your recurring bills and regular income.
                    </p>
                </motion.div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                    {canCreate("CORE", "RECURRING") && (
                        <Button size="sm" onClick={() => handleOpenDialog()} className="bg-indigo-600 hover:bg-indigo-700 h-9 px-4 rounded-xl shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Add Schedule
                        </Button>
                    )}
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSchedule ? "Edit Recurring Schedule" : "Add Recurring Schedule"}</DialogTitle>
                            <DialogDescription>
                                Set up an automated income or expense schedule.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Description"
                                required
                            />
                            <Input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                placeholder="Amount"
                                required
                            />
                            <Select value={formData.interval} onValueChange={(v: any) => setFormData({ ...formData, interval: v })}>
                                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={formData.ledgerId} onValueChange={(v: any) => setFormData({ ...formData, ledgerId: v })}>
                                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select Account" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Default Account</SelectItem>
                                    {ledgers.map((l: any) => (
                                        <SelectItem key={l._id} value={l._id}>{l.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-indigo-600 rounded-xl">
                                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : (editingSchedule ? "Save Changes" : "Schedule Transaction")}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                        <p>Syncing schedules...</p>
                    </div>
                ) : recurring.length === 0 ? (
                    <div className="col-span-full border-2 border-dashed rounded-[2.5rem] py-24 text-center">
                        <Activity className="h-16 w-16 mx-auto mb-6 text-indigo-200" />
                        <h3 className="text-2xl font-bold">No automated transactions yet</h3>
                    </div>
                ) : (
                    <AnimatePresence>
                        {recurring.map((item: any, idx: number) => (
                            <motion.div key={item._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                <Card className={`group border-0 shadow-xl rounded-[2rem] overflow-hidden transition-all hover:-translate-y-1 ${item.isActive ? 'bg-white' : 'bg-gray-50'}`}>
                                    <CardHeader className="p-6 pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                {item.type === 'income' ? <ArrowUpCircle className="h-6 w-6 text-emerald-500" /> : <ArrowDownCircle className="h-6 w-6 text-rose-500" />}
                                            </div>
                                            <Badge variant={item.isActive ? "default" : "secondary"}>{item.isActive ? 'Active' : 'Paused'}</Badge>
                                            <div className="flex gap-1 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600"><MoreVertical className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {canEdit("CORE", "RECURRING") && (
                                                            <DropdownMenuItem onClick={() => handleOpenDialog(item)}>
                                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canDelete("CORE", "RECURRING") && (
                                                            <DropdownMenuItem onClick={() => remove(item._id)} className="text-red-600">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <CardTitle className="mt-4 text-xl font-bold">{item.description}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-4">
                                        <div className="flex items-end justify-between">
                                            <span className={`text-2xl font-black ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                ₹{(item.amount || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <Button variant="outline" onClick={() => toggleStatus(item)} className="w-full mt-6 rounded-2xl">
                                            {item.isActive ? 'Pause' : 'Resume'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}
