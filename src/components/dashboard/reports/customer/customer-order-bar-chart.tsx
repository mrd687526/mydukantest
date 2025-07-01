"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { CustomerOrderReportData } from "@/lib/types";

// Helper to format date for the chart (for monthly periods)
const formatMonth = (period: string) => {
  // Assuming period is 'YYYY-MM'
  const [year, month] = period.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

interface CustomerOrderBarChartProps {
  data: CustomerOrderReportData[];
}

export function CustomerOrderBarChart({ data }: CustomerOrderBarChartProps) {
  // Filter data to only include monthly periods (YYYY-MM)
  const monthlyData = data.filter(item => item.period.length === 7);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis
          dataKey="period"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatMonth}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          labelFormatter={(label: string) => `Month: ${formatMonth(label)}`}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "0.5rem",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          itemStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend />
        <Bar
          dataKey="customer_orders"
          fill="hsl(var(--chart-1))"
          name="Customer Orders"
        />
        <Bar
          dataKey="guest_orders"
          fill="hsl(var(--chart-2))"
          name="Guest Orders"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}