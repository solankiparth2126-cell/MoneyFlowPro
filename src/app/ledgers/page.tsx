"use client";

import dynamic from "next/dynamic";
import { GridSkeleton } from "@/components/universal-skeletons";

const LedgersClient = dynamic(
  () => import("@/components/ledgers/ledgers-client").then(m => m.LedgersClient),
  {
    ssr: false,
    loading: () => <GridSkeleton count={8} columns={4} />
  }
);

export default function LedgersPage() {
  return <LedgersClient />;
}
