"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, FileText, Loader2, Info } from "lucide-react";

interface ImportDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isImporting: boolean;
  importLedgerId: string;
  setImportLedgerId: (id: string) => void;
  importFile: File | null;
  setImportFile: (file: File | null) => void;
  dbLedgers: any[];
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function ImportDialog({
  isOpen,
  setIsOpen,
  isImporting,
  importLedgerId,
  setImportLedgerId,
  importFile,
  setImportFile,
  dbLedgers,
  onSubmit,
}: ImportDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-2xl glass-iris backdrop-blur-2xl">
        <div className="bg-indigo-600 px-8 py-6 text-white">
          <DialogTitle className="text-xl font-black flex items-center gap-2 text-white">
            <UploadCloud className="h-5 w-5 text-indigo-300" /> Bulk Import
          </DialogTitle>
          <DialogDescription className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.15em] mt-1 opacity-80">
            Ingest transactions from CSV / XLSX files
          </DialogDescription>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">Process Into Ledger</Label>
              <Select value={importLedgerId} onValueChange={setImportLedgerId}>
                <SelectTrigger className="rounded-2xl h-12 bg-white/30 dark:bg-gray-800/30 border-white/10 font-bold text-sm">
                  <SelectValue placeholder="Automatic Detection" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 glass-iris shadow-2xl max-h-[250px]">
                  <SelectItem value="none">Auto-detect from File</SelectItem>
                  {dbLedgers.map((l: any) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div 
              className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all ${
                importFile 
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' 
                  : 'border-white/20 hover:border-indigo-400/50 hover:bg-white/10'
              }`}
            >
              <input
                type="file"
                id="csv-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-3">
                <div className={`p-4 rounded-3xl ${importFile ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none' : 'bg-white/40 dark:bg-gray-800/40 text-indigo-500'}`}>
                  {importFile ? <FileText className="h-6 w-6" /> : <UploadCloud className="h-6 w-6" />}
                </div>
                {importFile ? (
                  <div className="space-y-1">
                    <p className="font-black text-xs text-gray-900 dark:text-gray-100">{importFile.name}</p>
                    <p className="text-[10px] font-bold text-indigo-500">Click to change file</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-black text-xs text-gray-900 dark:text-gray-100">Drop your statement here</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Supports CSV, XLSX, XLS</p>
                  </div>
                )}
              </label>
            </div>

            <div className="flex gap-3 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                Ensure your CSV has columns: Date, Description, Amount, Type (Income/Expense), and Category. Missing categories will be auto-suggested.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                setImportFile(null);
              }}
              className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] text-gray-500"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isImporting || !importFile}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-200 dark:shadow-none transition-all"
            >
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Processing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
