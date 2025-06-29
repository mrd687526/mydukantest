"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import the chart component with SSR disabled
const ActionsChart = dynamic(
  () =>
    import("@/components/dashboard/actions-chart").then(
      (mod) => mod.ActionsChart
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full" />,
  }
);

interface DashboardChartContainerProps {
  data: { day: string; count: number }[];
}

export function DashboardChartContainer({
  data,
}: DashboardChartContainerProps) {
  return <ActionsChart data={data} />;
}