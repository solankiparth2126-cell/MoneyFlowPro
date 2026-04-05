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
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[1100px] w-full text-[13px] tabular-nums">
          <TableHeader className="bg-gray-50/50 border-b border-gray-100 sticky top-0 z-20 backdrop-blur-md">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px] h-14 py-5 pl-8 font-black text-[10px] uppercase tracking-[0.15em] text-gray-400">Date</TableHead>
              <TableHead className="w-[300px] h-14 py-5 font-black text-[10px] uppercase tracking-[0.15em] text-gray-400">Transaction Details</TableHead>
              <TableHead className="w-[150px] h-14 py-5 font-black text-[10px] uppercase tracking-[0.15em] text-gray-400">Category</TableHead>
              <TableHead className="w-[150px] h-14 py-5 font-black text-[10px] uppercase tracking-[0.15em] text-gray-400">Account</TableHead>
              <TableHead className="w-[130px] h-14 text-right py-5 font-black text-[10px] uppercase tracking-[0.15em] text-gray-400">Debit</TableHead>
              <TableHead className="w-[130px] h-14 text-right py-5 font-black text-[10px] uppercase tracking-[0.15em] text-gray-400">Credit</TableHead>
              <TableHead className="w-[140px] h-14 text-right py-5 pr-8 font-black text-[10px] uppercase tracking-[0.15em] text-gray-400">Balance</TableHead>
              <TableHead className="w-[60px] h-14 py-5 text-center font-black text-[10px] uppercase tracking-[0.15em] text-gray-400 sticky right-0 bg-gray-50/80 backdrop-blur-md">#</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 opacity-40" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Parsing Ledger...</span>
                  </div>
              </TableCell></TableRow>
            ) : transactions.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="h-64 text-center">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-tight">No records found for this period.</p>
              </TableCell></TableRow>
            ) : (
              transactions.map((tx: any, index: number) => (
                <TableRow key={tx.id || index} className="group hover:bg-indigo-50/30 transition-all duration-300 border-b border-gray-50">
                  <TableCell className="py-5 pl-8 text-gray-400 font-bold text-xs">
                    {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="py-5 font-black text-gray-900 tracking-tight text-sm">
                    {tx.description}
                  </TableCell>
                  <TableCell className="py-5">
                    <Badge variant="secondary" className="rounded-lg bg-indigo-50 text-indigo-600 border-0 font-black text-[9px] uppercase tracking-widest px-2.5 py-1">
                      {dbCategories.find((c: any) => c.id === tx.category)?.name || tx.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5 font-bold text-gray-500 text-xs uppercase tracking-tight">
                    {dbLedgers.find((l: any) => l.id === tx.ledgerId)?.name || '-'}
                  </TableCell>
                  <TableCell className="text-right py-5 font-black tabular-nums">
                    {tx.type === 'expense' ? <span className="text-rose-500 text-sm">₹{tx.amount.toLocaleString()}</span> : <span className="text-gray-100">—</span>}
                  </TableCell>
                  <TableCell className="text-right py-5 font-black tabular-nums">
                    {tx.type === 'income' ? <span className="text-emerald-500 text-sm">₹{tx.amount.toLocaleString()}</span> : <span className="text-gray-100">—</span>}
                  </TableCell>
                  <TableCell className="text-right font-black pr-8 py-5 tabular-nums text-indigo-600 bg-indigo-50/20">
                    ₹{tx.runningBalance.toLocaleString()}
                  </TableCell>
                   <TableCell className="text-center sticky right-0 bg-white group-hover:bg-[#fbfbff] transition-colors px-4 border-l border-gray-50/50">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-0 shadow-2xl p-1 w-36">
                          <DropdownMenuItem onClick={() => onEdit(tx)} className="rounded-lg h-10 px-3 cursor-pointer text-xs font-black uppercase tracking-widest gap-3">
                            <Pencil className="h-4 w-4 text-indigo-500" /> 
                            <span>Modify</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(tx.id)} className="rounded-lg h-10 px-3 cursor-pointer text-xs font-black uppercase tracking-widest text-rose-500 focus:text-rose-600 gap-3">
                            <Trash2 className="h-4 w-4 text-rose-500" /> 
                            <span>Remove</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                   </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between px-8 py-6 bg-gray-50/50 border-t border-gray-100">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          Page {currentPage} of {totalPages || 1} <span className="mx-2 text-gray-200">|</span> {totalResults} Records Total
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest hover:bg-white border-0 disabled:opacity-30"
          >
            Previous
          </Button>
          <div className="flex gap-2">
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 3 && currentPage > 2) {
                pageNum = currentPage - 1 + i;
                if (pageNum > totalPages) pageNum = totalPages - 2 + i;
              }
              if (pageNum > totalPages || pageNum < 1) return null;

              return (
                <Button
                  key={pageNum}
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 p-0 rounded-xl font-black text-[11px] transition-all ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-white text-gray-400'}`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest hover:bg-white border-0 disabled:opacity-30"
          >
            Next Page
          </Button>
        </div>
      </div>
    </div>
  )
}
