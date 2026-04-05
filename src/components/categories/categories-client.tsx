"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Tag, Pencil, Trash2, Loader2, Save, Search, Filter, MoreVertical, Layers, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryValues } from "@/lib/validations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";

export function CategoriesClient() {
    const router = useRouter();
    const { toast } = useToast();
    const { canCreate, canEdit, canDelete } = usePermissions();
    const { categories, isLoading, create, update, remove, seed } = useCategories();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);

    const form = useForm<CategoryValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            type: "expense",
            icon: "Tag",
            color: "#6366f1",
            keywords: "",
            parentId: "none"
        }
    });

    const isSubmitting = form.formState.isSubmitting;

    const openAdd = () => {
        setEditingId(null);
        form.reset({
            name: "", type: "expense", icon: "Tag", color: "#6366f1", keywords: "", parentId: "none"
        });
        setIsDialogOpen(true);
    };

    const openEdit = (category: any) => {
        setEditingId(category.id);
        form.reset({
            name: category.name,
            type: category.type as any,
            icon: category.icon,
            color: category.color,
            keywords: category.keywords || "",
            parentId: category.parentId || "none"
        });
        setIsDialogOpen(true);
    };

    const handleSeed = async () => {
        setIsSeeding(true);
        try {
            await seed();
            toast({ title: "Success", description: "Default categories created successfully!" });
        } catch (error: any) {
            console.error("Seed error:", error);
            toast({ 
                title: "Setup Failed", 
                description: error.message || "Failed to create default categories.",
                variant: "destructive" 
            });
        } finally {
            setIsSeeding(false);
        }
    };

    const onSubmit = async (values: CategoryValues) => {
        try {
            const payload = {
                ...values,
                parentId: values.parentId === "none" ? undefined : values.parentId
            };

            if (editingId) {
                await update({ id: editingId, ...payload });
                toast({ title: "Success", description: "Category updated" });
            } else {
                await create(payload);
                toast({ title: "Success", description: "Category created" });
            }
            setIsDialogOpen(false);
            setEditingId(null);
            form.reset();
            router.refresh();
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    const filteredCategories = categories.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || c.type === filterType;
        return matchesSearch && matchesType;
    });

    const parentCategories = filteredCategories.filter(c => !c.parentId || c.parentId === "none");
    const getChildren = (parentId: string) => categories.filter(c => c.parentId === parentId);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { 
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { type: "spring", stiffness: 100, damping: 15 } as const
        }
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="space-y-10"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-1">
                <motion.div variants={itemVariants} className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200 shrink-0">
                        <Layers className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Category Master</h1>
                            <Badge variant="secondary" className="rounded-xl bg-indigo-50 text-indigo-600 border-indigo-100 px-3 py-1 h-7 text-[11px] font-black uppercase tracking-widest">
                                {categories.length} Assets
                            </Badge>
                        </div>
                        <p className="text-gray-500 text-sm font-bold opacity-60 uppercase tracking-widest">
                            Configure your financial classification hierarchy.
                        </p>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleSeed} 
                        disabled={isSeeding}
                        className="rounded-xl px-6 h-14 text-indigo-600 font-black uppercase tracking-widest text-[11px] hover:bg-indigo-50 transition-all border border-indigo-100"
                    >
                        {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Smart Setup
                    </Button>
                    <Button 
                        onClick={openAdd} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-8 h-14 shadow-2xl shadow-indigo-200 font-black uppercase tracking-widest text-xs transition-all transform active:scale-95"
                    >
                        <Plus className="mr-2 h-5 w-5" /> New Category
                    </Button>
                </motion.div>
            </div>

            {/* Modern Search and Filters Section */}
            <motion.div 
                variants={itemVariants}
                className="flex flex-col md:flex-row gap-4 items-center px-1"
            >
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-all font-black" />
                    <Input 
                        placeholder="Search categories by name..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="pl-14 h-16 rounded-[1.5rem] border-gray-100 bg-white shadow-sm focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-gray-900 text-base placeholder:text-gray-400 placeholder:font-medium placeholder:text-sm"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center h-16 px-6 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm flex-1 md:flex-none">
                        <Filter className="mr-3 h-4 w-4 text-indigo-600" />
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 font-black text-[10px] uppercase tracking-widest text-gray-600 h-10 w-[160px]">
                                <SelectValue placeholder="All Activities" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-2 w-[200px]">
                                <SelectItem value="all" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3">All Activities</SelectItem>
                                <SelectItem value="expense" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 text-rose-500">Expense Out (-)</SelectItem>
                                <SelectItem value="income" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 text-emerald-500">Income Flow (+)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-1">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center gap-6 text-gray-400 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 opacity-40" />
                            <p className="font-black text-[10px] uppercase tracking-[0.3em] opacity-40">Syncing Master Data...</p>
                        </div>
                    ) : parentCategories.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-32 text-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200"
                        >
                            <div className="bg-white h-20 w-20 rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-8 text-gray-300">
                                <Tag className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">System Empty</h3>
                            <p className="text-gray-500 text-sm font-bold opacity-60 mb-10 max-w-xs mx-auto">Start by constructing your first financial classification.</p>
                            <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-10 h-14 shadow-2xl shadow-indigo-100 font-black uppercase tracking-widest text-xs">
                                <Plus className="mr-2 h-5 w-5" /> Initialize
                            </Button>
                        </motion.div>
                    ) : (
                        parentCategories.map((category: any) => {
                            const children = getChildren(category.id);
                            const keywords = category.keywords ? category.keywords.split(',').map((k: string) => k.trim()) : [];

                            return (
                                <motion.div 
                                    key={category.id} 
                                    variants={itemVariants}
                                    layout
                                    className="group"
                                >
                                    <Card className="border border-gray-100 shadow-sm rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 h-full flex flex-col group/card">
                                        <div className="p-8 pb-4">
                                            <div className="flex justify-between items-start mb-8">
                                                <div 
                                                    className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-500 group-hover/card:rotate-6"
                                                    style={{ backgroundColor: `${category.color}10`, border: `1px solid ${category.color}20` }}
                                                >
                                                    <Tag className="h-7 w-7" style={{ color: category.color }} />
                                                </div>
                                                <div className="flex gap-1">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-gray-50 transition-all"><MoreVertical className="h-5 w-5 text-gray-300 group-hover/card:text-gray-400" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-2xl border-0 shadow-2xl p-1.5 w-40">
                                                            {canEdit("ADMIN", "MASTERS") && (
                                                                <DropdownMenuItem onClick={() => openEdit(category)} className="rounded-xl h-11 text-xs font-black uppercase tracking-widest gap-3 px-4">
                                                                    <Pencil className="h-4 w-4 text-indigo-600" /> Modify
                                                                </DropdownMenuItem>
                                                            )}
                                                            {canDelete("ADMIN", "MASTERS") && (
                                                                <DropdownMenuItem onClick={() => remove({ id: category.id })} className="rounded-xl h-11 text-xs font-black uppercase tracking-widest text-rose-500 focus:text-rose-600 gap-3 px-4">
                                                                    <Trash2 className="h-4 w-4 text-rose-600" /> Purge
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <h3 className="font-black text-xl text-gray-900 tracking-tight uppercase group-hover/card:text-indigo-600 transition-colors duration-300">{category.name}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest ${category.type === 'expense' ? 'text-rose-500 border-rose-100 bg-rose-50/50' : 'text-emerald-500 border-emerald-100 bg-emerald-50/50'}`}>
                                                            {category.type}
                                                        </Badge>
                                                        {category.parentId && category.parentId !== 'none' && (
                                                            <div className="h-1 w-1 rounded-full bg-gray-200" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <CardContent className="p-8 pt-4 flex-grow space-y-8">
                                            {children.length > 0 && (
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                                                        Sub-categories
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {children.map((child: any) => (
                                                            <div key={child.id} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-50 rounded-xl border border-gray-100 transition-all hover:bg-white hover:shadow-sm">
                                                                <span className="text-[11px] font-bold text-gray-600">{child.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {keywords.length > 0 && (
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] px-1">
                                                        Heuristic Rules
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {keywords.map((word: string, i: number) => (
                                                            <span key={i} className="text-[10px] font-black px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 uppercase tracking-widest shadow-sm shadow-indigo-50/50">
                                                                {word}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>

                                        <div className="mt-auto p-6 border-t border-gray-50 bg-gray-50/30 text-[9px] font-black text-gray-400 text-center uppercase tracking-[0.3em] opacity-40">
                                            Financial Data Engine
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[520px] rounded-[3rem] p-0 overflow-hidden border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] bg-white">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="p-10 pb-6 bg-indigo-600/5">
                                <DialogHeader>
                                    <div className="flex items-center gap-6 mb-2">
                                        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100/50 border border-indigo-50">
                                            {editingId ? <Pencil className="h-8 w-8 text-indigo-600" /> : <Tag className="h-8 w-8 text-indigo-600" />}
                                        </div>
                                        <div>
                                            <DialogTitle className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                                                {editingId ? "Modify" : "Create"}
                                            </DialogTitle>
                                            <DialogDescription className="text-indigo-600/50 text-[10px] uppercase font-black tracking-[0.2em]">
                                                {editingId ? "Update existing category" : "Establish new classification"}
                                            </DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>
                            </div>

                            <div className="px-10 py-8 space-y-8">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Entity Name</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="e.g. Household Maintenance" 
                                                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-gray-900 text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold text-rose-500" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Activity Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold text-gray-700 focus:ring-indigo-500">
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-1.5 overflow-hidden">
                                                        <SelectItem value="expense" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 text-rose-500">Expense Out (-)</SelectItem>
                                                        <SelectItem value="income" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 text-emerald-500">Income Flow (+)</SelectItem>
                                                        <SelectItem value="both" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3">General Flow</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px] font-bold text-rose-500" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="parentId"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Hierarchy Link</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold text-gray-700 focus:ring-indigo-500">
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-1.5 max-h-[300px]">
                                                        <SelectItem value="none" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 italic opacity-40">None (Root Node)</SelectItem>
                                                        {parentCategories.filter(p => !editingId || p.id !== editingId).map(p => (
                                                            <SelectItem key={p.id} value={p.id} className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3">{p.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px] font-bold text-rose-500" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="color"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Visual Token</FormLabel>
                                                <div className="flex gap-3">
                                                    <FormControl>
                                                        <Input type="color" {...field} className="h-14 w-16 p-1.5 rounded-2xl cursor-pointer border-0 ring-1 ring-gray-100 bg-gray-50 transition-all hover:scale-105" />
                                                    </FormControl>
                                                    <Input value={field.value} onChange={field.onChange} className="h-14 flex-1 rounded-2xl bg-gray-50/50 border-gray-100 uppercase font-mono text-xs font-bold tracking-widest focus:ring-indigo-500" />
                                                </div>
                                                <FormMessage className="text-[10px] font-bold text-rose-500" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="icon"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Iconic Asset</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Tag, Package, etc." className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold text-gray-900 focus:ring-indigo-500" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-bold text-rose-500" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="keywords"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-1">Heuristic Pattern Matching</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Enter keywords (e.g. Uber, Netflix, Rent) separated by commas for intelligent auto-categorization." 
                                                    className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white min-h-[100px] resize-none text-xs font-bold p-5 tracking-tight focus:ring-indigo-500 transition-all"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold text-rose-500" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="p-10 pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-2xl shadow-indigo-200 transition-all font-black text-xs uppercase tracking-[0.2em]"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin h-6 w-6" />
                                    ) : (
                                        editingId ? "Update Ecosystem" : "Commit Entity"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}

