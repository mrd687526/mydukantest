"use client";

import {
  LineChart,
  Line,
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

interface CustomerOrderVsGuestChartProps {
  data: CustomerOrderReportData[];
}

export function CustomerOrderVsGuestChart({ data }: CustomerOrderVsGuestChartProps) {
  // Filter data to only include monthly periods (YYYY-MM)
  const monthlyData = data.filter(item => item.period.length === 7);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={monthlyData}>
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
        <Line
          type="monotone"
          dataKey="customer_orders"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Customer Orders"
        />
        <Line
          type="monotone"
          dataKey="guest_orders"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Guest Orders"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}