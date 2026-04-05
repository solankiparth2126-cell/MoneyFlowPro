"use client";

import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/universal-skeletons";

const UsersClient = dynamic(
  () => import("@/components/admin/users-client").then(m => m.UsersClient),
  {
    ssr: false,
    loading: () => <TableSkeleton rows={10} columns={5} />
  }
);

export default function UserManagementPage() {
  return <UsersClient />;
}
