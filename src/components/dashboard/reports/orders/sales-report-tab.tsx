"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SalesSummaryReportData } from "@/lib/types";
import { DollarSign, ShoppingCart, Package, Percent } from "lucide-react";

interface SalesReportTabProps {
  salesSummary: SalesSummaryReportData | null;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export function SalesReportTab({ salesSummary }: SalesReportTabProps) {
  if (!salesSummary) {
    return <div className="text-center py-8 text-muted-foreground">No sales data available for the selected period.</div>;
  }

  const data = [
    {
      title: "Gross Sales",
      value: formatCurrency(salesSummary.total_gross_sales),
      description: "Total sales before discounts and returns.",
      icon: DollarSign,
    },
    {
      title: "Net Sales",
      value: formatCurrency(salesSummary.total_net_sales),
      description: "Sales after discounts and returns.",
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: salesSummary.total_orders.toString(),
      description: "Number of orders placed.",
      icon: ShoppingCart,
    },
    {
      title: "Items Purchased",
      value: salesSummary.total_items_sold.toString(),
      description: "Total quantity of items sold.",
      icon: Package,
    },
    {
      title: "Shipping Charges",
      value: formatCurrency(salesSummary.total_shipping_charges),
      description: "Total collected from shipping.",
      icon: DollarSign,
    },
    {
      title: "Coupons Used",
      value: formatCurrency(salesSummary.total_coupons_used),
      description: "Total value of discounts applied.",
      icon: Percent,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
      {/* Placeholder for line graph comparing Gross vs. Net Sales */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Gross vs. Net Sales Trend</CardTitle>
          <CardDescription>Monthly trend of gross and net sales.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* This would be a Recharts LineChart component, similar to others */}
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            (Chart implementation goes here - requires more detailed time-series data from backend)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}