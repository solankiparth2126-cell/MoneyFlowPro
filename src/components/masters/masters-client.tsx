"use client"

import { useState, useEffect } from "react"
import { useCompanies, useFinancialYears } from "@/hooks/use-masters"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, Plus, Pencil, Trash2, Loader2, Save } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/context/auth-context"
import { usePermissions } from "@/hooks/use-permissions";
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function MastersClient() {
    const { user } = useAuth();
    const { canCreate, canEdit, canDelete } = usePermissions();
    const { toast } = useToast()
    const searchParams = useSearchParams()
    const defaultTab = searchParams.get('tab') || 'companies'

    // Company State
    const { 
        companies, 
        isLoading: loadingCompany, 
        create: createCompany, 
        update: updateCompany, 
        remove: removeCompany 
    } = useCompanies();
    
    const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false)
    const [editingCompanyId, setEditingCompanyId] = useState<any | null>(null)
    const [companyForm, setCompanyForm] = useState<any>({
        name: "", description: "", panNumber: "", gstNumber: "",
        address: "", contactEmail: "", contactPhone: "", isActive: true
    })

    // FY State
    const { 
        financialYears, 
        isLoading: loadingFY, 
        create: createFY, 
        update: updateFY, 
        remove: removeFY 
    } = useFinancialYears();

    const [isFYDialogOpen, setIsFYDialogOpen] = useState(false)
    const [editingFYId, setEditingFYId] = useState<any | null>(null)
    const [fyForm, setFyForm] = useState<any>({
        name: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        isActive: true,
        description: ""
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (user && !canCreate("ADMIN", "MASTERS")) {
            toast({ variant: "destructive", title: "Access Denied", description: "Administrator privileges required." });
            window.location.href = "/";
        }
    }, [user, canCreate, toast]);

    // Handlers
    const handleSaveCompany = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.id) return;
        setIsSubmitting(true)
        try {
            if (editingCompanyId) {
                await updateCompany({ id: editingCompanyId, ...companyForm })
                toast({ title: "Success", description: "Company updated" })
            } else {
                await createCompany({ ...companyForm, ownerId: user.id })
                toast({ title: "Success", description: "Company created" })
            }
            setIsCompanyDialogOpen(false)
        } catch (e) {
            toast({ variant: "destructive", title: "Error" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSaveFY = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editingFYId) {
                await updateFY({ id: editingFYId, ...fyForm })
                toast({ title: "Success", description: "FY updated" })
            } else {
                await createFY(fyForm)
                toast({ title: "Success", description: "FY created" })
            }
            setIsFYDialogOpen(false)
        } catch (e) {
            toast({ variant: "destructive", title: "Error" })
        } finally {
            setIsSubmitting(false)
        }
    }

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
      className="space-y-8 p-1"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
           <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase leading-none">
             Masters Management
           </h1>
           <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-3 ml-1">
             Global configuration for your financial ecosystem
           </p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="bg-gray-100/50 p-1.5 h-14 rounded-2xl border border-gray-100 gap-2">
          <TabsTrigger 
            value="companies" 
            className="rounded-xl px-8 h-11 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-100/50 transition-all"
          >
            Companies
          </TabsTrigger>
          <TabsTrigger 
            value="fy" 
            className="rounded-xl px-8 h-11 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-100/50 transition-all"
          >
            Financial Years
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="mt-0">
          <Card className="rounded-[2.5rem] border-gray-100 shadow-xl shadow-gray-200/20 bg-white overflow-hidden">
            <header className="flex flex-col md:flex-row md:items-center justify-between p-8 border-b border-gray-50 gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 uppercase">Company Master</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Manage multiple business entities</p>
              </div>
              <Button 
                onClick={() => setIsCompanyDialogOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 rounded-xl shadow-lg shadow-indigo-100 font-black uppercase tracking-widest text-[10px] gap-2 transition-all"
              >
                <Plus className="h-4 w-4" /> Add Company
              </Button>
            </header>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-b border-gray-50">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">Company Name</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">Contact Info</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">Status</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase tracking-widest py-6 px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingCompany ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-24"><Loader2 className="animate-spin h-10 w-10 mx-auto text-indigo-600" /></TableCell></TableRow>
                  ) : companies.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-24 text-gray-300 font-black uppercase tracking-widest text-xs">No companies configured</TableCell></TableRow>
                  ) : companies.map((c: any) => (
                    <TableRow key={c.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0 group">
                      <TableCell className="px-8 py-6">
                        <div className="font-black text-gray-900 uppercase tracking-tight">{c.name}</div>
                        <div className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">{c.gstNumber || 'NO GST'}</div>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <div className="text-[11px] font-bold text-gray-600">{c.contactEmail || 'No Email'}</div>
                        <div className="text-[10px] font-bold text-gray-400 mt-0.5">{c.contactPhone || 'No Phone'}</div>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <Badge className={cn(
                          "rounded-lg font-black uppercase tracking-widest text-[9px] px-2.5 py-1 border-0",
                          c.isActive ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400"
                        )}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-8 py-6">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl text-gray-300 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all"
                          onClick={() => { setEditingCompanyId(c.id); setCompanyForm(c); setIsCompanyDialogOpen(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fy" className="mt-0">
          <Card className="rounded-[2.5rem] border-gray-100 shadow-xl shadow-gray-200/20 bg-white overflow-hidden">
            <header className="flex flex-col md:flex-row md:items-center justify-between p-8 border-b border-gray-50 gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 uppercase">Financial Year Master</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Configure accounting periods</p>
              </div>
              <Button 
                onClick={() => { setEditingFYId(null); setIsFYDialogOpen(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 rounded-xl shadow-lg shadow-indigo-100 font-black uppercase tracking-widest text-[10px] gap-2 transition-all"
              >
                <Plus className="h-4 w-4" /> Create FY
              </Button>
            </header>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-b border-gray-50">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">FY Name</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">Period Range</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 px-8">Status</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase tracking-widest py-6 px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingFY ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-24"><Loader2 className="animate-spin h-10 w-10 mx-auto text-indigo-600" /></TableCell></TableRow>
                  ) : financialYears.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-24 text-gray-300 font-black uppercase tracking-widest text-xs">No periods configured</TableCell></TableRow>
                  ) : financialYears.map((fy: any) => (
                    <TableRow key={fy.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0 group">
                      <TableCell className="px-8 py-6 font-black text-gray-900 uppercase tracking-tight text-sm">{fy.name}</TableCell>
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-gray-500">
                          {fy.startDate} <span className="text-gray-200">→</span> {fy.endDate}
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <Badge className={cn(
                          "rounded-lg font-black uppercase tracking-widest text-[9px] px-2.5 py-1 border-0",
                          fy.isActive ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400"
                        )}>
                          {fy.isActive ? 'Current' : 'Closed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-8 py-6">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl text-gray-300 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all"
                          onClick={() => { setEditingFYId(fy.id); setFyForm(fy); setIsFYDialogOpen(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Company Dialog */}
      <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
        <DialogContent className="sm:max-w-[540px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl bg-white">
          <div className="p-8 pb-4">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                  <Building2 className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                    {editingCompanyId ? 'Update Entity' : 'New Entity'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 text-xs font-semibold">
                    Configure business workspace & compliance.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={handleSaveCompany} className="px-8 pb-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Business Name</label>
                <Input 
                  value={companyForm.name} 
                  onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} 
                  placeholder="e.g. Acme Financial Group" 
                  required 
                  className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-gray-900" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">PAN Number</label>
                <Input value={companyForm.panNumber} onChange={e => setCompanyForm({ ...companyForm, panNumber: e.target.value })} placeholder="ABCDE1234F" className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold uppercase" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">GST Number</label>
                <Input value={companyForm.gstNumber} onChange={e => setCompanyForm({ ...companyForm, gstNumber: e.target.value })} placeholder="22AAAAA0000A1Z5" className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold uppercase" />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Description</label>
                <Textarea value={companyForm.description} onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })} placeholder="General business context..." className="rounded-xl min-h-[80px] border-gray-100 bg-gray-50/50 font-bold text-sm" />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all font-black text-lg uppercase tracking-widest">
              {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Save Entity'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* FY Dialog */}
      <Dialog open={isFYDialogOpen} onOpenChange={setIsFYDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl bg-white">
          <div className="p-8 pb-4">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                    {editingFYId ? 'Update FY' : 'New period'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 text-xs font-semibold">
                    Set up accounting period.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={handleSaveFY} className="px-8 pb-8 space-y-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Period Name</label>
              <Input 
                value={fyForm.name} 
                onChange={e => setFyForm({ ...fyForm, name: e.target.value })} 
                placeholder="e.g. FY 2024-2025" 
                required 
                className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-gray-900 uppercase" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Starts On</label>
                <Input type="date" value={fyForm.startDate} onChange={e => setFyForm({ ...fyForm, startDate: e.target.value })} required className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Ends On</label>
                <Input type="date" value={fyForm.endDate} onChange={e => setFyForm({ ...fyForm, endDate: e.target.value })} required className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold" />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all font-black text-lg uppercase tracking-widest">
              {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Activate Period'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
    );
}
