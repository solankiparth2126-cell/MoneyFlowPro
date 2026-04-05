"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Pencil } from "lucide-react";
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
      <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl bg-white">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-8 pb-4">
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                    {editingId ? <Pencil className="h-6 w-6 text-indigo-600" /> : <Plus className="h-6 w-6 text-indigo-600" />}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                      {editingId ? "Edit Transaction" : "New Transaction"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 text-xs font-semibold">
                      {editingId ? "Update existing financial record." : "Create a new entry in your ledgers."}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="px-8 py-4 space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Memo / Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="What was this for?" 
                        className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-gray-900"
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Amount (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-gray-900"
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
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-gray-600">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1">
                          <SelectItem value="income" className="rounded-lg font-bold text-xs py-2.5 text-emerald-600">Income (+)</SelectItem>
                          <SelectItem value="expense" className="rounded-lg font-bold text-xs py-2.5 text-rose-600">Expense (-)</SelectItem>
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
                  name="category"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-gray-600 text-left truncate">
                            <SelectValue placeholder="Categorize" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1 max-h-[240px]">
                          {dbCategories.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id} className="rounded-lg font-bold text-xs py-2">
                              {cat.name}
                            </SelectItem>
                          ))}
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
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Posting Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-gray-900 px-3 cursor-pointer" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Mode</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-gray-600">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1">
                          <SelectItem value="bank" className="rounded-lg font-bold text-xs py-2.5">Bank</SelectItem>
                          <SelectItem value="credit" className="rounded-lg font-bold text-xs py-2.5">Credit</SelectItem>
                          <SelectItem value="cash" className="rounded-lg font-bold text-xs py-2.5">Cash</SelectItem>
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
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Ledger</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-gray-600 text-left truncate">
                            <SelectValue placeholder="Target Account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1 max-h-[240px]">
                          {dbLedgers.map((ledger: any) => (
                            <SelectItem key={ledger.id} value={ledger.id} className="rounded-lg font-bold text-xs py-2">
                              {ledger.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="p-8 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all font-black text-lg uppercase tracking-widest"
              >
                {isSubmitting ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  editingId ? "Update Record" : "Save Record"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
