"use client";

import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/universal-skeletons";

const AccessControlClient = dynamic(
  () => import("@/components/admin/access-control-client").then(m => m.AccessControlClient),
  {
    ssr: false,
    loading: () => <TableSkeleton rows={10} columns={5} />
  }
);

export default function AccessControlPage() {
  return <AccessControlClient />;
}
