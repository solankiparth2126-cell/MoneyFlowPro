"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, PieChart, Pencil, Trash2, Loader2, Save, Search, TrendingUp, AlertCircle, CheckCircle2, Calendar, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import { useBudgets } from "@/hooks/use-budgets";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";

export function BudgetsClient() {
    const router = useRouter();
    const { toast } = useToast();
    const { canCreate, canDelete } = usePermissions();
    
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const { budgets, status: budgetStats, isLoading: isBudgetsLoading, create, remove } = useBudgets(month, year);
    const { categories, isLoading: isCategoriesLoading } = useCategories();
    
    const isLoading = isBudgetsLoading || isCategoriesLoading;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const [formData, setFormData] = useState({
        categoryId: 0,
        amount: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.categoryId) {
            toast({ title: "Error", description: "Please select a category", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            await create(formData);
            toast({ title: "Success", description: "Budget set successfully" });
            setIsDialogOpen(false);
            router.refresh();
        } catch (error) {
            toast({ title: "Error", description: "Failed to save budget", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: any) => {
        if (!confirm("Remove this budget?")) return;
        try {
            await remove({ id });
            toast({ title: "Success", description: "Budget removed" });
            router.refresh();
        } catch (error) {
            toast({ title: "Error", description: "Failed to remove budget", variant: "destructive" });
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    const handleDownloadStatement = () => {
        toast({ title: "Coming Soon", description: "Statement generation is being migrated to Convex." });
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
            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100/50">
              <PieChart className="h-7 w-7 text-indigo-600" />
            </div>
            Budget Control
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-semibold ml-1">
            Setting spending limits for active categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
            <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
              <SelectTrigger className="w-36 h-10 rounded-lg border-0 bg-transparent font-bold text-xs shadow-none focus:ring-0">
                <Calendar className="mr-2 h-4 w-4 text-indigo-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1">
                {months.map((m, i) => (
                  <SelectItem key={i} value={(i + 1).toString()} className="rounded-lg font-bold text-xs">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="w-[1px] h-4 bg-gray-100" />

            <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
              <SelectTrigger className="w-24 h-10 rounded-lg border-0 bg-transparent font-bold text-xs shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1">
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()} className="rounded-lg font-bold text-xs">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              {canCreate("CORE", "BUDGETS") && (
                <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 rounded-xl shadow-lg shadow-indigo-100 font-black uppercase tracking-widest text-[10px] transition-all">
                  <Plus className="mr-2 h-4 w-4" /> New Budget
                </Button>
              )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl bg-white">
              <div className="p-8 pb-4">
                <DialogHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                      <PieChart className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                        Set Budget
                      </DialogTitle>
                      <DialogDescription className="text-gray-500 text-xs font-semibold">
                        Define spending limit for a category.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Select Category</label>
                    <Select onValueChange={(v) => setFormData({ ...formData, categoryId: v as any })}>
                      <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-gray-600">
                        <SelectValue placeholder="Choose category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1 max-h-[240px]">
                        {categories.filter((c: any) => c.type === 'expense' || c.type === 'both').map((cat: any) => (
                          <SelectItem key={cat._id} value={cat._id} className="rounded-lg font-bold text-xs py-2">{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Budget Amount (₹)</label>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                      className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-gray-900 text-lg"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all font-black text-lg uppercase tracking-widest mt-2">
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : "Save Budget"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={handleDownloadStatement} className="h-12 px-6 rounded-xl border-gray-100 bg-white shadow-sm font-black uppercase tracking-widest text-[10px] text-gray-500 hover:bg-gray-50 transition-all flex gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Analyzing budgets...</p>
          </div>
        ) : budgetStats.length === 0 ? (
          <div className="col-span-full h-80 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center bg-white/50">
            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-50 mb-6">
              <TrendingUp className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 uppercase">No budgets setup</h3>
            <p className="text-gray-400 text-sm font-semibold max-w-[240px] text-center mt-2">Define your spending limits to start tracking.</p>
          </div>
        ) : (
          budgetStats.map((stat, idx) => {
            const isOverBudget = stat.spent > stat.amount;
            const isClose = !isOverBudget && stat.percentUsed > 80;

            return (
              <motion.div key={stat.id} variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}>
                <Card className="rounded-[2rem] border-gray-100 shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
                  <div className="p-8 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center font-black",
                          isOverBudget ? "bg-rose-50 text-rose-600" : isClose ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {stat.categoryName.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-black text-gray-900 uppercase tracking-tight">{stat.categoryName}</CardTitle>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">₹{stat.amount.toLocaleString()} Limit</span>
                        </div>
                      </div>
                      {canDelete("CORE", "BUDGETS") && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(stat.id)} className="h-9 w-9 rounded-xl text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="px-8 py-6 pt-0 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Spent So Far</span>
                          <span className="text-2xl font-black text-gray-900">₹{stat.spent.toLocaleString()}</span>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                          isOverBudget ? "bg-rose-50 text-rose-600" : isClose ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {stat.percentUsed.toFixed(0)}%
                        </div>
                      </div>
                      
                      <div className="relative h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                        <motion.div 
                          className={cn(
                            "absolute h-full left-0 top-0 rounded-full",
                            isOverBudget ? "bg-rose-500" : isClose ? "bg-amber-500" : "bg-emerald-500"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(stat.percentUsed, 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                       {isOverBudget ? (
                          <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[10px] uppercase tracking-wider">
                            <AlertCircle className="h-3 w-3" /> Overspent
                          </div>
                      ) : isClose ? (
                          <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] uppercase tracking-wider">
                            <AlertCircle className="h-3 w-3" /> Critical
                          </div>
                      ) : (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase tracking-wider">
                            <CheckCircle2 className="h-3 w-3" /> Safe
                          </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
