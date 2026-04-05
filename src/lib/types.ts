
export interface Company {
    id: string;
    name: string;
    description?: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive?: boolean;
    panNumber?: string;
    gstNumber?: string;
    bankAccountCount?: number;
    creditCardCount?: number;
    ownerId?: string;
}

export interface User {
    id: string;
    email: string;
    username: string;
    name?: string;
    image?: string;
    role: string;
    status: string;
    rights: string[];
    bankAccountCount?: number;
    creditCardCount?: number;
    createdAt?: number;
}

export interface Ledger {
    id: string;
    name: string;
    description?: string;
    balance: number;
    initialBalance?: number;
    icon: string;
    accountType: 'bank' | 'credit' | 'cash';
    currency?: string;
    companyId: string;
    isDeleted?: boolean;
}

export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense' | 'both';
    icon: string;
    color?: string;
    companyId: string;
    parentId?: string;
    keywords?: string;
    isDeleted?: boolean;
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
    category: string;
    paymentMethod: 'bank' | 'credit' | 'cash';
    ledgerId?: string;
    companyId: string;
    isDeleted?: boolean;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    userId: string;
    username: string;
    action: string;
    module: string;
    details: string;
    companyId: string;
}

export type BudgetStatus = "on-track" | "warning" | "exceeded";

export interface FinancialYear {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    description: string;
}
