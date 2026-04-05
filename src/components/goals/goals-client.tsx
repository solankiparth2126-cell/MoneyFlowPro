"use client"

import { useState } from "react"
import { useGoals, Goal } from "@/hooks/use-goals"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Target, Plus, TrendingUp, Calendar, Trash2, Edit2, Wallet } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { GoalModal } from "@/components/goals/goal-modal"
import { GoalHistoryModal } from "@/components/goals/goal-history-modal"
import { useToast } from "@/hooks/use-toast"

export function GoalsClient() {
  const { goals, isLoading, deleteGoal } = useGoals()
  const { toast } = useToast()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [historyGoal, setHistoryGoal] = useState<Goal | null>(null)

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4 p-1"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-none">Savings Goals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-[11px] font-medium leading-none">Track your financial dreams and stay motivated.</p>
        </div>
        <Button 
          size="sm"
          onClick={() => setIsAddOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg rounded-xl px-4 h-9 gap-2"
        >
          <Plus className="w-4 h-4" /> Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-purple-600 text-white overflow-hidden relative group">
          <CardHeader><CardTitle className="text-lg font-bold opacity-90">Total Target</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalTarget.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-gray-900/50">
          <CardHeader><CardTitle className="text-lg font-bold text-gray-500">Total Saved</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalSaved.toLocaleString('en-IN')}</div>
            <Progress value={overallProgress} className="h-2 mt-4" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-gray-900/50">
          <CardHeader><CardTitle className="text-lg font-bold text-gray-500">Remaining</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{(totalTarget - totalSaved).toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {goals.map((goal, index) => (
            <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card onClick={() => setHistoryGoal(goal)} className="border-none shadow-sm hover:shadow-xl transition-all group rounded-[2.5rem] cursor-pointer overflow-hidden bg-white dark:bg-gray-900/50 ring-1 ring-gray-100 dark:ring-gray-800">
                <div style={{ backgroundColor: goal.color }} className="h-2 w-full" />
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <CardTitle className="text-xl font-bold group-hover:text-purple-600 transition-colors">{goal.title}</CardTitle>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleEdit(e, goal)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={(e) => handleDelete(e, goal.id!)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                   <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-3 rounded-full" />
                   <p className="mt-2 text-sm font-bold">₹{goal.currentAmount.toLocaleString()} of ₹{goal.targetAmount.toLocaleString()}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <GoalModal isOpen={isAddOpen} onClose={handleClose} goal={editingGoal} />
      <GoalHistoryModal isOpen={!!historyGoal} onClose={() => setHistoryGoal(null)} goal={historyGoal} />
    </motion.div>
  )
}
