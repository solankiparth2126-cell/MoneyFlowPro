
"use client"

import { use, useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useLedgers } from "@/hooks/use-ledgers"
import { useTransactions } from "@/hooks/use-transactions"
import { useCategories } from "@/hooks/use-categories"
import { usePermissions } from "@/hooks/use-permissions"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Wallet, ReceiptText, TrendingUp, PiggyBank, CreditCard, Banknote, Trash2, UploadCloud, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useAuth } from "@/context/auth-context"
// Removed legacy Transaction import

const iconMap: Record<string, any> = {
  Wallet,
  PiggyBank,
  TrendingUp,
  CreditCard,
  Banknote
}

export default function LedgerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const { canDelete } = usePermissions();
  const isAdmin = canDelete("CORE", "LEDGERS");
  const { id } = use(params)
  const { categories } = useCategories()
  const { allTransactions, update: updateTx, remove: deleteTx, clearAllByLedger, importCsv, isLoading: isTxLoading, refresh: refreshTx } = useTransactions()
  const { ledgers, isLoading: isLedgerLoading, isError: isLedgerError, refresh: refreshLedgers } = useLedgers()
  
  const ledger = useMemo(() => ledgers.find((l: any) => l.id === id), [ledgers, id])
  const ledgerTransactions = useMemo(() => 
    (allTransactions || []).filter((tx: any) => tx.ledgerId === id), 
    [allTransactions, id]
  )
  
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  
  const isLoading = isLedgerLoading || isTxLoading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const error = !isLoading && !ledger
  const { toast } = useToast()

  const handleCategoryChange = async (txId: any, newCategory: string, originalTx: any) => {
    if (!txId || !originalTx) return;
    try {
      await updateTx({
        ...originalTx,
        category: newCategory
      });
      toast({ title: "Category Updated", description: "The transaction category was updated successfully." });
    } catch (e: any) {
      console.error(e);
      toast({ variant: "destructive", title: "Update Failed", description: e.message || "An error occurred while updating the transaction." })
    }
  }

  const handleDelete = async (txId: any) => {
    if (!txId) return;
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await deleteTx({ id: txId });
      toast({ title: "Deleted", description: "Transaction removed." });
      refreshTx();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete transaction." });
    }
  }

  const handleDeleteAll = async () => {
    if (!window.confirm("CRITICAL: Are you sure you want to PERMANENTLY CLEAR ALL transactions for this ledger? This cannot be undone.")) return;
    try {
      setIsSubmitting(true);
      await clearAllByLedger(id);
      toast({ title: "Ledger Cleared", description: "All transactions removed and balance reset." });
      refreshTx();
      refreshLedgers();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not clear ledger." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    try {
      setIsImporting(true);
      await importCsv(importFile, id);
      toast({ title: "Success", description: "Transactions imported and linked to this ledger." });
      setIsImportOpen(false);
      setImportFile(null);
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Import Failed", description: error.message });
    } finally {
      setIsImporting(false);
    }
  };

  const displayBalance = useMemo(() => {
    if (!ledger) return 0;
    const initial = Number(ledger.initialBalance) || 0;
    const running = ledgerTransactions.reduce((acc: number, tx: any) => {
      return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
    }, 0);
    return initial + running;
  }, [ledger, ledgerTransactions]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    )
  }

  if (error || !ledger) {
    return notFound()
  }

  const IconComp = iconMap[ledger.icon] || Wallet

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ledgers">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{ledger.name}</h1>
          <p className="text-muted-foreground">{ledger.description}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-card md:col-span-1">
          <CardHeader className="pb-2">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <IconComp className="h-6 w-6" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${displayBalance < 0 ? 'text-destructive' : ''}`}>
              ₹{displayBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex flex-col mt-1">
              <span className="text-sm font-medium text-secondary">
                {displayBalance < 0 ? 'Outstanding Dues' : 'Available Balance'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ReceiptText className="h-5 w-5 text-primary" />
              Transactions for this Ledger
            </CardTitle>
            <div className="flex items-center gap-2">
              <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50" disabled={isImporting}>
                    <UploadCloud className="h-4 w-4" />
                    Import Statement
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleImportSubmit}>
                    <DialogHeader>
                      <DialogTitle>Import to {ledger.name}</DialogTitle>
                      <DialogDescription>Select your bank statement (CSV/Excel/PDF) to import transactions directly to this ledger.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Bank Statement File</Label>
                        <Input type="file" accept=".csv, .xls, .xlsx, .pdf" onChange={(e) => setImportFile(e.target.files?.[0] || null)} required />
                      </div>
                      <p className="text-xs text-muted-foreground italic">Note: Transactions will be automatically linked to <strong>{ledger.name}</strong>.</p>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isImporting || !importFile} className="w-full">
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Start Import"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {isAdmin && ledgerTransactions.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDeleteAll}
                  disabled={isSubmitting}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-2 font-bold"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {isAdmin && <TableHead className="text-right w-[60px]">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerTransactions.map((tx: any) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-xs">
                      {tx.date ? new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {tx.description}
                    </TableCell>
                     <TableCell>
                      <Select value={tx.category} onValueChange={(val) => handleCategoryChange(tx.id, val, tx)}>
                        <SelectTrigger className="h-7 text-[10px] w-[140px] bg-white dark:bg-gray-800 border-indigo-100 dark:border-gray-700">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="max-h-[300px] overflow-y-auto">
                            {categories.length > 0 ? (
                              categories.map((cat: any) => (
                                <SelectItem key={cat.id} value={cat.id} className="text-xs">
                                  {cat.name}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="salary">Salary & Income</SelectItem>
                                <SelectItem value="food">Food & Dining</SelectItem>
                                <SelectItem value="shopping">Shopping</SelectItem>
                                <SelectItem value="transport">Transportation</SelectItem>
                                <SelectItem value="rent">Rent & Housing</SelectItem>
                                <SelectItem value="utilities">Utilities & Bills</SelectItem>
                                <SelectItem value="health">Healthcare</SelectItem>
                                <SelectItem value="entertainment">Entertainment</SelectItem>
                                <SelectItem value="education">Education</SelectItem>
                                <SelectItem value="travel">Travel</SelectItem>
                                <SelectItem value="investment">Investments</SelectItem>
                                <SelectItem value="misc">Miscellaneous</SelectItem>
                              </>
                            )}
                          </div>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className={`text-right font-bold text-xs ${tx.type === 'income' ? 'text-secondary' : 'text-foreground'}`}>
                      {tx.type === 'income' ? '+' : ''}₹{tx.amount.toLocaleString('en-IN')}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tx.id)} className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {ledgerTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-muted-foreground">
                      No transactions found for this ledger.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
