"use client";

import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/universal-skeletons";

const TransactionsClient = dynamic(
  () => import("@/components/transactions/transactions-client").then(m => m.TransactionsClient),
  {
    ssr: false,
    loading: () => <TableSkeleton rows={10} columns={7} />
  }
);

export default function TransactionsPage() {
  return <TransactionsClient />;
}
