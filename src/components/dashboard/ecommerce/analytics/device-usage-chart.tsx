"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DeviceData {
  x: string; // Device type (e.g., desktop, mobile, tablet)
  y: number; // Count
}

interface DeviceUsageChartProps {
  data: DeviceData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; // Example colors

export function DeviceUsageChart({ data }: DeviceUsageChartProps) {
  // Filter out devices with 0 count to avoid rendering tiny slices
  const filteredData = data.filter(item => item.y > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="y"
          nameKey="x"
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [`${value} visitors`, name]}
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