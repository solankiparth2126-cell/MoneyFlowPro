"use client";

import { useState, useEffect } from "react";
import { Wallet, Lock, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords Mismatch",
        description: "The passwords you entered do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Password Updated",
        description: "Your password has been reset successfully.",
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Could not update password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6"
            >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-gray-900">Success!</h1>
                    <p className="text-gray-500 text-sm font-medium">
                        Your password has been updated. Redirecting you to login...
                    </p>
                </div>
                <Button 
                    onClick={() => router.push("/login")}
                    className="w-full py-6 rounded-xl bg-indigo-600 font-bold"
                >
                    Back to Login
                </Button>
            </motion.div>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-3xl opacity-20 transform scale-105" />

        <div className="shadow-2xl border-0 overflow-hidden backdrop-blur-xl bg-white/80 relative z-10 ring-1 ring-gray-100 rounded-3xl p-8">
          <div className="space-y-2 text-center pb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 mx-auto p-3.5 rounded-2xl shadow-lg mb-4 flex items-center justify-center">
              <Lock className="w-full h-full text-white" />
            </div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
              Reset Password
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Enter a new strong password for your account
            </p>
          </div>
          
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">New Password</Label>
              <div className="relative group">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 py-6 rounded-xl border-gray-100 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white text-gray-900"
                  required
                />
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Confirm Password</Label>
              <div className="relative group">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-11 py-6 rounded-xl border-gray-100 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white text-gray-900"
                  required
                />
                <CheckCircle2 className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-7 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl active:scale-[0.98] transition-all font-bold text-base shadow-lg"
            >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Update Password</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
