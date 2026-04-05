"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number, columns?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-9 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <Card className="border-0 shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-md overflow-hidden">
        <CardContent className="p-0">
          <div className="w-full">
            <div className="bg-gray-50/80 dark:bg-gray-800/80 h-10 flex items-center px-4 border-b">
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1 mx-2" />
              ))}
            </div>
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="h-12 flex items-center px-4 border-b border-gray-50 dark:border-gray-800/50">
                {Array.from({ length: columns }).map((_, j) => (
                  <Skeleton key={j} className="h-4 flex-1 mx-2" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function GridSkeleton({ count = 6, columns = 3 }: { count?: number, columns?: number }) {
  const gridClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
  }[columns as 2 | 3 | 4 | 5] || "grid-cols-1 md:grid-cols-3";

  return (
    <div className={`grid gap-6 ${gridClasses}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-0 shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-900/50 p-6 space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-24 w-full" />
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </Card>
  );
}
