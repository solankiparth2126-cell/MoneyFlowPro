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
    `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div variants={itemVariants}>
        <Card className="rounded-[2rem] border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl bg-white overflow-hidden relative group">
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-600">
                <Wallet className="h-6 w-6" />
              </div>
              <Badge variant="secondary" className="rounded-lg font-black uppercase tracking-widest text-[9px] px-2.5 py-1 bg-indigo-50 text-indigo-600 border-0">Opening</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Balance</p>
              <h3 className="text-2xl font-black tracking-tight text-gray-900 tabular-nums">{formatCurrency(startingBalance)}</h3>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="rounded-[2rem] border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl bg-white overflow-hidden relative group">
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
                <ArrowDownRight className="h-6 w-6" />
              </div>
              <Badge variant="secondary" className="rounded-lg font-black uppercase tracking-widest text-[9px] px-2.5 py-1 bg-emerald-50 text-emerald-600 border-0">Inflow</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Credit</p>
              <h3 className="text-2xl font-black tracking-tight text-emerald-600 tabular-nums">{formatCurrency(totalCredit)}</h3>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="rounded-[2rem] border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl bg-white overflow-hidden relative group">
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600">
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <Badge variant="secondary" className="rounded-lg font-black uppercase tracking-widest text-[9px] px-2.5 py-1 bg-rose-50 text-rose-600 border-0">Outflow</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Debit</p>
              <h3 className="text-2xl font-black tracking-tight text-rose-600 tabular-nums">{formatCurrency(totalDebit)}</h3>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="rounded-[2rem] border-none shadow-xl bg-indigo-600 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="h-24 w-24 rotate-12" />
          </div>
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-white/20 rounded-2xl text-white backdrop-blur-md border border-white/20 shadow-xl shadow-black/5">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary" className="rounded-lg font-black uppercase tracking-widest text-[9px] px-2.5 py-1 bg-white/20 text-white border-0 backdrop-blur-md">Closing</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-indigo-100/70 uppercase tracking-widest">Current Balance</p>
              <h3 className="text-2xl font-black tracking-tight text-white tabular-nums">{formatCurrency(finalBalance)}</h3>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
