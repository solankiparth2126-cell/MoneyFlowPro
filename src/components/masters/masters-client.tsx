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
import { motion } from "framer-motion";

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
            className="container mx-auto py-2 px-2 max-w-7xl space-y-4"
        >
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                    <Building2 className="h-5 w-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">Masters Management</h1>
            </div>

            <Tabs defaultValue={defaultTab} className="space-y-4">
                <TabsList className="bg-muted/50 p-1 h-9">
                    <TabsTrigger value="companies">Companies</TabsTrigger>
                    <TabsTrigger value="fy">Financial Years</TabsTrigger>
                </TabsList>

                <TabsContent value="companies">
                    <Card className="border-0 shadow-xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Company Master</CardTitle>
                            <Button onClick={() => setIsCompanyDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Company</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Company Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingCompany ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-8">Loading...</TableCell></TableRow>
                                    ) : companies.map((c: any) => (
                                        <TableRow key={c.id}>
                                            <TableCell className="font-medium">{c.name}</TableCell>
                                            <TableCell><Badge>{c.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => { setEditingCompanyId(c.id); setCompanyForm(c); setIsCompanyDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="fy">
                    <Card className="border-0 shadow-xl overflow-hidden rounded-[1.5rem]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gray-50/50 dark:bg-gray-800/30">
                            <div>
                                <CardTitle className="text-lg font-bold">Financial Year Master</CardTitle>
                                <CardDescription className="text-xs">Manage accounting periods and start dates.</CardDescription>
                            </div>
                            <Button onClick={() => { setEditingFYId(null); setIsFYDialogOpen(true); }} className="rounded-xl h-9 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md">
                                <Plus className="h-4 w-4 mr-2" /> 
                                Create FY
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-gray-50/30 dark:bg-gray-800/20">
                                    <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                                        <TableHead className="font-bold text-[10px] uppercase tracking-widest py-3">FY Name</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-widest py-3">Period</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-widest py-3">Status</TableHead>
                                        <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest py-3">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingFY ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="animate-spin h-5 w-5 mx-auto text-muted-foreground" /></TableCell></TableRow>
                                    ) : financialYears.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground font-medium italic">No financial years configured.</TableCell></TableRow>
                                    ) : financialYears.map((fy: any) => (
                                        <TableRow key={fy.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors border-b border-gray-50 dark:border-gray-800">
                                            <TableCell className="font-black text-xs text-gray-900 dark:text-gray-100">{fy.name}</TableCell>
                                            <TableCell className="text-[11px] font-mono font-bold text-gray-500">
                                                {fy.startDate} <span className="mx-1 text-gray-300">→</span> {fy.endDate}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`rounded-lg px-2 py-0 border-0 font-bold text-[10px] ${fy.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {fy.isActive ? 'Current' : 'Closed'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => { setEditingFYId(fy.id); setFyForm(fy); setIsFYDialogOpen(true); }} className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm"><Pencil className="h-3.5 w-3.5" /></Button>
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
                <DialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-8 max-w-md">
                    <form onSubmit={handleSaveCompany}>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <Building2 className="h-6 w-6 text-indigo-600" />
                                {editingCompanyId ? 'Update Company' : 'New Company'}
                            </DialogTitle>
                            <DialogDescription className="font-medium text-gray-500 py-2">
                                Configure your primary business workspace and contact details.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Business Name</Label>
                                <Input value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} placeholder="e.g. Acme Corp" required className="rounded-xl h-11 border-gray-200" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</Label>
                                <Textarea value={companyForm.description} onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })} placeholder="General business info..." className="rounded-xl min-h-[80px] border-gray-200" />
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl h-12 font-bold bg-indigo-600 hover:bg-indigo-700">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Workspace'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* FY Dialog */}
            <Dialog open={isFYDialogOpen} onOpenChange={setIsFYDialogOpen}>
                <DialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-8 max-w-md">
                    <form onSubmit={handleSaveFY}>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <Calendar className="h-6 w-6 text-indigo-600" />
                                {editingFYId ? 'Edit FY' : 'New Financial Year'}
                            </DialogTitle>
                            <DialogDescription className="font-medium text-gray-500 py-2">
                                Define the accounting period for tracking balance history.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Period Name</Label>
                                <Input value={fyForm.name} onChange={e => setFyForm({ ...fyForm, name: e.target.value })} placeholder="e.g. FY 2024-25" required className="rounded-xl h-11 border-gray-200" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Starts On</Label>
                                    <Input type="date" value={fyForm.startDate} onChange={e => setFyForm({ ...fyForm, startDate: e.target.value })} required className="rounded-xl h-11 border-gray-200" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Ends On</Label>
                                    <Input type="date" value={fyForm.endDate} onChange={e => setFyForm({ ...fyForm, endDate: e.target.value })} required className="rounded-xl h-11 border-gray-200" />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl h-12 font-bold bg-indigo-600 hover:bg-indigo-700">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Period'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
