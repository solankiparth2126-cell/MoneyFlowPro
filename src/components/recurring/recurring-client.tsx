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
import { cn } from "@/lib/utils";

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
      className="container mx-auto py-8 px-6 max-w-7xl space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3 uppercase">
            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100/50 text-indigo-600">
              <Clock className="h-7 w-7" />
            </div>
            Auto Finances
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-semibold ml-1">
            Manage your recurring bills and regular income.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            {canCreate("CORE", "RECURRING") && (
              <Button onClick={() => handleOpenDialog()} className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 rounded-xl shadow-lg shadow-indigo-100 font-black uppercase tracking-widest text-[10px] gap-2 transition-all">
                <Plus className="mr-2 h-4 w-4" /> New Schedule
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl bg-white">
            <div className="p-8 pb-4">
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                    <Clock className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                      {editingSchedule ? "Edit Schedule" : "New Schedule"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 text-xs font-semibold">
                      Set up automated transaction flow.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-gray-900"
                    placeholder="e.g. Monthly Rent"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Amount (₹)</label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-gray-900"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Type</label>
                    <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                        <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-gray-600 uppercase text-[10px] tracking-widest">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1">
                            <SelectItem value="expense" className="rounded-lg font-bold text-xs">Expense</SelectItem>
                            <SelectItem value="income" className="rounded-lg font-bold text-xs">Income</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Interval</label>
                  <Select value={formData.interval} onValueChange={(v: any) => setFormData({ ...formData, interval: v })}>
                    <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-gray-600 uppercase text-[10px] tracking-widest">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1">
                      <SelectItem value="monthly" className="rounded-lg font-bold text-xs">Monthly</SelectItem>
                      <SelectItem value="yearly" className="rounded-lg font-bold text-xs">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Account</label>
                  <Select value={formData.ledgerId} onValueChange={(v: any) => setFormData({ ...formData, ledgerId: v })}>
                    <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-gray-600 text-xs">
                      <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1 max-h-[200px]">
                      <SelectItem value="none" className="rounded-lg font-bold text-xs">Default Account</SelectItem>
                      {ledgers.map((l: any) => (
                        <SelectItem key={l._id} value={l._id} className="rounded-lg font-bold text-xs">{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all font-black text-lg uppercase tracking-widest mt-2">
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : (editingSchedule ? "Update Schedule" : "Schedule Now")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-gray-100 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Syncing schedules...</p>
          </div>
        ) : recurring.length === 0 ? (
          <div className="col-span-full h-80 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center bg-white/50">
            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-50 mb-6">
              <Activity className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 uppercase">No active schedules</h3>
            <p className="text-gray-400 text-sm font-semibold max-w-[240px] text-center mt-2">Automate your regular expenses and incoming funds.</p>
          </div>
        ) : (
          <AnimatePresence>
            {recurring.map((item: any, idx: number) => (
              <motion.div key={item._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className={cn(
                  "group border-gray-100 shadow-sm rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-xl bg-white relative",
                  !item.isActive && "opacity-60 grayscale-[0.5]"
                )}>
                  <div className="p-8">
                    <header className="flex justify-between items-start mb-6">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center border",
                        item.type === 'income' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                      )}>
                        {item.type === 'income' ? <ArrowUpCircle className="h-7 w-7" /> : <ArrowDownCircle className="h-7 w-7" />}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={cn(
                          "rounded-lg font-black uppercase tracking-widest text-[9px] px-2.5 py-1 border-0",
                          item.isActive ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400"
                        )}>
                          {item.isActive ? 'Active' : 'Paused'}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-gray-100 shadow-2xl p-1">
                            {canEdit("CORE", "RECURRING") && (
                              <DropdownMenuItem onClick={() => handleOpenDialog(item)} className="rounded-lg font-bold text-xs">
                                <Pencil className="mr-2 h-4 w-4 text-indigo-500" /> Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete("CORE", "RECURRING") && (
                              <DropdownMenuItem onClick={() => remove(item._id)} className="rounded-lg font-bold text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </header>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-tight">{item.description}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{item.interval}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Next Run: {item.nextRunDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Amount</span>
                          <span className={cn(
                            "text-2xl font-black leading-none",
                            item.type === 'income' ? "text-emerald-500" : "text-rose-500"
                          )}>
                            ₹{(item.amount || 0).toLocaleString()}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          onClick={() => toggleStatus(item)} 
                          className={cn(
                            "rounded-xl h-10 px-4 font-black uppercase tracking-widest text-[9px] transition-all",
                            item.isActive ? "text-amber-500 hover:bg-amber-50 hover:text-amber-600" : "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
                          )}
                        >
                          {item.isActive ? 'Pause' : 'Resume'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
