"use client";

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, PiggyBank, TrendingUp, Plus, MoreVertical, ArrowRight, CreditCard, Banknote, Pencil, Trash2, Loader2, Info, Search, Filter, Sparkles, Building2, Landmark, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useLedgers } from "@/hooks/use-ledgers"
import { useTransactions } from "@/hooks/use-transactions"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ledgerSchema, LedgerValues } from "@/lib/validations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { usePermissions } from "@/hooks/use-permissions"

const iconMap: Record<string, any> = {
  Wallet,
  PiggyBank,
  TrendingUp,
  CreditCard,
  Banknote
}

export function LedgersClient() {
  const router = useRouter()
  const { user } = useAuth()
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { toast } = useToast()

  const { ledgers, isLoading, create: createLedger, update: updateLedger, remove: deleteLedger } = useLedgers()
  const { allTransactions } = useTransactions()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const form = useForm<LedgerValues>({
    resolver: zodResolver(ledgerSchema),
    defaultValues: {
      name: "",
      description: "",
      initialBalance: 0,
      balance: 0,
      icon: "Wallet",
      accountType: "bank"
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (!isDialogOpen) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = ""
        document.body.style.overflow = ""
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isDialogOpen])

  const onSubmit = async (values: LedgerValues) => {
    try {
      if (editingId) {
        await updateLedger({
          id: editingId,
          ...values,
          initialBalance: values.initialBalance,
          balance: values.balance ?? values.initialBalance
        });
        toast({ title: "Ledger Updated" });
      } else {
        await createLedger({
          ...values,
          initialBalance: values.initialBalance,
          balance: values.balance ?? values.initialBalance
        });
        toast({
          title: "Ledger Created",
          description: `${values.name} is now active.`,
          className: "bg-green-50 border-green-200 text-green-900"
        });
      }
      setIsDialogOpen(false);
      setEditingId(null);
      form.reset();
      router.refresh();
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: `Failed to ${editingId ? 'update' : 'create'} ledger`,
        description: err.message || "An unexpected error occurred."
      });
    }
  }

  const handleDeleteLedger = async (id: string | number) => {
    try {
      if (!id) return;
      await deleteLedger({ id: id as any });
      toast({ title: "Ledger Removed" })
      router.refresh()
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to delete ledger" })
    }
  }

  const openEdit = (l: any) => {
    setEditingId(l.id);
    form.reset({
      name: l.name,
      description: l.description || "",
      initialBalance: l.initialBalance || 0,
      balance: l.balance || 0,
      icon: l.icon || "Wallet",
      accountType: l.accountType || "bank"
    });
    setIsDialogOpen(true);
  }

  const openAdd = () => {
    setEditingId(null);
    form.reset({
      name: "",
      description: "",
      initialBalance: 0,
      balance: 0,
      icon: "Wallet",
      accountType: "bank"
    });
    setIsDialogOpen(true);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
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
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-1">
        <motion.div variants={itemVariants} className="flex items-center gap-6">
          <div className="h-16 w-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200 shrink-0 transform-gpu transition-transform hover:scale-105 duration-500">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Accounts & Ledgers</h1>
              <Badge variant="secondary" className="rounded-xl bg-indigo-50 text-indigo-600 border-indigo-100 px-3 py-1 h-7 text-[11px] font-black uppercase tracking-widest">
                {ledgers.length} Active
              </Badge>
            </div>
            <p className="text-gray-500 text-sm font-bold opacity-60 uppercase tracking-widest">
              Manage your banking and credit accounts.
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          {canCreate("CORE", "LEDGERS") && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-10 h-14 shadow-2xl shadow-indigo-200 font-black uppercase tracking-widest text-xs transition-all transform active:scale-95"
            >
              <Plus className="mr-2 h-5 w-5" /> New Ledger
            </Button>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-1">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center gap-6 text-gray-400 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600 opacity-40" />
              <p className="font-black text-[10px] uppercase tracking-[0.3em] opacity-40">Synchronizing Vaults...</p>
            </div>
          ) : (
            <>
              {/* Permanent "Add New" Card */}
              {canCreate("CORE", "LEDGERS") && (
                <motion.div
                  variants={itemVariants}
                  layout
                  className="group relative cursor-pointer"
                  onClick={openAdd}
                >
                  <Card 
                    className="border-2 border-dashed border-gray-100 shadow-none rounded-[2.5rem] overflow-hidden bg-white/30 hover:bg-white hover:border-indigo-200 transition-all duration-500 h-full min-h-[240px] flex flex-col items-center justify-center text-center p-8 group/add shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50"
                  >
                    <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 text-gray-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all duration-500 group-hover:rotate-12">
                      <Plus className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Provision Ledger</h3>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest px-4 opacity-60">Initialize new financial node</p>
                  </Card>
                </motion.div>
              )}

              {/* Dynamic Account Cards */}
              {ledgers.map((l: any) => {
                const IconComp = iconMap[l.icon] || Wallet;
                
                const initial = Number(l.initialBalance) || 0;
                const running = (allTransactions || []).filter((tx: any) => tx.ledgerId === l.id).reduce((acc: number, tx: any) => tx.type === 'income' ? acc + tx.amount : acc - tx.amount, 0);
                const displayBalance = initial + running;
                const isCredit = l.icon === 'CreditCard' || l.accountType === 'credit';

                return (
                  <motion.div
                    key={l.id}
                    variants={itemVariants}
                    layout
                    className="group"
                  >
                    <Card className="border border-gray-100 shadow-sm rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 h-full flex flex-col relative group/card">
                      <div className="p-8 pb-4 flex-1 relative z-10">
                        <div className="flex justify-between items-start mb-8">
                          <div 
                            className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-500 group-hover/card:rotate-6 ${isCredit ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}
                          >
                            <IconComp className="h-7 w-7" />
                          </div>
                          <div className="flex gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-gray-50 transition-all"><MoreVertical className="h-5 w-5 text-gray-300 group-hover/card:text-gray-400" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl border-0 shadow-2xl p-1.5 w-40">
                                {canEdit("CORE", "LEDGERS") && (
                                  <DropdownMenuItem onClick={() => openEdit(l)} className="rounded-xl h-11 text-xs font-black uppercase tracking-widest gap-3 px-4">
                                    <Pencil className="h-4 w-4 text-indigo-600" /> Modify
                                  </DropdownMenuItem>
                                )}
                                {canDelete("CORE", "LEDGERS") && (
                                  <DropdownMenuItem onClick={() => handleDeleteLedger(l.id)} className="rounded-xl h-11 text-xs font-black uppercase tracking-widest text-rose-500 focus:text-rose-600 gap-3 px-4">
                                    <Trash2 className="h-4 w-4 text-rose-600" /> Purge
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="space-y-1">
                            <h3 className="font-black text-xl text-gray-900 tracking-tight uppercase group-hover/card:text-indigo-600 transition-colors duration-300">{l.name}</h3>
                            <Badge variant="outline" className="text-[9px] px-2 py-0.5 rounded-lg font-black text-gray-400 uppercase tracking-widest border-gray-100">
                              {l.accountType || 'Asset Vault'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Liquid Balance</p>
                            <div className={`text-3xl font-black tracking-tighter tabular-nums ${displayBalance < 0 ? 'text-rose-500' : 'text-gray-900'}`}>
                              ₹{displayBalance.toLocaleString('en-IN')}
                            </div>
                            {initial !== 0 && (
                              <p className="text-[9px] font-black text-gray-400/50 mt-2 uppercase tracking-widest ml-1">
                                Base: ₹{initial.toLocaleString('en-IN')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto px-8 py-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <Button variant="ghost" asChild className="p-0 h-auto font-black text-indigo-600 hover:text-indigo-700 hover:bg-transparent text-[10px] uppercase tracking-widest">
                          <Link href={`/ledgers/${l.id}`} className="flex items-center group/link">
                            View Statement <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </>
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
                      {editingId ? <Pencil className="h-8 w-8 text-indigo-600" /> : <Building2 className="h-8 w-8 text-indigo-600" />}
                    </div>
                    <div>
                      <DialogTitle className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                        {editingId ? "Modify" : "Create"}
                      </DialogTitle>
                      <DialogDescription className="text-indigo-600/50 text-[10px] uppercase font-black tracking-[0.2em]">
                        {editingId ? "Update account parameters" : "Register a new financial node"}
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Ledger Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Primary Savings Vault" 
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
                    name="initialBalance"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Base Balance (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00"
                            className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all font-black text-indigo-600 text-base tabular-nums"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold text-rose-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Node Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold text-gray-700 focus:ring-indigo-500">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-1.5 overflow-hidden">
                            <SelectItem value="bank" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3">Bank Institution</SelectItem>
                            <SelectItem value="credit" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 text-rose-500">Credit Facility</SelectItem>
                            <SelectItem value="cash" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 text-emerald-500">Liquid Cash</SelectItem>
                            <SelectItem value="savings" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 text-indigo-500">Investment Node</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px] font-bold text-rose-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Meta Details (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the purpose of this ledger..."
                          className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white min-h-[100px] resize-none text-xs font-bold p-5 tracking-tight focus:ring-indigo-500 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold text-rose-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-1">Visual Asset</FormLabel>
                      <div className="flex gap-4">
                        {Object.keys(iconMap).map(iconName => {
                          const Icon = iconMap[iconName];
                          const isActive = field.value === iconName;
                          return (
                            <Button 
                              key={iconName}
                              type="button" 
                              variant={isActive ? "default" : "outline"}
                              className={`h-14 w-14 p-0 rounded-2xl transition-all border-0 ring-1 ring-gray-100 ${
                                isActive 
                                ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 ring-indigo-600' 
                                : 'bg-gray-50 text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 hover:ring-indigo-100'
                              }`}
                              onClick={() => field.onChange(iconName)}
                            >
                              <Icon className="h-6 w-6" />
                            </Button>
                          );
                        })}
                      </div>
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
                    editingId ? "Update Ecosystem" : "Commit Node"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
