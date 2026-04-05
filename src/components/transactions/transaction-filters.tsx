"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
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
    <motion.div variants={itemVariants} className="glass-iris rounded-[2.5rem] p-4 flex flex-col md:flex-row gap-4 items-center shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
      <div className="relative flex-1 w-full group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        <Input 
          placeholder="Search by description or category..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="pl-14 h-14 rounded-3xl border-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md shadow-inner focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all font-bold text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 placeholder:font-black placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]"
        />
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-14 px-8 rounded-3xl border-white/20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md font-black uppercase tracking-widest text-[10px] flex gap-3 hover:bg-white/60 dark:hover:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 transition-all">
              <Filter className="h-4 w-4 text-indigo-500" />
              <span>Filters</span>
              {hasActiveFilters && (
                <div className="bg-indigo-600 rounded-full w-2 h-2 ml-1 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-8 rounded-[2.5rem] shadow-2xl border-white/20 glass-iris backdrop-blur-2xl" align="end">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">Refine Results</h4>
                <Button variant="ghost" onClick={clearFilters} className="h-8 px-3 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">Clear</Button>
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="rounded-2xl h-12 bg-white/30 dark:bg-gray-800/30 border-white/20 font-black text-xs">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/20 glass-iris shadow-2xl">
                    <SelectItem value="all">Any Activity</SelectItem>
                    <SelectItem value="income">Credits (+)</SelectItem>
                    <SelectItem value="expense">Debits (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">Linked Account</Label>
                <Select value={filterLedger} onValueChange={setFilterLedger}>
                  <SelectTrigger className="rounded-2xl h-12 bg-white/30 dark:bg-gray-800/30 border-white/20 font-black text-xs">
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/20 glass-iris shadow-2xl">
                    <SelectItem value="all">Global (All Ledgers)</SelectItem>
                    {dbLedgers.map((l: any) => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="rounded-2xl h-12 bg-white/30 dark:bg-gray-800/30 border-white/20 font-black text-xs">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/20 glass-iris shadow-2xl max-h-[300px]">
                    <SelectItem value="all">Everything</SelectItem>
                    {uniqueCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {dbCategories.find((c: any) => c.id === cat)?.name || cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </motion.div>
  );
}
