"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[2.5rem] border-0 shadow-2xl glass-iris backdrop-blur-2xl p-0 overflow-hidden max-w-[400px]">
        <div className={`p-6 flex flex-col items-center text-center space-y-4 ${variant === 'destructive' ? 'bg-rose-500/10' : 'bg-indigo-500/10'}`}>
          <div className={`p-4 rounded-3xl ${variant === 'destructive' ? 'bg-rose-600 text-white shadow-xl shadow-rose-200' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <AlertDialogTitle className="text-xl font-black tracking-tight text-gray-900 dark:text-gray-100">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed">
              {description}
            </AlertDialogDescription>
          </div>
        </div>
        
        <AlertDialogFooter className="p-6 pt-0 bg-transparent flex gap-3 sm:gap-0">
          <AlertDialogCancel asChild>
            <Button variant="ghost" className="flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] text-gray-500">
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
                onOpenChange(false);
              }}
              className={`flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] shadow-xl transition-all ${
                variant === 'destructive' 
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
              }`}
            >
              {confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
