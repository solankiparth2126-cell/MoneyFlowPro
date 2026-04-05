"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Building2, Check, Plus, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanies } from '@/hooks/use-masters';
import { useLedgers } from '@/hooks/use-ledgers';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export function CompanySelector() {
    const { user, companyId, setCompanyId } = useAuth();
    const { companies, isLoading: isCompaniesLoading } = useCompanies();
    
    const [isCreating, setIsCreating] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState("");
    const [bankCount, setBankCount] = useState(0);
    const [creditCount, setCreditCount] = useState(0);
    const [bankNames, setBankNames] = useState<string[]>([]);
    const [creditNames, setCreditNames] = useState<string[]>([]);
    const [setupStep, setSetupStep] = useState(1);
    const { toast } = useToast();

    useEffect(() => {
        if (!isCompaniesLoading && companies.length > 0 && !companyId && !isAddingNew) {
            setCompanyId(companies[0].id!);
        }
    }, [companies, companyId, setCompanyId, isCompaniesLoading, isAddingNew]);

    const handleCreateCompany = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newCompanyName.trim() || !user) return;

        try {
            setIsCreating(true);
            const { data: newCompany, error: companyError } = await supabase
                .from('companies')
                .insert([{
                    name: newCompanyName,
                    description: "Primary Workspace",
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

            const { error: accessError } = await supabase
                .from('user_company_access')
                .insert([{
                    user_id: user.id,
                    company_id: newCompanyId,
                    role: 'owner'
                }]);

            if (accessError) throw accessError;

            // Create Ledgers
            for (const name of bankNames) {
                if (name.trim()) {
                    await supabase.from('ledgers').insert([{
                        company_id: newCompanyId,
                        name: name.trim(),
                        account_type: "bank",
                        balance: 0,
                        initial_balance: 0,
                        currency: "INR",
                        icon: "Wallet",
                    }]);
                }
            }

            for (const name of creditNames) {
                if (name.trim()) {
                    await supabase.from('ledgers').insert([{
                        company_id: newCompanyId,
                        name: name.trim(),
                        account_type: "credit",
                        balance: 0,
                        initial_balance: 0,
                        currency: "INR",
                        icon: "CreditCard",
                    }]);
                }
            }

            toast({ title: "Success", description: "Workspace initialized successfully." });
            setCompanyId(newCompanyId);
            setIsAddingNew(false);
            setTimeout(() => { window.location.href = '/'; }, 500);
            
        } catch (error: any) {
            toast({ variant: "destructive", title: "Creation Failed", description: error.message });
        } finally {
            setIsCreating(false);
        }
    };

    if (isCompaniesLoading && !isAddingNew) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-20 w-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-100 animate-bounce">
                        <Building2 className="h-10 w-10 text-white" />
                    </div>
                    <p className="font-black text-[10px] uppercase tracking-[0.4em] text-indigo-600/40 animate-pulse">Synchronizing Infrastructure...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50/30 p-6">
            <AnimatePresence mode="wait">
                {(companies.length === 0 || isAddingNew) ? (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="w-full max-w-xl"
                    >
                        <Card className="shadow-2xl border-0 bg-white rounded-[3rem] overflow-hidden">
                            <form onSubmit={handleCreateCompany}>
                                <div className="p-12 text-center bg-indigo-600/5">
                                    <div className="mx-auto h-20 w-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-indigo-100 border border-indigo-50">
                                        <Building2 className="h-10 w-10 text-indigo-600" />
                                    </div>
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Provision Workspace</h1>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/50 mt-2">Initialize your private financial ecosystem</p>
                                </div>
                                
                                <CardContent className="p-12 space-y-10">
                                    {setupStep === 1 ? (
                                      <div className="space-y-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Entity Designation</Label>
                                            <Input
                                                placeholder="Enter Company Title..."
                                                className="h-16 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-600 transition-all font-black text-lg uppercase tracking-tight"
                                                value={newCompanyName}
                                                onChange={(e) => setNewCompanyName(e.target.value)}
                                                required
                                                autoFocus
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Asset Vaults (Banks)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    className="h-16 rounded-2xl border-gray-100 bg-gray-50/50 font-black text-lg"
                                                    value={bankCount}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setBankCount(val);
                                                        setBankNames(Array(val).fill("").map((_, i) => `Bank Account ${i + 1}`));
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Liability Nodes (Credit)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    className="h-16 rounded-2xl border-gray-100 bg-gray-50/50 font-black text-lg"
                                                    value={creditCount}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setCreditCount(val);
                                                        setCreditNames(Array(val).fill("").map((_, i) => `Credit Card ${i + 1}`));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Node Configuration</p>
                                          {bankNames.map((name, i) => (
                                              <div key={`bank-${i}`} className="space-y-2">
                                                  <Label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">BANK_NODE_0{i + 1}</Label>
                                                  <Input 
                                                      value={name}
                                                      onChange={(e) => {
                                                          const newNames = [...bankNames];
                                                          newNames[i] = e.target.value;
                                                          setBankNames(newNames);
                                                      }}
                                                      className="h-12 rounded-xl border-gray-100 font-bold"
                                                  />
                                              </div>
                                          ))}
                                          {creditNames.map((name, i) => (
                                              <div key={`credit-${i}`} className="space-y-2 pt-2">
                                                  <Label className="text-[8px] font-black text-rose-400 uppercase tracking-widest">CREDIT_FACILITY_0{i + 1}</Label>
                                                  <Input 
                                                      value={name}
                                                      onChange={(e) => {
                                                          const newNames = [...creditNames];
                                                          newNames[i] = e.target.value;
                                                          setCreditNames(newNames);
                                                      }}
                                                      className="h-12 rounded-xl border-gray-100 font-bold"
                                                  />
                                              </div>
                                          ))}
                                      </div>
                                    )}
                                </CardContent>
                                
                                <CardFooter className="p-12 pt-0 gap-4 flex-col sm:flex-row">
                                    {setupStep === 2 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full sm:w-auto h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-400"
                                            onClick={() => setSetupStep(1)}
                                            disabled={isCreating}
                                        >
                                            Back
                                        </Button>
                                    )}
                                    <Button
                                        type={setupStep === 2 ? "submit" : "button"}
                                        className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-100 transition-all active:scale-95 gap-3"
                                        disabled={isCreating || !newCompanyName.trim()}
                                        onClick={() => {
                                            if (setupStep === 1) {
                                                if (bankCount > 0 || creditCount > 0) setSetupStep(2);
                                                else handleCreateCompany();
                                            }
                                        }}
                                    >
                                        {isCreating ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : setupStep === 1 ? (
                                            <>Proceed to configuration <ArrowRight className="h-4 w-4" /></>
                                        ) : "Authorize Workspace"}
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
                        className="w-full max-w-xl"
                    >
                        <Card className="shadow-2xl border-0 overflow-hidden bg-white rounded-[3.5rem]">
                            <CardHeader className="text-center bg-indigo-600/5 p-12 border-b border-indigo-50">
                                <div className="mx-auto h-20 w-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-indigo-100 border border-indigo-50">
                                    <ShieldCheck className="h-10 w-10 text-indigo-600" />
                                </div>
                                <CardTitle className="text-3xl font-black text-gray-900 tracking-tight uppercase">Select Environment</CardTitle>
                                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mt-2">
                                    Secure entry to financial workspace
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3 max-h-[400px] overflow-y-auto px-4 py-6 custom-scrollbar">
                                    {companies.map((company: any) => (
                                        <button
                                            key={company.id}
                                            onClick={() => setCompanyId(company.id)}
                                            className={cn(
                                                "w-full text-left p-6 flex items-center justify-between rounded-[2rem] transition-all group border-2",
                                                companyId === company.id 
                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200" 
                                                : "bg-white border-transparent hover:bg-gray-50/80 text-gray-900"
                                            )}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={cn(
                                                    "h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-6 shadow-sm",
                                                    companyId === company.id ? "bg-white/10 border-white/20 text-white" : "bg-white border-gray-100 text-indigo-600"
                                                )}>
                                                    <Building2 className="h-7 w-7" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-black text-lg uppercase tracking-tight leading-none">{company.name}</h3>
                                                    <p className={cn("text-[9px] font-black uppercase tracking-widest", companyId === company.id ? "text-indigo-200" : "text-gray-400")}>
                                                        Authorized Instance
                                                    </p>
                                                </div>
                                            </div>
                                            {companyId === company.id && (
                                                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
                                                    <Check className="h-6 w-6" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="p-12 pt-0 flex justify-center">
                                <Button
                                    variant="ghost"
                                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-black text-[10px] uppercase tracking-widest gap-2 bg-indigo-50/50 rounded-2xl px-8 h-14"
                                    onClick={() => setIsAddingNew(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    Initialize New Environment
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
