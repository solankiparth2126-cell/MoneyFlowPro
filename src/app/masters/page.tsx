"use client";

import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/universal-skeletons";

const MastersClient = dynamic(
  () => import("@/components/masters/masters-client").then(m => m.MastersClient),
  {
    ssr: false,
    loading: () => <TableSkeleton rows={8} columns={5} />
  }
);

export default function MastersPage() {
  return <MastersClient />;
}
