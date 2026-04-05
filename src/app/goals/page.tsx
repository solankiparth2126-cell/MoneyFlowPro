"use client";

import dynamic from "next/dynamic";
import { GridSkeleton } from "@/components/universal-skeletons";

const GoalsClient = dynamic(
  () => import("@/components/goals/goals-client").then(m => m.GoalsClient),
  {
    ssr: false,
    loading: () => <GridSkeleton count={4} columns={4} />
  }
);

export default function GoalsPage() {
  return <GoalsClient />;
}
