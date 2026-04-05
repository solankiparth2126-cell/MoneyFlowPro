"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Building2, Check, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanies } from '@/hooks/use-masters';
import { useLedgers } from '@/hooks/use-ledgers';
import { supabase } from '@/lib/supabase';

export function CompanySelector() {
    const { user, companyId, setCompanyId } = useAuth();
    const { companies, isLoading: isCompaniesLoading, create: createCompanyDB } = useCompanies();
    const { create: createLedgerDB } = useLedgers();
    
    const [isCreating, setIsCreating] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState("");
    const [bankCount, setBankCount] = useState(0);
    const [creditCount, setCreditCount] = useState(0);
    const [bankNames, setBankNames] = useState<string[]>([]);
    const [creditNames, setCreditNames] = useState<string[]>([]);
    const [setupStep, setSetupStep] = useState(1); // 1: Info, 2: Names
    const { toast } = useToast();

    useEffect(() => {
        // If only one company exists and none selected, auto-select it
        if (!isCompaniesLoading && companies.length === 1 && !companyId) {
            setCompanyId(companies[0].id!);
        }
    }, [companies, companyId, setCompanyId, isCompaniesLoading]);

    const handleCreateCompany = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newCompanyName.trim() || !user) return;

        try {
            setIsCreating(true);
            
            // 1. Create company in Supabase
            const { data: newCompany, error: companyError } = await supabase
                .from('companies')
                .insert([{
                    name: newCompanyName,
                    description: "Primary Company",
                    contact_email: user?.email || "",
                    is_active: true,
                    bank_account_count: bankCount,
                    credit_card_count: creditCount,
                    owner_id: user.id
                }])
                .select()
                .single();

      if (companyError) throw companyError;
      const newCompanyId = newCompany.id;

      // 2. Grant the user access to their own company (CRITICAL MISSING STEP)
      const { error: accessError } = await supabase
          .from('user_company_access')
          .insert([{
              user_id: user.id,
              company_id: newCompanyId,
              role: 'owner'
          }]);

      if (accessError) throw accessError;

      // 3. Create Ledgers directly via Supabase to handle the specific companyId
            for (const name of bankNames) {
              if (name.trim()) {
                const { error } = await supabase
                  .from('ledgers')
                  .insert([{
                    company_id: newCompanyId,
                    name: name.trim(),
                    account_type: "bank",
                    balance: 0,
                    initial_balance: 0,
                    currency: "INR",
                    icon: "Wallet",
                  }]);
                if (error) throw error;
              }
            }

            for (const name of creditNames) {
              if (name.trim()) {
                const { error } = await supabase
                  .from('ledgers')
                  .insert([{
                    company_id: newCompanyId,
                    name: name.trim(),
                    account_type: "credit",
                    balance: 0,
                    initial_balance: 0,
                    currency: "INR",
                    icon: "CreditCard",
                  }]);
                if (error) throw error;
              }
            }

            toast({
                title: "Success",
                description: `Workspace "${newCompanyName}" and ledgers created successfully.`,
            });

            setCompanyId(newCompanyId);
            setIsAddingNew(false);
        } catch (error: any) {
            console.error("Creation error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to create company.",
            });
        } finally {
            setIsCreating(false);
        }
    };

    if (isCompaniesLoading && !isAddingNew) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50/50 dark:bg-gray-950/50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
                    <p className="font-medium text-gray-600 dark:text-gray-400">Setting up your workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950 dark:to-gray-950 p-4">
            <AnimatePresence mode="wait">
                {(companies.length === 0 || isAddingNew) ? (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="w-full max-w-md shadow-2xl border-indigo-100 dark:border-indigo-900 bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden">
                            <form onSubmit={handleCreateCompany}>
                                <CardHeader className="text-center pb-2">
                                    <div className="mx-auto h-16 w-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                                        <Building2 className="h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-indigo-600 dark:from-indigo-100 dark:to-indigo-400">
                                        Create Your Company
                                    </CardTitle>
                                    <CardDescription className="text-base pt-2">
                                        Welcome to MoneyFlow Pro! Let's start by setting up your company profile.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    {setupStep === 1 ? (
                                      <>
                                        <div className="space-y-2">
                                            <Label htmlFor="company-name" className="text-sm font-semibold text-gray-700">Company Name</Label>
                                            <Input
                                                id="company-name"
                                                placeholder="e.g. Acme Corporation Pvt Ltd"
                                                className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 focus:border-indigo-400 focus:ring-indigo-100 transition-all font-medium uppercase"
                                                value={newCompanyName}
                                                onChange={(e) => setNewCompanyName(e.target.value)}
                                                required
                                                autoFocus
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="bank-count" className="text-sm font-semibold text-gray-700">Bank Accounts</Label>
                                                <Input
                                                    id="bank-count"
                                                    type="number"
                                                    min="0"
                                                    max="5"
                                                    className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 focus:border-indigo-400 focus:ring-indigo-100 transition-all"
                                                    value={bankCount}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setBankCount(val);
                                                        setBankNames(Array(val).fill("").map((_, i) => `Bank Account ${i + 1}`));
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="credit-count" className="text-sm font-semibold text-gray-700">Credit Cards</Label>
                                                <Input
                                                    id="credit-count"
                                                    type="number"
                                                    min="0"
                                                    max="5"
                                                    className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 focus:border-indigo-400 focus:ring-indigo-100 transition-all"
                                                    value={creditCount}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setCreditCount(val);
                                                        setCreditNames(Array(val).fill("").map((_, i) => `Credit Card ${i + 1}`));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Name your accounts</p>
                                          
                                          {bankNames.map((name, i) => (
                                              <div key={`bank-${i}`} className="space-y-1.5">
                                                  <Label className="text-xs font-bold text-indigo-600">BANK ACCOUNT {i + 1}</Label>
                                                  <Input 
                                                      value={name}
                                                      onChange={(e) => {
                                                          const newNames = [...bankNames];
                                                          newNames[i] = e.target.value;
                                                          setBankNames(newNames);
                                                      }}
                                                      placeholder="e.g. HDFC Bank, SBI"
                                                      className="h-10 rounded-xl"
                                                  />
                                              </div>
                                          ))}

                                          {creditNames.map((name, i) => (
                                              <div key={`credit-${i}`} className="space-y-1.5 pt-1">
                                                  <Label className="text-xs font-bold text-rose-600">CREDIT CARD {i + 1}</Label>
                                                  <Input 
                                                      value={name}
                                                      onChange={(e) => {
                                                          const newNames = [...creditNames];
                                                          newNames[i] = e.target.value;
                                                          setCreditNames(newNames);
                                                      }}
                                                      placeholder="e.g. ICICI Amazon, Axis Ace"
                                                      className="h-10 rounded-xl"
                                                  />
                                              </div>
                                          ))}
                                      </div>
                                    )}
                                </CardContent>
                                <CardFooter className="pb-8 gap-3 flex-col sm:flex-row">
                                    {setupStep === 2 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full sm:w-auto h-11 font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            onClick={() => setSetupStep(1)}
                                            disabled={isCreating}
                                        >
                                            Back
                                        </Button>
                                    )}
                                    <Button
                                        type={setupStep === 2 ? "submit" : "button"}
                                        className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50"
                                        disabled={isCreating || !newCompanyName.trim()}
                                        onClick={() => {
                                            if (setupStep === 1) {
                                                if (bankCount > 0 || creditCount > 0) {
                                                    setSetupStep(2);
                                                } else {
                                                    handleCreateCompany();
                                                }
                                            }
                                        }}
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Creating...
                                            </>
                                        ) : setupStep === 1 ? (
                                            (bankCount > 0 || creditCount > 0) ? "Next: Setup Accounts" : "Launch Workspace"
                                        ) : "Complete Setup"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="select"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="w-full max-w-lg shadow-2xl border-indigo-100 dark:border-indigo-900 overflow-hidden bg-white dark:bg-gray-900 rounded-[2.5rem]">
                            <CardHeader className="text-center bg-gray-50/50 dark:bg-gray-800/30 border-b dark:border-gray-800 pb-6">
                                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-display">Select Workspace</CardTitle>
                                <CardDescription className="text-base px-4">
                                    Choose which company you'd like to manage today.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[400px] overflow-y-auto">
                                    {companies.map((company: any) => (
                                        <button
                                            key={company.id}
                                            onClick={() => setCompanyId(company.id)}
                                            className="w-full text-left p-5 flex items-center justify-between hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all border-b dark:border-gray-800 last:border-0 group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                                    <Building2 className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{company.name}</h3>
                                                    {company.gst_number && <p className="text-xs text-muted-foreground font-mono mt-0.5">GST: {company.gst_number}</p>}
                                                </div>
                                            </div>
                                            {companyId === company.id && (
                                                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                    <Check className="h-5 w-5" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                            {companies.length > 0 && (
                                <CardFooter className="p-4 bg-gray-50/30 dark:bg-gray-800/30 flex justify-center">
                                    <Button
                                        variant="ghost"
                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold gap-2"
                                        onClick={() => setIsAddingNew(true)}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add New Company
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
