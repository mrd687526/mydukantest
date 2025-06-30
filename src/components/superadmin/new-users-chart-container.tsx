"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import the chart component with SSR disabled
const NewUsersChart = dynamic(
  () =>
    import("@/components/superadmin/new-users-chart").then(
      (mod) => mod.NewUsersChart
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full" />,
  }
);

interface NewUsersChartContainerProps {
  data: { day: string; count: number }[];
}

export function NewUsersChartContainer({
  data,
}: NewUsersChartContainerProps) {
  return <NewUsersChart data={data} />;
}