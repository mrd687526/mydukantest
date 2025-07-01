"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketingOverviewClient } from "./marketing-overview-client";
import { EcommerceOverviewClient } from "./ecommerce-overview-client";
import { Order, DailyOrderCountData, CustomerOrderReportData, TopSellingProductReportData, Product } from "@/lib/types";

interface DashboardTabsClientProps {
  marketingData: {
    actionCount: number | null;
    campaignCount: number | null;
    accountCount: number | null;
    recentActions: {
      action_taken: string | null;
      associated_keyword: string | null;
      sent_at: string;
    }[] | null;
    dailyCountsData: { day: string; count: number }[] | null;
  };
  ecommerceData: {
    totalProducts: number | null;
    totalSales: number | null;
    totalOrders: number | null;
    canceledOrders: number | null;
    refundedOrders: number | null;
    recentOrders: Order[] | null;
    dailyOrderCounts: DailyOrderCountData[] | null;
    customerOrderReports: CustomerOrderReportData[] | null;
    topSellingProducts: (TopSellingProductReportData & { stock_status?: Product['stock_status'] })[] | null;
  };
}

export function DashboardTabsClient({ marketingData, ecommerceData }: DashboardTabsClientProps) {
  return (
    <Tabs defaultValue="ecommerce" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="ecommerce">E-Commerce Overview</TabsTrigger>
        <TabsTrigger value="marketing">Marketing Overview</TabsTrigger>
      </TabsList>
      <TabsContent value="ecommerce" className="mt-4">
        <EcommerceOverviewClient {...ecommerceData} />
      </TabsContent>
      <TabsContent value="marketing" className="mt-4">
        <MarketingOverviewClient {...marketingData} />
      </TabsContent>
    </Tabs>
  );
}