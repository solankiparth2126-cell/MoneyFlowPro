"use client";

import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Trash2, FileDown, FileText, Sparkles } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useLedgers } from "@/hooks/use-ledgers";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, TransactionValues } from "@/lib/validations";
import { exportTransactionsToCSV } from "@/lib/export-utils";
import { FYSelector } from "@/components/fy-selector";
import { getCurrentFinancialYear } from "@/lib/financial-year-utils";
import { motion, Variants } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/context/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { Transaction } from "@/lib/types";

// Sub-components
import { TransactionStats } from "./transaction-stats";
import { TransactionFilters } from "./transaction-filters";
import { TransactionTable } from "./transaction-table";
import { TransactionDialog } from "./transaction-dialog";
import { ImportDialog } from "./import-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

// No local interfaces needed, using shared types

export function TransactionsClient() {
  const router = useRouter();
  const { user, companyId } = useAuth();
  const { canCreate, canDelete } = usePermissions();
  const { toast } = useToast();

  const [selectedFY, setSelectedFY] = useState(getCurrentFinancialYear());
  const { 
    allTransactions, 
    transactions, 
    isLoading, 
    create: createTx, 
    update: updateTx, 
    remove: deleteTx, 
    importCsv, 
    purgeOrphans, 
    hardDelete 
  } = useTransactions(selectedFY.startDate, selectedFY.endDate);

  const { categories: dbCategories } = useCategories();
  const { ledgers: dbLedgers } = useLedgers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importLedgerId, setImportLedgerId] = useState<string>("none");
  const [importFile, setImportFile] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Confirm Modal State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    variant: "default" | "destructive";
  }>({
    title: "",
    description: "",
    onConfirm: () => {},
    variant: "default"
  });

  const form = useForm<TransactionValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: 0,
      type: "expense",
      category: "",
      paymentMethod: "bank",
      ledgerId: "",
      date: new Date().toISOString().split('T')[0]
    }
  });

  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterLedger, setFilterLedger] = useState<string>("all");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t: any) => {
      if (!t || !t.description) return false;

      const desc = t.description.toLowerCase() || "";
      const cat = (t.category || "").toLowerCase();
      const search = debouncedSearchTerm.toLowerCase();

      const matchesSearch = desc.includes(search) || cat.includes(search);
      const matchesType = filterType === "all" || t.type === filterType;
      const matchesCategory = filterCategory === "all" || t.category === filterCategory;
      const matchesLedger = filterLedger === "all" || t.ledgerId === filterLedger;

      return matchesSearch && matchesType && matchesCategory && matchesLedger;
    });
  }, [transactions, debouncedSearchTerm, filterType, filterCategory, filterLedger]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterType, filterCategory, filterLedger]);

  const stats = useMemo(() => {
    const debit = filteredTransactions.reduce((acc: number, tx: any) => tx.type === 'expense' ? acc + tx.amount : acc, 0);
    const credit = filteredTransactions.reduce((acc: number, tx: any) => tx.type === 'income' ? acc + tx.amount : acc, 0);

    const involvedLedgerIds = new Set(filteredTransactions.map((t: any) => t.ledgerId).filter(Boolean));
    const totalCurrentBalance = dbLedgers
      .filter((l: any) => involvedLedgerIds.has(l.id))
      .reduce((acc: number, l: any) => {
        const initial = Number(l.initialBalance) || 0;
        const running = (allTransactions || []).filter((tx: any) => tx.ledgerId === l.id).reduce((txAcc: number, tx: any) => tx.type === 'income' ? txAcc + tx.amount : txAcc - tx.amount, 0);
        return acc + initial + running;
      }, 0);

    const finalBal = totalCurrentBalance;
    const startingBal = finalBal - credit + debit;

    return { totalDebit: debit, totalCredit: credit, startingBalance: startingBal, finalBalance: finalBal };
  }, [filteredTransactions, dbLedgers, allTransactions]);

  const paginatedTransactions = useMemo(() => {
    let currentBal = stats.finalBalance;
    const allWithBalance = filteredTransactions.map((tx: any) => {
      const balanceForThisRow = currentBal;
      if (tx.type === 'income') currentBal -= tx.amount;
      else currentBal += tx.amount;
      return { ...tx, runningBalance: balanceForThisRow };
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    return allWithBalance.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, stats.finalBalance, currentPage]);

  const clearFilters = () => {
    setFilterType("all");
    setFilterCategory("all");
    setFilterLedger("all");
    setSearchTerm("");
  };

  const uniqueCategories = useMemo(() => 
    Array.from(new Set(transactions.map((t: any) => t.category))) as string[], 
  [transactions]);

  const onSubmit = async (values: TransactionValues) => {
    try {
      if (!companyId) throw new Error("No company linked");

      if (editingId && editingTransaction) {
        await updateTx({ 
          ...editingTransaction,
          ...values,
          id: editingId, 
          companyId
        } as Transaction);
        toast({ title: "Success", description: "Transaction updated successfully." });
      } else {
        await createTx(values);
        toast({ title: "Success", description: "Transaction added successfully." });
      }
      setIsOpen(false);
      setEditingId(null);
      form.reset();
      router.refresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: `Failed to ${editingId ? 'update' : 'add'} transaction.` });
    }
  };

  const handleEdit = (tx: any) => {
    setEditingId(tx.id);
    setEditingTransaction(tx);
    form.reset({
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      paymentMethod: tx.paymentMethod as any,
      ledgerId: tx.ledgerId || "",
      date: tx.date
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({
      title: "Confirm Deletion",
      description: "Are you sure you want to permanently remove this transaction? This action cannot be undone.",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteTx({ id });
          toast({ title: "Deleted", description: "Transaction removed successfully." });
          router.refresh();
        } catch (e: any) {
          toast({ variant: "destructive", title: "Error", description: "Could not delete the transaction." });
        }
      }
    });
    setConfirmOpen(true);
  }

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    try {
      setIsImporting(true);
      await importCsv(importFile, importLedgerId);
      toast({ title: "Success", description: "Transactions imported successfully." });
      setIsImportOpen(false);
      setImportFile(null);
      setImportLedgerId("none");
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Import Failed", description: error.message });
    } finally {
      setIsImporting(false);
    }
  };

  const handlePurgeOrphans = () => {
    setConfirmConfig({
      title: "Purge Orphans",
      description: "This will permanently remove all transactions that are not assigned to a category or ledger. Proceed?",
      variant: "default",
      onConfirm: async () => {
        try {
          setIsProcessing(true);
          const count = await purgeOrphans();
          toast({ title: "Cleanup Complete", description: `Erased ${count} orphans.` });
          router.refresh();
        } catch (e: any) {
          toast({ variant: "destructive", title: "Cleanup Failed", description: e.message });
        } finally {
          setIsProcessing(false);
        }
      }
    });
    setConfirmOpen(true);
  };

  const handleDeleteAll = () => {
    setConfirmConfig({
      title: "CRITICAL: Wipe Database",
      description: "THIS WILL PERMANENTLY DELETE ALL TRANSACTIONS FOR YOUR COMPANY. This action is irreversible. Are you absolutely certain?",
      variant: "destructive",
      onConfirm: async () => {
        try {
          setIsProcessing(true);
          const count = await hardDelete();
          toast({ title: "Database Wiped", description: `Permanently removed ${count} records.` });
          router.refresh();
        } catch (e: any) {
          toast({ variant: "destructive", title: "Action Failed", description: e.message });
        } finally {
          setIsProcessing(false);
        }
      }
    });
    setConfirmOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 p-1 pb-24 max-w-[1600px] mx-auto"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-200 text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-black text-gray-930 dark:text-gray-50 tracking-tight">Transactions</h1>
          </div>
          <p className="text-muted-foreground text-sm font-semibold opacity-70 ml-1">
            Analyze and manage your detailed financial flow.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 bg-gray-50/50 dark:bg-gray-900/40 backdrop-blur-sm p-3 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <FYSelector value={selectedFY} onValueChange={setSelectedFY} />
          <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsImportOpen(true)}
              className="rounded-2xl border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 font-bold h-11"
            >
              <FileDown className="mr-2 h-4 w-4" /> Import
            </Button>
            <Button 
              variant="outline" 
              onClick={() => exportTransactionsToCSV(filteredTransactions, selectedFY.label)}
              className="rounded-2xl border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 font-bold h-11"
            >
              <FileText className="mr-2 h-4 w-4" /> Export
            </Button>
            {canCreate("CORE", "TRANSACTIONS") && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setEditingId(null);
                    setEditingTransaction(null);
                    form.reset({
                      description: "",
                      amount: 0,
                      type: "expense",
                      category: "",
                      paymentMethod: "bank",
                      ledgerId: dbLedgers[0]?.id || "",
                      date: new Date().toISOString().split('T')[0]
                    });
                    setIsOpen(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-6 h-11 font-bold transition-all text-white"
                >
                  <Plus className="mr-2 h-5 w-5" /> Add Transaction
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-11 w-11 p-0 rounded-2xl border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-0 shadow-2xl dark:bg-gray-900 ring-1 ring-gray-100 dark:ring-gray-800">
                    <div className="px-2 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Admin Tools</div>
                    <DropdownMenuItem onClick={handlePurgeOrphans} className="rounded-xl h-10 px-3 cursor-pointer group">
                      <Trash2 className="mr-2 h-4 w-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                      <span className="font-bold text-xs">Purge Orphans</span>
                    </DropdownMenuItem>
                    {canDelete("ADMIN", "SYSTEM_AUDIT") && (
                      <DropdownMenuItem onClick={handleDeleteAll} className="rounded-xl h-10 px-3 cursor-pointer group text-rose-600 dark:text-rose-400">
                        <Trash2 className="mr-2 h-4 w-4 text-rose-600 dark:text-rose-400" />
                        <span className="font-bold text-xs">Clear All Entries</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Stats Cards Section */}
      <TransactionStats 
        startingBalance={stats.startingBalance}
        totalCredit={stats.totalCredit}
        totalDebit={stats.totalDebit}
        finalBalance={stats.finalBalance}
      />

      {/* Filters Section */}
      <TransactionFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterPayment={"all"} 
        setFilterPayment={() => {}} 
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterLedger={filterLedger}
        setFilterLedger={setFilterLedger}
        clearFilters={clearFilters}
        dbLedgers={dbLedgers}
        uniqueCategories={uniqueCategories}
        dbCategories={dbCategories}
      />

      {/* Main Data Table */}
      <TransactionTable 
        isLoading={isLoading}
        transactions={paginatedTransactions}
        dbCategories={dbCategories}
        dbLedgers={dbLedgers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalResults={filteredTransactions.length}
      />
      
      {/* Transaction Add/Edit Modal */}
      <TransactionDialog 
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        editingId={editingId}
        form={form}
        onSubmit={onSubmit}
        dbCategories={dbCategories}
        dbLedgers={dbLedgers}
      />

      {/* Import Modal */}
      <ImportDialog 
        isOpen={isImportOpen}
        setIsOpen={setIsImportOpen}
        isImporting={isImporting}
        importLedgerId={importLedgerId}
        setImportLedgerId={setImportLedgerId}
        importFile={importFile}
        setImportFile={setImportFile}
        dbLedgers={dbLedgers}
        onSubmit={handleImportSubmit}
      />

      {/* Global Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={confirmConfig.onConfirm}
        variant={confirmConfig.variant}
        confirmText={confirmConfig.variant === 'destructive' ? 'Yes, Delete' : 'Confirm'}
      />
    </motion.div>
  );
}
