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
      className="space-y-4 p-1 pb-24"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <motion.div variants={itemVariants}>
          <div className="flex flex-col">
            <h1 className="text-4xl font-black text-gray-930 dark:text-gray-50 tracking-tight">Accounts & Ledgers</h1>
            <p className="text-muted-foreground text-sm font-semibold mt-2 opacity-70">
              Manage your banking and credit accounts in ₹.
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          {canCreate("CORE", "LEDGERS") && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-8 h-12 shadow-xl shadow-indigo-200 font-bold transition-all transform active:scale-95 text-white"
            >
              <Plus className="mr-2 h-6 w-6" /> New Ledger
            </Button>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="font-medium animate-pulse">Syncing ledgers...</p>
            </div>
          ) : (
            <>
              {/* Permanent "Add New" Card */}
              <motion.div
                variants={itemVariants}
                layout
                className="group relative cursor-pointer"
                onClick={openAdd}
              >
                <Card 
                  className="border-2 border-dashed border-gray-100 dark:border-gray-800 shadow-none rounded-[1.8rem] overflow-hidden bg-white/30 dark:bg-transparent hover:bg-white/50 hover:border-indigo-200 transition-all duration-500 h-full min-h-[220px] flex flex-col items-center justify-center text-center p-8"
                  onClick={openAdd}
                >
                  <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center mb-6 text-gray-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                    <Plus className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Add New Ledger</h3>
                  <p className="text-xs text-muted-foreground font-medium max-w-[200px]">Track another bank account or credit card</p>
                </Card>
              </motion.div>

              {/* Dynamic Account Cards */}
              {ledgers.map((l: any) => {
                const IconComp = iconMap[l.icon] || Wallet;
                
                const initial = Number(l.initialBalance) || Number(l.balance) || 0;
                const running = (allTransactions || []).filter((tx: any) => tx.ledgerId === l.id).reduce((acc: number, tx: any) => tx.type === 'income' ? acc + tx.amount : acc - tx.amount, 0);
                const displayBalance = initial + running;
                const isCredit = l.icon === 'CreditCard';
                const initialBalance = l.initialBalance || 0;

                return (
                  <motion.div
                    key={l.id}
                    variants={itemVariants}
                    layout
                    className="group relative"
                  >
                    <Card className="border-0 shadow-sm rounded-[1.8rem] overflow-hidden bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-500 h-full flex flex-col relative">
                      {/* Large Background Icon */}
                      <IconComp className="absolute -right-6 top-10 h-32 w-32 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors duration-500 -rotate-12 pointer-events-none" />
                      
                      <div className="p-8 pb-4 flex-1">
                        <div className="flex justify-between items-start mb-6">
                          <div 
                            className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${isCredit ? 'bg-purple-50 text-purple-600' : 'bg-indigo-50 text-indigo-600'}`}
                          >
                            <IconComp className="h-6 w-6" />
                          </div>
                          <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-gray-100"><MoreVertical className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl p-2">
                                {canEdit("CORE", "LEDGERS") && (
                                  <DropdownMenuItem onClick={() => openEdit(l)} className="rounded-lg">
                                    <Pencil className="mr-2 h-4 w-4" /> Rename
                                  </DropdownMenuItem>
                                )}
                                {canDelete("CORE", "LEDGERS") && (
                                  <DropdownMenuItem onClick={() => l.id && handleDeleteLedger(l.id)} className="rounded-lg text-rose-600 focus:bg-rose-50">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="font-extrabold text-xl text-gray-900 dark:text-gray-100 tracking-tight uppercase">{l.name}</h3>
                          
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Current Balance</p>
                            <div className={`text-2xl font-black tracking-tight flex items-center gap-1 ${displayBalance < 0 ? 'text-rose-600' : 'text-gray-900 dark:text-gray-100'}`}>
                              ₹{displayBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </div>
                            {initialBalance !== 0 && (
                              <p className="text-[10px] font-bold text-muted-foreground/40 mt-1">
                                (Includes Initial Balance: ₹{initialBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-8 pt-2">
                        <Button variant="ghost" asChild className="p-0 h-auto font-bold text-indigo-600 hover:text-indigo-700 hover:bg-transparent text-sm">
                          <Link href={`/ledgers/${l.id}`} className="flex items-center group/link">
                            View Details <ArrowRight className="h-4 w-4 ml-1.5 group-hover/link:translate-x-1 transition-transform" />
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
        <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-2xl glass-iris">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="p-8 pb-4">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                      {editingId ? <Pencil className="h-5 w-5 text-indigo-600" /> : <Building2 className="h-5 w-5 text-indigo-600" />}
                    </div>
                    <DialogTitle className="text-2xl font-black tracking-tight text-gray-900">{editingId ? "Edit Account" : "New Account"}</DialogTitle>
                  </div>
                  <DialogDescription className="text-muted-foreground text-sm font-medium">
                    {editingId ? "Modify your account details." : "Set up a new bank account or credit card workspace."}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="px-8 py-4 space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Account Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. HDFC Savings, ICICI Credit Card" 
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
                    name="initialBalance"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Initial Balance (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00"
                            className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 font-black text-indigo-600"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Account Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 font-medium">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl border-0 shadow-2xl">
                            <SelectItem value="bank" className="rounded-xl font-medium">Bank Account</SelectItem>
                            <SelectItem value="credit" className="rounded-xl font-medium">Credit Card</SelectItem>
                            <SelectItem value="cash" className="rounded-xl font-medium">Cash</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g. Salary account, business card, etc."
                          className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white min-h-[80px] resize-none text-sm font-medium"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Choose Icon</FormLabel>
                      <div className="flex gap-2 p-1">
                        {Object.keys(iconMap).map(iconName => {
                          const Icon = iconMap[iconName];
                          return (
                            <Button 
                              key={iconName}
                              type="button" 
                              variant={field.value === iconName ? "default" : "outline"}
                              className={`h-11 w-11 p-0 rounded-xl transition-all ${field.value === iconName ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'hover:bg-indigo-50 hover:text-indigo-600'}`}
                              onClick={() => field.onChange(iconName)}
                            >
                              <Icon className="h-5 w-5" />
                            </Button>
                          );
                        })}
                      </div>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-8 pt-4">
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-200 transition-all font-bold text-lg">
                  {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : (editingId ? <Save className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />)}
                  {editingId ? "Save Changes" : "Create Account"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
