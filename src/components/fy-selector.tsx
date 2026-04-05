"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinancialYear, getCurrentFinancialYear, getAllTimeRange } from "@/lib/financial-year-utils";
import { CalendarRange, Settings2 } from "lucide-react";
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
        <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-indigo-500" />
            <Select
                value={value?.label || ""}
                onValueChange={(label) => {
                    const selected = options.find(o => o.label === label);
                    if (selected) onValueChange(selected);
                }}
            >
                <SelectTrigger className="w-[140px] h-9 bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/50 focus:ring-indigo-200 dark:focus:ring-indigo-800 text-sm font-medium dark:text-gray-100">
                    <SelectValue placeholder={isLoading ? "Loading..." : "Select Year"} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] dark:bg-gray-900 dark:border-gray-800">
                    <div className="p-1 mb-1 border-b border-indigo-50 dark:border-indigo-900/30">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start text-[11px] h-7 px-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold gap-2"
                            onClick={() => router.push('/masters?tab=fy')}
                        >
                            <Settings2 className="h-3 w-3" />
                            Manage Years
                        </Button>
                    </div>
                    {options.map((fy) => (
                        <SelectItem key={fy.label} value={fy.label} className="text-sm">
                            {fy.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
