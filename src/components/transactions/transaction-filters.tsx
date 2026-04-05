"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";

interface TransactionFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
  filterPayment: string;
  setFilterPayment: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  filterLedger: string;
  setFilterLedger: (val: string) => void;
  clearFilters: () => void;
  dbLedgers: any[];
  uniqueCategories: string[];
  dbCategories: any[];
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
  }
};

export function TransactionFilters({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  filterLedger,
  setFilterLedger,
  clearFilters,
  dbLedgers,
  uniqueCategories,
  dbCategories,
}: TransactionFiltersProps) {
  const hasActiveFilters = filterType !== 'all' || filterCategory !== 'all' || filterLedger !== 'all';

  return (
    <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-all font-black" />
        <Input 
          placeholder="Search records by description or category..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="pl-11 h-12 rounded-xl border-gray-100 bg-white shadow-sm focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-gray-900 text-sm placeholder:text-gray-400 placeholder:font-medium"
        />
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-12 px-6 rounded-xl border-gray-100 bg-white shadow-sm font-black uppercase tracking-widest text-[10px] text-gray-600 flex gap-2 hover:bg-gray-50 transition-all">
              <Filter className="h-4 w-4 text-indigo-600" />
              <span>Refine</span>
              {hasActiveFilters && (
                <div className="ml-1 h-2 w-2 rounded-full bg-indigo-600" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] p-0 rounded-[2rem] shadow-2xl border-0 bg-white overflow-hidden" align="end">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 ml-1">Filter Records</h4>
                <Button variant="ghost" onClick={clearFilters} className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-lg transition-all">Reset All</Button>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Activity Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="rounded-xl h-11 bg-gray-50 border-gray-100 font-bold text-xs text-gray-900 focus:ring-indigo-500">
                      <SelectValue placeholder="All Activity" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1">
                      <SelectItem value="all" className="rounded-lg font-bold text-xs">All Activity</SelectItem>
                      <SelectItem value="income" className="rounded-lg font-bold text-xs text-emerald-600">Income Flow (+)</SelectItem>
                      <SelectItem value="expense" className="rounded-lg font-bold text-xs text-rose-600">Expense Out (-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Ledger Origin</Label>
                  <Select value={filterLedger} onValueChange={setFilterLedger}>
                    <SelectTrigger className="rounded-xl h-11 bg-gray-50 border-gray-100 font-bold text-xs text-gray-900 focus:ring-indigo-500">
                      <SelectValue placeholder="All Accounts" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1 max-h-[240px]">
                      <SelectItem value="all" className="rounded-lg font-bold text-xs">All Ledgers</SelectItem>
                      {dbLedgers.map((l: any) => (
                        <SelectItem key={l.id} value={l.id} className="rounded-lg font-bold text-xs">{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Global Categories</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="rounded-xl h-11 bg-gray-50 border-gray-100 font-bold text-xs text-gray-900 focus:ring-indigo-500">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1 max-h-[240px]">
                      <SelectItem value="all" className="rounded-lg font-bold text-xs">All Groups</SelectItem>
                      {uniqueCategories.map(cat => (
                        <SelectItem key={cat} value={cat} className="rounded-lg font-bold text-xs">
                          {dbCategories.find((c: any) => c.id === cat)?.name || cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="px-8 py-4 bg-indigo-50/50 border-t border-indigo-100 text-[9px] font-black text-indigo-400 text-center uppercase tracking-[0.2em]">
              Real-time Analysis Engine
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </motion.div>
  );
}

