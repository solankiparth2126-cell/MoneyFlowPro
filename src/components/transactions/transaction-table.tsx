"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface TransactionTableProps {
  isLoading: boolean;
  transactions: any[];
  dbCategories: any[];
  dbLedgers: any[];
  onEdit: (tx: any) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  totalResults: number;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
  }
};

export function TransactionTable({
  isLoading,
  transactions,
  dbCategories,
  dbLedgers,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  setCurrentPage,
  totalResults,
}: TransactionTableProps) {
  const formatCurrency = (amount: number) => 
    `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <motion.div variants={itemVariants} className="border-0 shadow-2xl glass-iris rounded-[2rem] overflow-hidden">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[1150px] w-full text-[13px] tabular-nums">
          <TableHeader className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md sticky top-0 z-10 border-b border-white/10">
            <TableRow className="hover:bg-transparent border-b border-white/10">
              <TableHead className="w-[120px] h-11 font-black text-[10px] uppercase tracking-[0.2em] text-gray-900 dark:text-gray-100 pl-8">Entry Date</TableHead>
              <TableHead className="w-[280px] h-11 font-black text-[10px] uppercase tracking-[0.2em] text-gray-900 dark:text-gray-100">Transaction Details</TableHead>
              <TableHead className="w-[150px] h-11 font-black text-[10px] uppercase tracking-[0.2em] text-gray-900 dark:text-gray-100">Category Mix</TableHead>
              <TableHead className="w-[120px] h-11 font-black text-[10px] uppercase tracking-[0.2em] text-gray-900 dark:text-gray-100 hidden xl:table-cell">Mode</TableHead>
              <TableHead className="w-[150px] h-11 font-black text-[10px] uppercase tracking-[0.2em] text-gray-900 dark:text-gray-100">Voucher Account</TableHead>
              <TableHead className="w-[140px] h-11 text-right font-black text-[10px] uppercase tracking-[0.2em] text-gray-900 dark:text-gray-100">Debit (-)</TableHead>
              <TableHead className="w-[140px] h-11 text-right font-black text-[10px] uppercase tracking-[0.2em] text-gray-900 dark:text-gray-100">Credit (+)</TableHead>
              <TableHead className="w-[160px] h-11 text-right font-black text-[10px] uppercase tracking-[0.2em] text-gray-900 dark:text-gray-100 pr-12">Balance Post</TableHead>
              <TableHead className="w-[60px] h-11 text-center font-black text-[10px] uppercase tracking-[0.2em] text-gray-900 dark:text-gray-100 sticky right-0">#</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="h-64 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 opacity-20" />
              </TableCell></TableRow>
            ) : transactions.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="h-64 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Zero records in current filter.</p>
              </TableCell></TableRow>
            ) : (
              transactions.map((tx: any, index: number) => (
                <TableRow key={tx.id || index} className="group hover:bg-white/30 dark:hover:bg-white/5 transition-all duration-300 border-b border-white/5">
                  <TableCell className="py-3 pl-8 text-gray-600 dark:text-gray-400 font-bold">{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell className="py-3 font-black text-gray-900 dark:text-gray-100 tracking-tight">{tx.description}</TableCell>
                  <TableCell className="py-3"><Badge variant="outline" className="rounded-lg bg-indigo-500/5 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-[9px] uppercase tracking-wider">{dbCategories.find((c: any) => c.id === tx.category)?.name || tx.category}</Badge></TableCell>
                  <TableCell className="hidden xl:table-cell py-3 capitalize font-bold text-muted-foreground">{tx.paymentMethod}</TableCell>
                  <TableCell className="py-3 font-bold text-gray-600 dark:text-gray-400">{dbLedgers.find((l: any) => l.id === tx.ledgerId)?.name || '-'}</TableCell>
                  <TableCell className="text-right py-3 font-black">{tx.type === 'expense' ? <span className="text-rose-600 dark:text-rose-400">{formatCurrency(tx.amount)}</span> : <span className="text-gray-300 dark:text-gray-800">0.00</span>}</TableCell>
                  <TableCell className="text-right py-3 font-black">{tx.type === 'income' ? <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(tx.amount)}</span> : <span className="text-gray-300 dark:text-gray-800">0.00</span>}</TableCell>
                  <TableCell className="text-right font-black pr-12 py-3 tracking-tighter text-gray-900 dark:text-gray-100 bg-gray-500/5 group-hover:bg-indigo-500/5 transition-colors">{formatCurrency(tx.runningBalance)}</TableCell>
                   <TableCell className="text-center sticky right-0 p-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-white dark:hover:bg-gray-800">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-white/20 glass-iris shadow-2xl p-2">
                          <DropdownMenuItem onClick={() => onEdit(tx)} className="rounded-xl h-10 px-4 cursor-pointer font-bold text-xs"><Pencil className="mr-2 h-4 w-4 text-indigo-500" /> Edit Entry</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(tx.id)} className="rounded-xl h-10 px-4 cursor-pointer font-bold text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20"><Trash2 className="mr-2 h-4 w-4 text-rose-600" /> Remove Record</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                   </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-8 py-4 border-t border-white/10 glass-iris">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
            Page {currentPage} of {totalPages} ({totalResults} results)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border-white/20 h-9 px-4 font-black text-[10px] uppercase tracking-widest hover:bg-white/10"
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum + (4-i) > totalPages) pageNum = totalPages - 4 + i;
                }
                if (pageNum > totalPages || pageNum < 1) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 p-0 rounded-xl font-black text-[10px] ${currentPage === pageNum ? 'bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none' : 'border-white/20 hover:bg-white/10'}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl border-white/20 h-9 px-4 font-black text-[10px] uppercase tracking-widest hover:bg-white/10"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
