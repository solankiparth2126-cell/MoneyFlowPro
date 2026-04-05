"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSchema, LoginValues } from "@/lib/validations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);
  
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: LoginValues) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Welcome back!",
      });

      router.push("/");
    } catch (error: any) {
      // Don't leak info about whether email exists
      let displayMessage = "Email or password is incorrect";

      if (error.message?.includes("Email not confirmed")) {
        displayMessage = "Please verify your email address before logging in";
      } else if (error.message?.includes("Invalid login credentials")) {
        displayMessage = "Email or password is incorrect";
      }

      toast({
        title: "Login Failed",
        description: displayMessage,
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async () => {
    const email = form.getValues("email");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address first to reset your password.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Reset Email Sent",
        description: "If an account exists with this email, you'll receive a password reset link.",
      });
    } catch (error: any) {
      // Generic message - don't confirm if email exists
      toast({
        title: "Reset Sent",
        description: "If an account exists with this email, you'll receive a password reset link.",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen sm:min-h-[100dvh] items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-3xl opacity-20 transform scale-105" />

        <div className="shadow-2xl border-0 overflow-hidden backdrop-blur-xl bg-white/80 relative z-10 ring-1 ring-gray-100 rounded-3xl p-4 sm:p-8">
          <div className="space-y-2 text-center pb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 mx-auto p-3.5 rounded-2xl shadow-lg mb-4 flex items-center justify-center"
            >
              <Wallet className="w-full h-full text-white" />
            </motion.div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Sign in to manage your MoneyFlow account
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          {...field}
                          type="email"
                          placeholder="name@example.com"
                          className="pl-11 py-6 rounded-xl border-gray-100 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white text-gray-900"
                        />
                        <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-medium ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Password</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          className="pl-11 py-6 rounded-xl border-gray-100 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white text-gray-900"
                        />
                        <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-medium ml-1" />
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={isResetting}
                        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
                      >
                        {isResetting ? "Sending..." : "Forgot Password?"}
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-7 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-200/50 hover:shadow-xl active:scale-[0.98] transition-all font-bold text-base shadow-lg shadow-indigo-100/40 relative overflow-hidden group"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>

              <p className="text-center text-sm text-gray-500 pt-2">
                Don't have an account?{" "}
                <Link href="/register" className="text-indigo-600 font-bold hover:underline underline-offset-4">
                  Sign Up
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}