"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, XCircle, ReceiptText } from "lucide-react";
import { RecentOrdersList } from "./recent-orders-list";
import { Order, DailyOrderCountData } from "@/lib/types";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import the chart component with SSR disabled
const OrderTrendChart = dynamic(
  () =>
    import("./order-trend-chart").then(
      (mod) => mod.OrderTrendChart
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full" />,
  }
);

interface EcommerceOverviewClientProps {
  totalProducts: number | null;
  totalSales: number | null;
  totalOrders: number | null;
  canceledOrders: number | null;
  refundedOrders: number | null;
  recentOrders: Order[] | null;
  dailyOrderCounts: DailyOrderCountData[] | null;
}

export function EcommerceOverviewClient({
  totalProducts,
  totalSales,
  totalOrders,
  canceledOrders,
  refundedOrders,
  recentOrders,
  dailyOrderCounts,
}: EcommerceOverviewClientProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalSales ?? 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue from delivered orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              All-time orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts ?? 0}</div>
            <p className="text-xs text-muted-foreground">
            Products in your store
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceled Orders</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{canceledOrders ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              All-time canceled orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunded Orders</CardTitle>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{refundedOrders ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Approved refund requests
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Trends (Last 7 Days)</CardTitle>
            <CardDescription>
              Daily count of orders received.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OrderTrendChart data={dailyOrderCounts || []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              The 5 most recent orders placed in your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrdersList orders={recentOrders || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}