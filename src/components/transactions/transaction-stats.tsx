"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface TransactionStatsProps {
  startingBalance: number;
  totalCredit: number;
  totalDebit: number;
  finalBalance: number;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
  }
};

export function TransactionStats({ startingBalance, totalCredit, totalDebit, finalBalance }: TransactionStatsProps) {
  const formatCurrency = (amount: number) => 
    `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover-lift glass-iris overflow-hidden relative group">
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-500/10 dark:bg-white/10 rounded-2xl shadow-sm text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Wallet className="h-5 w-5" />
              </div>
              <Badge variant="secondary" className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-full font-black text-[9px] tracking-[0.15em] uppercase text-gray-900 dark:text-gray-100 border border-white/20">Opening</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-80">Start Balance</p>
              <h3 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-gray-50 tabular-nums">{formatCurrency(startingBalance)}</h3>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover-lift glass-iris overflow-hidden relative group">
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl shadow-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ArrowDownRight className="h-5 w-5" />
              </div>
              <Badge variant="secondary" className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-full font-black text-[9px] tracking-[0.15em] uppercase text-gray-900 dark:text-gray-100 border border-white/20">Inflow</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-80">Total Credit</p>
              <h3 className="text-2xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400 tabular-nums">{formatCurrency(totalCredit)}</h3>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover-lift glass-iris overflow-hidden relative group">
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-500/10 rounded-2xl shadow-sm text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <Badge variant="secondary" className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-full font-black text-[9px] tracking-[0.15em] uppercase text-gray-900 dark:text-gray-100 border border-white/20">Outflow</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-80">Total Debit</p>
              <h3 className="text-2xl font-black tracking-tighter text-rose-600 dark:text-rose-400 tabular-nums">{formatCurrency(totalDebit)}</h3>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-xl hover-lift bg-indigo-600 dark:bg-indigo-900 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 to-purple-500/40 opacity-50" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-2xl text-white shadow-xl shadow-black/10 backdrop-blur-md border border-white/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white rounded-full font-black text-[9px] tracking-[0.15em] uppercase border-0 backdrop-blur-md border border-white/10">Closing</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-indigo-100/80 uppercase tracking-[0.2em] opacity-80">Current Net</p>
              <h3 className={`text-2xl font-black tracking-tighter tabular-nums ${finalBalance < 0 ? 'text-rose-200' : 'text-white'}`}>
                {formatCurrency(finalBalance)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
