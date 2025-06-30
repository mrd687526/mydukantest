"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { SalesChart } from "./sales-chart"; // Import the actual chart component

interface DynamicSalesChartWrapperProps {
  data: { day: string; total_sales: number }[];
}

// Dynamically import the chart component with SSR disabled
const DynamicSalesChart = dynamic(
  () => Promise.resolve(SalesChart), // Directly resolve the imported component
  {
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full" />,
  }
);

export function DynamicSalesChartWrapper({ data }: DynamicSalesChartWrapperProps) {
  return <DynamicSalesChart data={data} />;
}