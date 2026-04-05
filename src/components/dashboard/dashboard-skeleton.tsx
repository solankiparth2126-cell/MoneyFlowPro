"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SummaryCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-0 shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-32 mt-1" />
            <Skeleton className="h-3 w-40 mt-3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DashboardChartsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
      <Card className="lg:col-span-8 border-0 shadow-lg bg-white/50 dark:bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[220px] w-full" />
        </CardContent>
      </Card>
      <Card className="lg:col-span-4 border-0 shadow-lg bg-white/50 dark:bg-gray-900/50">
        <CardHeader className="py-4">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[220px]">
          <Skeleton className="h-40 w-40 rounded-full" />
          <div className="space-y-2 w-full mt-6">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>

      <SummaryCardsSkeleton />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-0 shadow-lg bg-white/50 dark:bg-gray-900/50">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-4 border-0 shadow-lg bg-white/50 dark:bg-gray-900/50">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
