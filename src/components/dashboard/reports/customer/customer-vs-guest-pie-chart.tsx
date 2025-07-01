"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { CustomerOrderReportData } from "@/lib/types";

interface CustomerVsGuestPieChartProps {
  data: CustomerOrderReportData[];
}

export function CustomerVsGuestPieChart({ data }: CustomerVsGuestPieChartProps) {
  const totalCustomerOrders = data.reduce((sum, item) => sum + item.customer_orders, 0);
  const totalGuestOrders = data.reduce((sum, item) => sum + item.guest_orders, 0);

  const pieData = [
    { name: "Customer Orders", value: totalCustomerOrders },
    { name: "Guest Orders", value: totalGuestOrders },
  ];

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [`${value} orders`, name]}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "0.5rem",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          itemStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}