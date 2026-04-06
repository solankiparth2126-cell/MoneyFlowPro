"use client"

import { useState } from "react"
import { useGoals, Goal } from "@/hooks/use-goals"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Target, Plus, TrendingUp, Calendar, Trash2, Edit2, Wallet, Loader2, Sparkles, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { format } from "date-fns"
import { GoalModal } from "@/components/goals/goal-modal"
import { GoalHistoryModal } from "@/components/goals/goal-history-modal"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export function GoalsClient() {
  const { goals, isLoading, deleteGoal } = useGoals()
  const { toast } = useToast()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [historyGoal, setHistoryGoal] = useState<Goal | null>(null)
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const handleEdit = (e: React.MouseEvent, goal: Goal) => {
    e.stopPropagation()
    setEditingGoal(goal)
    setIsAddOpen(true)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this goal?")) {
      try {
        await deleteGoal(id)
        toast({ title: "Goal Deleted", description: "Goal has been removed successfully." })
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete goal.", variant: "destructive" })
      }
    }
  }

  const handleClose = () => {
    setIsAddOpen(false)
    setEditingGoal(null)
  }

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0)
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0)
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-12 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-1">
        <motion.div variants={itemVariants} className="flex items-center gap-6">
          <div className="h-16 w-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200 shrink-0 transform-gpu transition-all hover:scale-110 duration-500">
            <Target className="h-8 w-8 text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Savings Goals</h1>
              <Badge variant="secondary" className="rounded-xl bg-indigo-50 text-indigo-600 border-indigo-100 px-3 py-1 h-7 text-[11px] font-black uppercase tracking-widest">
                {goals.length} Active
              </Badge>
            </div>
            <p className="text-gray-500 text-sm font-bold opacity-60 uppercase tracking-widest leading-none">
              Track your financial dreams and stay motivated.
            </p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Button 
            onClick={() => setIsAddOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-200 rounded-[1.5rem] px-10 h-14 font-black uppercase tracking-widest text-xs gap-3 transition-all transform active:scale-95 group"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" /> New Expansion
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-1">
        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-indigo-100/50 bg-indigo-600 text-white overflow-hidden relative p-10 group/stat">
          <div className="absolute top-0 right-0 p-10 opacity-10 transition-transform duration-700 group-hover/stat:scale-125 group-hover/stat:rotate-12">
            <Target className="w-32 h-32" />
          </div>
          <div className="relative z-10 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Cumulative Target</span>
            <div className="text-4xl font-black tracking-tighter">₹{totalTarget.toLocaleString('en-IN')}</div>
            <div className="h-1.5 w-16 bg-white/20 rounded-full" />
          </div>
        </Card>
 
        <Card className="rounded-[2.5rem] border border-gray-100 shadow-sm bg-white overflow-hidden p-10 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 group/stat">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Total Provisioned</span>
              <div className="text-3xl font-black text-gray-900 tracking-tighter">₹{totalSaved.toLocaleString('en-IN')}</div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="text-indigo-600">Completion</span>
                <span className="text-gray-900">{overallProgress.toFixed(1)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3 bg-indigo-50 rounded-full" />
            </div>
          </div>
        </Card>
 
        <Card className="rounded-[2.5rem] border border-gray-100 shadow-sm bg-white overflow-hidden p-10 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 group/stat">
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Remaining Delta</span>
              <div className="text-3xl font-black text-gray-900 tracking-tighter">₹{(totalTarget - totalSaved).toLocaleString('en-IN')}</div>
            </div>
            <div className="flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-[0.2em] pt-6 group-hover/stat:translate-x-2 transition-transform">
              <TrendingUp className="h-4 w-4" /> Momentum Stable
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 px-1">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-gray-100 gap-6">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600 opacity-40" />
              <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] opacity-40">Synchronizing Ambitions...</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="col-span-full py-40 border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center bg-white/50 group cursor-pointer hover:border-indigo-200 transition-all duration-500" onClick={() => setIsAddOpen(true)}>
              <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100/50 border border-gray-50 mb-8 group-hover:scale-110 transition-transform duration-500">
                <Target className="h-10 w-10 text-gray-200 group-hover:text-indigo-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">No Active Projections</h3>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] max-w-[280px] text-center mt-3 opacity-60">Authorize a new financial trajectory to begin tracking.</p>
            </div>
          ) : goals.map((goal, index) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <motion.div 
                key={goal.id} 
                variants={itemVariants}
                layout
              >
                <Card 
                  onClick={() => setHistoryGoal(goal)} 
                  className="rounded-[2.5rem] border border-gray-100 shadow-sm bg-white overflow-hidden group/card hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-700 cursor-pointer relative flex flex-col h-full"
                >
                  <div style={{ backgroundColor: goal.color }} className="h-2.5 w-full opacity-60 group-hover/card:opacity-100 transition-opacity duration-700" />
                  
                  <div className="p-10 flex flex-col h-full">
                    <header className="flex items-start justify-between mb-10">
                      <div className="flex-1 pr-4">
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter group-hover/card:text-indigo-600 transition-colors duration-300 leading-[0.9]">
                          {goal.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] border-gray-100 text-gray-400 rounded-lg px-2">
                             SAVINGS NODE
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-all transform translate-x-4 group-hover/card:translate-x-0 duration-500">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-gray-300 hover:text-indigo-600 hover:bg-indigo-50" onClick={(e) => handleEdit(e, goal)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-gray-300 hover:text-rose-500 hover:bg-rose-50" onClick={(e) => handleDelete(e, goal.id!)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </header>
 
                    <div className="space-y-8 mt-auto">
                      <div className="space-y-4">
                         <div className="flex items-end justify-between px-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Accumulated</span>
                          <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest tabular-nums bg-indigo-50 px-2 py-0.5 rounded-lg">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-3xl font-black text-gray-900 tracking-tighter">₹{goal.currentAmount.toLocaleString('en-IN')}</div>
                      </div>
 
                      <div className="relative pt-2 px-1">
                        <Progress value={progress} className="h-4 bg-gray-50 rounded-full transition-all duration-1000" />
                        {progress >= 100 && (
                          <div className="absolute -top-1 -right-1">
                            <div className="bg-emerald-500 rounded-full p-1 shadow-lg shadow-emerald-200">
                              <Sparkles className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-gray-50 opacity-60">
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Objective</span>
                         <span className="text-base font-black text-gray-900 tracking-tight">₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
 
                  <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover/card:opacity-[0.01] pointer-events-none transition-opacity duration-700" />
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <GoalModal isOpen={isAddOpen} onClose={handleClose} goal={editingGoal} />
      <GoalHistoryModal isOpen={!!historyGoal} onClose={() => setHistoryGoal(null)} goal={historyGoal} />
    </motion.div>
  )
}
