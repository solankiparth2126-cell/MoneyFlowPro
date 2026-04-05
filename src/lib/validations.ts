import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const transactionSchema = z.object({
  description: z.string().min(1, "Description is required").max(100, "Description too long"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  ledgerId: z.string().optional(),
  type: z.enum(["income", "expense"]),
  paymentMethod: z.enum(["bank", "credit", "cash"]).default("bank"),
});

export const ledgerSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  description: z.string().max(200, "Description too long").optional(),
  initialBalance: z.coerce.number(),
  balance: z.coerce.number().optional(),
  icon: z.string().default("Wallet"),
  accountType: z.enum(["bank", "credit", "cash"]).default("bank"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  type: z.enum(["income", "expense", "both"]).default("expense"),
  icon: z.string().default("Tag"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color hex").default("#6366f1"),
  keywords: z.string().max(500, "Keywords too long").optional(),
  parentId: z.string().optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type TransactionValues = z.infer<typeof transactionSchema>;
export type LedgerValues = z.infer<typeof ledgerSchema>;
export type CategoryValues = z.infer<typeof categorySchema>;
