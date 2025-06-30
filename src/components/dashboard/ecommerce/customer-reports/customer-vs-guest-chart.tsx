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

// Helper to format date for the chart (for daily periods)
const formatDate = (period: string) => {
  // Assuming period is 'YYYY-MM-DD'
  const date = new Date(period);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

interface CustomerVsGuestChartProps {
  data: CustomerOrderReportData[];
}

export function CustomerVsGuestChart({ data }: CustomerVsGuestChartProps) {
  // Filter data to only include daily periods (YYYY-MM-DD)
  const dailyData = data.filter(item => item.period.length === 10);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={dailyData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis
          dataKey="period"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatDate}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          labelFormatter={(label: string) => `Date: ${formatDate(label)}`}
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