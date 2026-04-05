"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet, Mail, Lock, User, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterValues } from "@/lib/validations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function RegisterPage() {
    const router = useRouter();
    
    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: RegisterValues) => {
        try {
            const { error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    data: {
                        full_name: values.username,
                    }
                }
            });
            
            if (error) throw error;

            toast({
                title: "Account Created",
                description: "Welcome! Please check your email for verification.",
            });
            
            router.push("/");
        } catch (error: any) {
            toast({
                title: "Sign Up Failed",
                description: error.message || "An error occurred. Please try again.",
                variant: "destructive",
            });
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
                    <div className="space-y-1 text-center pb-6">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="bg-gradient-to-br from-indigo-500 to-purple-600 w-14 h-14 mx-auto p-3 rounded-2xl shadow-lg mb-3 flex items-center justify-center"
                        >
                            <Wallet className="w-full h-full text-white" />
                        </motion.div>
                        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                            Create Account
                        </h1>
                        <p className="text-xs font-medium text-gray-500 mt-1">
                            Join MoneyFlow Pro and start saving today
                        </p>
                    </div>
                    
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider ml-1">Full Name</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Input
                                                    {...field}
                                                    placeholder="John Doe"
                                                    className="pl-11 py-5 rounded-xl border-gray-100 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white text-sm text-gray-900"
                                                />
                                                <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-medium ml-1" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider ml-1">Email Address</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    className="pl-11 py-5 rounded-xl border-gray-100 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white text-sm text-gray-900"
                                                />
                                                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
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
                                        <FormLabel className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider ml-1">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="pl-11 py-5 rounded-xl border-gray-100 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white text-sm text-gray-900"
                                                />
                                                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-medium ml-1" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider ml-1">Confirm Password</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="pl-11 py-5 rounded-xl border-gray-100 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white text-sm text-gray-900"
                                                />
                                                <ShieldCheck className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-medium ml-1" />
                                    </FormItem>
                                )}
                            />

                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full py-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-200/50 hover:shadow-xl active:scale-[0.98] transition-all font-bold text-sm shadow-lg shadow-indigo-100/40 mt-2"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Creating Account...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span>Sign Up</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                )}
                            </Button>

                            <p className="text-center text-xs text-gray-500 pt-1">
                                Already have an account?{" "}
                                <Link href="/login" className="text-indigo-600 font-bold hover:underline underline-offset-4">
                                    Sign In
                                </Link>
                            </p>
                        </form>
                    </Form>
                </div>
            </motion.div>
        </div>
    );
}
