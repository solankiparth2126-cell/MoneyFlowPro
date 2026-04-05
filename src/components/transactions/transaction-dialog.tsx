"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { TransactionValues } from "@/lib/validations";

interface TransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingId: string | null;
  form: UseFormReturn<TransactionValues>;
  onSubmit: (values: TransactionValues) => Promise<void>;
  dbCategories: any[];
  dbLedgers: any[];
}

export function TransactionDialog({
  isOpen,
  setIsOpen,
  editingId,
  form,
  onSubmit,
  dbCategories,
  dbLedgers,
}: TransactionDialogProps) {
  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] border-0 shadow-2xl p-0 overflow-hidden glass-white dark:glass-iris backdrop-blur-2xl">
        <div className="bg-indigo-600 px-8 py-5 text-white relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-black flex items-center gap-2 text-white tracking-tight">
                <Sparkles className="h-5 w-5 text-indigo-300" /> {editingId ? "Modify" : "Create"} Record
              </DialogTitle>
              <DialogDescription className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.15em] mt-1 opacity-80">
                {editingId ? "Update ledger details" : "Add financial activity"}
              </DialogDescription>
            </div>
            <div className="p-2 bg-white/10 rounded-xl">
              <Plus className={`h-5 w-5 transition-transform ${editingId ? 'rotate-45' : ''}`} />
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Monthly Grocery"
                        className="rounded-xl h-10 bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 font-bold text-sm text-gray-900 dark:text-gray-100" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Amount (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="rounded-xl h-10 bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 font-bold text-sm text-gray-900 dark:text-gray-100" 
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
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl h-10 bg-gray-50/50 border-gray-100 font-bold text-sm">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-0 shadow-2xl">
                          <SelectItem value="income">Income (+)</SelectItem>
                          <SelectItem value="expense">Expense (-)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl h-10 bg-gray-50/50 border-gray-100 font-bold text-sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-0 shadow-2xl max-h-[200px]">
                          {dbCategories.map((cat: any) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          className="rounded-xl h-10 bg-gray-50/50 border-gray-100 font-bold text-sm px-3" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl h-10 bg-gray-50/50 border-gray-100 font-bold text-sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-0 shadow-2xl">
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="credit">Credit Card</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ledgerId"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Voucher Ledger</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl h-10 bg-gray-50/50 border-gray-100 font-bold text-sm">
                            <SelectValue placeholder="Select Ledger" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-0 shadow-2xl">
                          {dbLedgers.map((ledger: any) => (
                            <SelectItem key={ledger.id} value={ledger.id}>{ledger.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-200 dark:shadow-none transition-all mt-4"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingId ? "Update Entry" : "Save Transaction")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
