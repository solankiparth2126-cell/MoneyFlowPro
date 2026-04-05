"use client";

import dynamic from "next/dynamic";
import { GridSkeleton } from "@/components/universal-skeletons";

const BudgetsClient = dynamic(
  () => import("@/components/budgets/budgets-client").then(m => m.BudgetsClient),
  {
    ssr: false,
    loading: () => <GridSkeleton count={10} columns={5} />
  }
);

export default function BudgetsPage() {
  return <BudgetsClient />;
}
