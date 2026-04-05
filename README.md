# 💰 MoneyFlow Pro — Ultimate Financial Dashboard

**MoneyFlow Pro** is a high-fidelity, enterprise-grade financial management platform designed for modern professionals and small businesses. Built with a **Zero-Trust** security model and a high-performance **Next.js 16** architecture, it provides absolute data isolation and real-time financial insights.

![GitHub last commit](https://img.shields.io/github/last-commit/solankiparth2126-cell/MoneyFlowPro?style=for-the-badge&color=6366f1)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

---

## ✨ Premium Features

### 📊 Intelligent Analytics
*   **Dynamic Dashboards**: Real-time cash flow visualization using **Recharts**.
*   **Multi-Tenant Isolation**: Securely manage multiple entities/companies with full data separation.
*   **Smart Ledgers**: Categorized accounts for Cash, Bank, and Credit with automated balance tracking.

### 🛡️ Enterprise Security
*   **Supabase-Native Auth**: Secure, managed authentication with **Supabase SSR**.
*   **Zero-Trust Middleware**: Server-side route protection ensuring that every request is pre-verified.
*   **Admin Command Center**: Dedicated management interface for global system control.

### 💼 Financial Mastery
*   **Masters Module**: Configure Categories, Ledgers, and Master Data with granular precision.
*   **Import Engine**: Seamless parsing of **CSV**, **XLSX**, and **PDF** financial statements.
*   **Recurring Engine**: Automated tracking for scheduled income and expenses.
*   **Fiscal Transitions**: One-click year-end closing and financial year rotation logic.

---

## 🛠️ Modern Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | **Next.js 16.2** (App Router, Turbopack) |
| **Backend/DB** | **Supabase** (PostgreSQL, Real-time) |
| **Auth** | **Supabase SSR** (Identity Management) |
| **Styling** | **Tailwind CSS** (Radix UI Primitives) |
| **Animations** | **Framer Motion** (Micro-animations) |
| **Validation** | **Zod** & **React Hook Form** |
| **Data Fetching** | **SWR** (Stale-While-Revalidate) |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js 20+**
- **Supabase Account** (PostgreSQL)

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Launch Development
```bash
npm run dev
```

---

## 📂 Architecture Overview

The system follows a modular, type-safe architecture:
- `src/app`: Modern App Router structure for all views and logic.
- `src/components`: High-fidelity UI library built on **Shadcn**.
- `src/lib`: Core utilities for Supabase client, validations, and data parsing.

Developed with ❤️ by [Parth Solanki](https://github.com/solankiparth2126-cell)
