"use client";

import { useState, useEffect } from "react";
import { format, subDays, subMonths, subYears, startOfYear, endOfYear, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import dynamic from "next/dynamic";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import { getSalesSummaryReport, getTopSalesReports, getDownloadableProductsSales } from "@/app/actions/reports";
import { SalesSummaryReportData, TopSellingProductReportData, TopSellingCategoryReportData, DownloadableProductSalesData } from "@/lib/types";

// Dynamically import tab content components
const SalesReportTab = dynamic(
  () => import("./sales-report-tab").then((mod) => mod.SalesReportTab),
  { ssr: false, loading: () => <Skeleton className="h-[400px] w-full" /> }
);
const ProductsReportTab = dynamic(
  () => import("./products-report-tab").then((mod) => mod.ProductsReportTab),
  { ssr: false, loading: () => <Skeleton className="h-[400px] w-full" /> }
);
const CategoriesReportTab = dynamic(
  () => import("./categories-report-tab").then((mod) => mod.CategoriesReportTab),
  { ssr: false, loading: () => <Skeleton className="h-[400px] w-full" /> }
);
const DownloadableReportTab = dynamic(
  () => import("./downloadable-report-tab").then((mod) => mod.DownloadableReportTab),
  { ssr: false, loading: () => <Skeleton className="h-[400px] w-full" /> }
);

interface OrderReportsClientProps {
  initialSalesSummary: SalesSummaryReportData | null;
  initialTopSellingProducts: TopSellingProductReportData[];
  initialTopSellingCategories: TopSellingCategoryReportData[];
  initialDownloadableProductsSales: DownloadableProductSalesData[];
}

export function OrderReportsClient({
  initialSalesSummary,
  initialTopSellingProducts,
  initialTopSellingCategories,
  initialDownloadableProductsSales,
}: OrderReportsClientProps) {
  const [salesSummary, setSalesSummary] = useState<SalesSummaryReportData | null>(initialSalesSummary);
  const [topSellingProducts, setTopSellingProducts] = useState<TopSellingProductReportData[]>(initialTopSellingProducts);
  const [topSellingCategories, setTopSellingCategories] = useState<TopSellingCategoryReportData[]>(initialTopSellingCategories);
  const [downloadableProductsSales, setDownloadableProductsSales] = useState<DownloadableProductSalesData[]>(initialDownloadableProductsSales);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [activeFilter, setActiveFilter] = useState<string>('last_month');

  const fetchData = async (start: string, end: string) => {
    setLoading(true);
    const [
      salesSummaryRes,
      topSalesRes,
      downloadableSalesRes,
    ] = await Promise.all([
      getSalesSummaryReport({ startDate: start, endDate: end }),
      getTopSalesReports({ startDate: start, endDate: end }),
      getDownloadableProductsSales({ startDate: start, endDate: end }),
    ]);

    if (salesSummaryRes.error) {
      toast.error("Failed to fetch sales summary", { description: salesSummaryRes.error });
      setSalesSummary(null);
    } else {
      setSalesSummary(salesSummaryRes.data || null);
    }

    if (topSalesRes.error) {
      toast.error("Failed to fetch top sales reports", { description: topSalesRes.error });
      setTopSellingProducts([]);
      setTopSellingCategories([]);
    } else {
      setTopSellingProducts(topSalesRes.topSellingProducts || []);
      setTopSellingCategories(topSalesRes.topSellingCategories || []);
    }

    if (downloadableSalesRes.error) {
      toast.error("Failed to fetch downloadable products sales", { description: downloadableSalesRes.error });
      setDownloadableProductsSales([]);
    } else {
      setDownloadableProductsSales(downloadableSalesRes.data || []);
    }

    setLoading(false);
  };

  const handleFilterChange = (filterType: string) => {
    setActiveFilter(filterType);
    let newStartDate = '';
    let newEndDate = '';

    const today = new Date();

    switch (filterType) {
      case 'year':
        newStartDate = format(startOfYear(today), 'yyyy-MM-dd');
        newEndDate = format(endOfYear(today), 'yyyy-MM-dd');
        break;
      case 'last_month':
        newStartDate = format(startOfMonth(subMonths(today, 1)), 'yyyy-MM-dd');
        newEndDate = format(endOfMonth(subMonths(today, 1)), 'yyyy-MM-dd');
        break;
      case 'this_month':
        newStartDate = format(startOfMonth(today), 'yyyy-MM-dd');
        newEndDate = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case 'last_7_days':
        newStartDate = format(subDays(today, 6), 'yyyy-MM-dd');
        newEndDate = format(today, 'yyyy-MM-dd');
        break;
      default:
        newStartDate = startDate;
        newEndDate = endDate;
        break;
    }
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    fetchData(newStartDate, newEndDate);
  };

  const handleGenerateReport = () => {
    fetchData(startDate, endDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button
          variant={activeFilter === 'year' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('year')}
        >
          Year
        </Button>
        <Button
          variant={activeFilter === 'last_month' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('last_month')}
        >
          Last month
        </Button>
        <Button
          variant={activeFilter === 'this_month' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('this_month')}
        >
          This month
        </Button>
        <Button
          variant={activeFilter === 'last_7_days' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('last_7_days')}
        >
          Last 7 days
        </Button>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setActiveFilter('custom');
          }}
          className="w-auto"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setActiveFilter('custom');
          }}
          className="w-auto"
        />
        <Button onClick={handleGenerateReport} disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="downloadable">Downloadable</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Key sales metrics for the selected period.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-[300px] w-full" /> : <SalesReportTab salesSummary={salesSummary} />}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Your best-performing products by sales amount and quantity.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-[300px] w-full" /> : <ProductsReportTab products={topSellingProducts} />}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Categories</CardTitle>
              <CardDescription>Sales performance broken down by product category.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-[300px] w-full" /> : <CategoriesReportTab categories={topSellingCategories} />}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="downloadable">
          <Card>
            <CardHeader>
              <CardTitle>Downloadable Products Sales</CardTitle>
              <CardDescription>Sales data specifically for your digital products.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-[300px] w-full" /> : <DownloadableReportTab products={downloadableProductsSales} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}