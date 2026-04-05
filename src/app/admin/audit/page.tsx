"use client";

import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/universal-skeletons";

const AuditClient = dynamic(
  () => import("@/components/admin/audit-client").then(m => m.AuditClient),
  {
    ssr: false,
    loading: () => <TableSkeleton rows={15} columns={5} />
  }
);

export default function SystemAuditPage() {
  return <AuditClient />;
}
