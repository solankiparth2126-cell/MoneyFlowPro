"use client";

import dynamic from "next/dynamic";
import { GridSkeleton } from "@/components/universal-skeletons";

const RecurringClient = dynamic(
  () => import("@/components/recurring/recurring-client").then(m => m.RecurringClient),
  {
    ssr: false,
    loading: () => <GridSkeleton count={3} columns={3} />
  }
);

export default function RecurringPage() {
  return <RecurringClient />;
}
