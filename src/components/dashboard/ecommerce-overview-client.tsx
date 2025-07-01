"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, XCircle, ReceiptText, Users } from "lucide-react";
import { RecentOrdersList } from "./ecommerce/recent-orders-list";
import { Order, DailyOrderCountData, CustomerOrderReportData, TopSellingProductReportData, Product } from "@/lib/types";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerVsGuestChart } from "./ecommerce/customer-vs-guest-chart";
import { TopSellingProductsList } from "./ecommerce/top-selling-products-list";
import { StoreAnalyticsClient } from "./ecommerce/analytics/store-analytics-client"; // Import new component

// Dynamically import the chart component with SSR disabled
const OrderTrendChart = dynamic(
  () =>
    import("./ecommerce/order-trend-chart").then(
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
  customerOrderReports: CustomerOrderReportData[] | null;
  topSellingProducts: (TopSellingProductReportData & { stock_status?: Product['stock_status'] })[] | null;
  profileId: string; // Add profileId prop
}

export function EcommerceOverviewClient({
  totalProducts,
  totalSales,
  totalOrders,
  canceledOrders,
  refundedOrders,
  recentOrders,
  dailyOrderCounts,
  customerOrderReports,
  topSellingProducts,
  profileId, // Destructure profileId
}: EcommerceOverviewClientProps) {
  const totalCustomerOrders = customerOrderReports?.reduce((sum, item) => sum + item.customer_orders, 0) ?? 0;
  const totalGuestOrders = customerOrderReports?.reduce((sum, item) => sum + item.guest_orders, 0) ?? 0;

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

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer vs. Guest Orders</CardTitle>
            <CardDescription>
              Breakdown of orders by registered customers and guest users.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{totalCustomerOrders}</div>
              <p className="text-sm text-muted-foreground">Customer Orders</p>
            </Card>
            <Card className="p-4 text-center">
              <Users className="h-8 w-8 text-secondary-foreground mx-auto mb-2" />
              <div className="text-2xl font-bold">{totalGuestOrders}</div>
              <p className="text-sm text-muted-foreground">Guest Orders</p>
            </Card>
            <div className="col-span-2 pl-2">
              <CustomerVsGuestChart data={customerOrderReports || []} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              Your top 5 products by quantity sold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopSellingProductsList products={topSellingProducts || []} />
          </CardContent>
        </Card>
      </div>

      {/* New Analytics Section */}
      <StoreAnalyticsClient profileId={profileId} />
    </div>
  );
}