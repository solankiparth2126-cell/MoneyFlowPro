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
            className="container mx-auto py-2 px-2 max-w-7xl space-y-4"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2 leading-none">
                        <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600">
                            <PieChart className="h-5 w-5" />
                        </div>
                        Budget Planning
                    </h1>
                    <p className="text-muted-foreground mt-1 text-[11px] font-medium leading-none">
                        Define spending limits for your categories and stay on track.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                        <SelectTrigger className="w-32 h-9 rounded-xl shadow-sm">
                            <Calendar className="mr-2 h-3.5 w-3.5 text-indigo-500" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((m, i) => (
                                <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                        <SelectTrigger className="w-24 h-9 rounded-xl shadow-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="sm" onClick={handleDownloadStatement} className="h-9 rounded-xl">
                        <Download className="mr-2 h-3.5 w-3.5" /> Statement
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            {canCreate("CORE", "BUDGETS") && (
                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-9 px-4 rounded-xl">
                                    <Plus className="mr-2 h-4 w-4" /> Set Budget
                                </Button>
                            )}
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Set New Budget Limit</DialogTitle>
                                <DialogDescription>
                                    Define a spending limit for a specific category.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                                <Select onValueChange={(v) => setFormData({ ...formData, categoryId: v as any })}>
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue placeholder="Choose category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.filter((c: any) => c.type === 'expense' || c.type === 'both').map((cat: any) => (
                                            <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                    className="h-12 rounded-xl text-lg font-bold"
                                    placeholder="₹ 0.00"
                                />
                                <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-indigo-600 rounded-xl">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Set Budget Limit"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {isLoading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                        <p>Calculating utilization...</p>
                    </div>
                ) : budgetStats.length === 0 ? (
                    <div className="col-span-full border-2 border-dashed rounded-3xl py-20 text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-bold">No budgets defined</h3>
                    </div>
                ) : (
                    budgetStats.map((stat, idx) => {
                        const isOverBudget = stat.spent > stat.amount;
                        const isClose = !isOverBudget && stat.percentUsed > 80;

                        return (
                            <motion.div key={stat.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                                <Card className={`rounded-3xl overflow-hidden ring-1 transition-all ${isOverBudget ? 'ring-rose-200 bg-rose-50/20' : isClose ? 'ring-amber-200 bg-amber-50/20' : 'ring-gray-100 bg-white'}`}>
                                    <CardHeader className="p-6 pb-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-xl font-bold">{stat.categoryName}</CardTitle>
                                                <CardDescription>Budget: ₹{stat.amount.toLocaleString()}</CardDescription>
                                            </div>
                                            {canDelete("CORE", "BUDGETS") && (
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(stat.id)} className="h-8 w-8 rounded-full">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-2">
                                        <div className="mt-4 space-y-4">
                                            <div className="flex items-center justify-between text-sm font-medium">
                                                <span>Spent: ₹{stat.spent.toLocaleString()}</span>
                                                <span className={isOverBudget ? 'text-rose-600' : isClose ? 'text-amber-600' : 'text-emerald-600'}>
                                                    {stat.percentUsed.toFixed(1)}%
                                                </span>
                                            </div>
                                            <Progress value={Math.min(stat.percentUsed, 100)} className="h-3" />
                                            <div className="flex items-center gap-2 pt-2">
                                                {isOverBudget ? (
                                                    <Badge variant="destructive" className="flex gap-1"><AlertCircle className="h-3 w-3" /> Over Budget</Badge>
                                                ) : isClose ? (
                                                    <Badge variant="outline" className="flex gap-1 border-amber-500 text-amber-600 bg-amber-50"><AlertCircle className="h-3 w-3" /> Warning</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="flex gap-1 border-emerald-500 text-emerald-600 bg-emerald-50"><CheckCircle2 className="h-3 w-3" /> Healthy</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}
