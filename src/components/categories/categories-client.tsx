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
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 } as const
        }
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="container mx-auto py-2 px-2 max-w-7xl space-y-4"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <motion.div variants={itemVariants}>
                    <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-[1.2rem] shadow-sm transform -rotate-2 hover:rotate-0 transition-all duration-500">
                            <Tag className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2.5">
                                <span className="text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight">Category Master</span>
                                <Badge variant="secondary" className="rounded-full bg-amber-50 text-amber-600 border-amber-100 px-3 py-0.5 h-6 text-[10px] font-black uppercase tracking-wider">
                                    {categories.length} Total
                                </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-semibold leading-none mt-1.5 opacity-70">
                                Manage your expense and income categories for better financial clarity.
                            </p>
                        </div>
                    </h1>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSeed} 
                        disabled={isSeeding}
                        className="rounded-xl px-4 h-10 border-amber-200 hover:bg-amber-50 text-amber-700 font-bold shadow-sm transition-all duration-300"
                    >
                        {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-amber-500" />}
                        Smart Setup
                    </Button>
                    <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 h-10 shadow-lg shadow-indigo-100 font-bold transition-all transform active:scale-95">
                        <Plus className="mr-2 h-5 w-5" /> Add Category
                    </Button>
                </motion.div>
            </div>

            {/* Premium Search and Filters Section */}
            <motion.div 
                variants={itemVariants}
                className="bg-white/40 backdrop-blur-md border border-gray-100 rounded-[2rem] p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm hover:shadow-md transition-all duration-300"
            >
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input 
                        placeholder="Search categories..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="pl-12 h-12 rounded-2xl border-0 bg-white/80 shadow-inner focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-sm"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center h-12 px-4 bg-white/80 rounded-2xl border border-gray-50 shadow-inner flex-1 md:flex-none">
                        <Filter className="mr-2 h-4 w-4 text-gray-400" />
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 font-bold text-gray-600 h-8 w-[140px]">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-0 shadow-2xl">
                                <SelectItem value="all" className="rounded-xl font-medium">All Types</SelectItem>
                                <SelectItem value="expense" className="rounded-xl font-medium">Expense</SelectItem>
                                <SelectItem value="income" className="rounded-xl font-medium">Income</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                            <p className="font-medium animate-pulse">Syncing categories...</p>
                        </div>
                    ) : parentCategories.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-24 text-center bg-white/50 backdrop-blur-sm rounded-[2.5rem] border-2 border-dashed border-indigo-100"
                        >
                            <div className="bg-indigo-50 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-500">
                                <Tag className="h-10 w-10 opacity-40" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Build your taxonomy</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-8">Create your first category to start organizing your financial engine.</p>
                            <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-8 h-12 shadow-xl shadow-indigo-200 font-bold">
                                <Plus className="mr-2 h-5 w-5" /> Get Started
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
                                    className="group relative"
                                >
                                    <Card className="border-0 shadow-lg rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-md ring-1 ring-gray-100 dark:bg-gray-900/70 dark:ring-gray-800 hover:shadow-2xl hover:ring-indigo-200 transition-all duration-500 h-full flex flex-col">
                                        <div className="p-6 pb-2">
                                            <div className="flex justify-between items-start mb-4">
                                                <div 
                                                    className="h-14 w-14 rounded-3xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500"
                                                    style={{ backgroundColor: `${category.color}15`, border: `1px solid ${category.color}40` }}
                                                >
                                                    <Tag className="h-7 w-7" style={{ color: category.color }} />
                                                </div>
                                                <div className="flex gap-1 opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-2xl bg-white/80 shadow-sm border"><MoreVertical className="h-4 w-4" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-2xl p-2 border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                                                            {canEdit("ADMIN", "MASTERS") && (
                                                                <DropdownMenuItem onClick={() => openEdit(category)} className="rounded-xl focus:bg-indigo-50">
                                                                    <Pencil className="mr-2 h-4 w-4 text-indigo-500" /> Rename
                                                                </DropdownMenuItem>
                                                            )}
                                                            {canDelete("ADMIN", "MASTERS") && (
                                                                <DropdownMenuItem onClick={() => remove({ id: category.id })} className="rounded-xl focus:bg-rose-50 text-rose-600">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-extrabold text-xl text-gray-900 dark:text-gray-100 tracking-tight">{category.name}</h3>
                                                    <Badge className={`text-[10px] rounded-full px-2 uppercase font-black tracking-widest ${category.type === 'expense' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                        {category.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <CardContent className="p-6 pt-2 flex-grow space-y-4">
                                            {children.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 px-1">
                                                        <Layers className="h-3 w-3" /> Sub-categories
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {children.map((child: any) => (
                                                            <div key={child.id} className="group/sub flex items-center gap-1 px-3 py-1 bg-gray-50/80 rounded-full border border-gray-100 hover:border-indigo-200 hover:bg-white transition-all duration-300 cursor-default">
                                                                <span className="text-[11px] font-bold text-gray-600">{child.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {keywords.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                                                        <Sparkles className="h-3 w-3" /> Auto-Rules
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {keywords.map((word: string, i: number) => (
                                                            <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50/50 text-indigo-600/80 rounded-md border border-indigo-100/50 uppercase tracking-tighter">
                                                                {word}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>

                                        <div className="mt-auto p-4 border-t border-gray-50/50 bg-gray-50/10 text-[9px] font-bold text-muted-foreground text-center uppercase tracking-[0.2em] opacity-40">
                                            Integrated Category
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-2xl glass-iris">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="p-8 pb-4">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-500">
                                        {editingId ? "Edit Category" : "New Category"}
                                    </DialogTitle>
                                    <DialogDescription className="text-muted-foreground text-sm font-medium">
                                        Configure a unified category for your financial transactions.
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            <div className="px-8 py-4 space-y-5">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Category Name</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="e.g., Groceries, Salary, Rent" 
                                                    className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-indigo-500 transition-all font-medium"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 font-medium">
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-2xl border-0 shadow-2xl">
                                                        <SelectItem value="expense">Expense</SelectItem>
                                                        <SelectItem value="income">Income</SelectItem>
                                                        <SelectItem value="both">Both</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="parentId"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Parent Category</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 font-medium">
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-2xl border-0 shadow-2xl">
                                                        <SelectItem value="none">None (Root)</SelectItem>
                                                        {parentCategories.filter(p => !editingId || p.id !== editingId).map(p => (
                                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="color"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Color</FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl>
                                                        <Input type="color" {...field} className="h-12 w-12 p-1 rounded-xl cursor-pointer" />
                                                    </FormControl>
                                                    <Input value={field.value} onChange={field.onChange} className="h-12 flex-1 rounded-2xl bg-gray-50/50 uppercase font-mono text-xs font-bold" />
                                                </div>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="icon"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Icon (Name)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Tag, Shopping, etc." className="h-12 rounded-2xl bg-gray-50/50 font-medium" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="keywords"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center justify-between">
                                                Auto-Categorization Keywords
                                                <Badge variant="outline" className="text-[8px] font-black tracking-widest px-1.5">SMART</Badge>
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="e.g., Zomato, Amazon, Uber, Petrol (comma separated)" 
                                                    className="rounded-[1.5rem] border-gray-100 bg-gray-50/50 focus:bg-white min-h-[100px] resize-none text-sm font-medium"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <p className="text-[10px] text-muted-foreground ml-1">Keywords help auto-group imports.</p>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="p-8 pt-4">
                                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-200 transition-all font-bold text-lg">
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : (editingId ? <Save className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />)}
                                    {editingId ? "Update Category" : "Create Category"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
