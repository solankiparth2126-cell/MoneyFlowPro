"use client";

import dynamic from "next/dynamic";
import { GridSkeleton } from "@/components/universal-skeletons";

const CategoriesClient = dynamic(
  () => import("@/components/categories/categories-client").then(m => m.CategoriesClient),
  {
    ssr: false,
    loading: () => <GridSkeleton count={15} columns={5} />
  }
);

export default function CategoriesPage() {
  return <CategoriesClient />;
}
