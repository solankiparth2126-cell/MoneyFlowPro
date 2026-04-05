"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinancialYear, getCurrentFinancialYear, getAllTimeRange } from "@/lib/financial-year-utils";
import { CalendarRange, Settings2, Sparkles } from "lucide-react";
import { useFinancialYears } from "@/hooks/use-masters";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface FYSelectorProps {
    value: FinancialYear;
    onValueChange: (fy: FinancialYear) => void;
}

export function FYSelector({ value, onValueChange }: FYSelectorProps) {
    const { financialYears, isLoading } = useFinancialYears();
    const router = useRouter();
    const allTime = getAllTimeRange();

    // Map DB years to the FinancialYear interface format
    const dbOptions: FinancialYear[] = financialYears.map(fy => ({
        label: fy.name,
        startDate: fy.startDate,
        endDate: fy.endDate
    }));

    // Fallback if DB is empty: show at least the current calculated FY
    const options = [allTime, ...(dbOptions.length > 0 ? dbOptions : [getCurrentFinancialYear()])];

    return (
        <div className="flex items-center gap-3">
             <div className="hidden md:flex h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-xl items-center justify-center text-indigo-600 shadow-sm transition-transform hover:rotate-12">
                <CalendarRange className="h-5 w-5" />
            </div>
            <Select
                value={value?.label || ""}
                onValueChange={(label) => {
                    const selected = options.find(o => o.label === label);
                    if (selected) onValueChange(selected);
                }}
            >
                <SelectTrigger className="w-[180px] h-12 bg-white border-gray-100 rounded-[1.2rem] shadow-sm focus:ring-2 focus:ring-indigo-100 text-xs font-black uppercase tracking-widest text-gray-900 group hover:border-indigo-200 transition-all">
                    <SelectValue placeholder={isLoading ? "Syncing..." : "Select Period"} />
                </SelectTrigger>
                <SelectContent className="max-h-[350px] rounded-[1.5rem] border-0 shadow-2xl p-2 overflow-hidden">
                    <div className="p-1 mb-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-center text-[9px] h-9 px-4 rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-black uppercase tracking-[0.2em] gap-2 border border-dashed border-indigo-100 shadow-sm"
                            onClick={() => router.push('/masters?tab=fy')}
                        >
                            <Settings2 className="h-3 w-3" />
                            Manage Cycles
                        </Button>
                    </div>
                    {options.map((fy) => (
                        <SelectItem key={fy.label} value={fy.label} className="rounded-xl py-3 px-4 font-black text-[10px] uppercase tracking-widest text-gray-400 focus:text-indigo-600 focus:bg-indigo-50 transition-colors">
                            {fy.label}
                        </SelectItem>
                    ))}
                    <div className="mt-2 p-2 bg-indigo-600/5 rounded-xl border border-indigo-100/50 flex items-center justify-center gap-2">
                         <Sparkles className="h-3 w-3 text-indigo-400" />
                         <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Verified Period</span>
                    </div>
                </SelectContent>
            </Select>
        </div>
    );
}
