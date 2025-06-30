"use client";

import { useState, useEffect } from "react";
import { format, subDays, subMonths, subYears, startOfYear, endOfYear, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { toast } from "sonner";
import Image from "next/image";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getTopSalesReports } from "@/app/actions/reports";
import { TopPaymentMethodReportData, TopSellingProductReportData, TopSellingCategoryReportData, TopSellingBrandReportData } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TopSalesReportsClientProps {
  initialTopPaymentMethods: TopPaymentMethodReportData[];
  initialTopSellingProducts: TopSellingProductReportData[];
  initialTopSellingCategories: TopSellingCategoryReportData[];
  initialTopSellingBrands: TopSellingBrandReportData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export function TopSalesReportsClient({
  initialTopPaymentMethods,
  initialTopSellingProducts,
  initialTopSellingCategories,
  initialTopSellingBrands,
}: TopSalesReportsClientProps) {
  const [topPaymentMethods, setTopPaymentMethods] = useState<TopPaymentMethodReportData[]>(initialTopPaymentMethods);
  const [topSellingProducts, setTopSellingProducts] = useState<TopSellingProductReportData[]>(initialTopSellingProducts);
  const [topSellingCategories, setTopSellingCategories] = useState<TopSellingCategoryReportData[]>(initialTopSellingCategories);
  const [topSellingBrands, setTopSellingBrands] = useState<TopSellingBrandReportData[]>(initialTopSellingBrands);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [activeFilter, setActiveFilter] = useState<string>('last_month');

  const fetchData = async (start: string, end: string) => {
    setLoading(true);
    const result = await getTopSalesReports({ startDate: start, endDate: end });
    if (result.error) {
      toast.error("Failed to fetch reports", { description: result.error });
      setTopPaymentMethods([]);
      setTopSellingProducts([]);
      setTopSellingCategories([]);
      setTopSellingBrands([]);
    } else {
      setTopPaymentMethods(result.topPaymentMethods || []);
      setTopSellingProducts(result.topSellingProducts || []);
      setTopSellingCategories(result.topSellingCategories || []);
      setTopSellingBrands(result.topSellingBrands || []);
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

  const renderContent = (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSellingProducts.length > 0 ? topSellingProducts.map((p) => (
                <TableRow key={p.product_id}>
                  <TableCell className="flex items-center gap-2">
                    {p.product_image_url ? (
                      <Image src={p.product_image_url} alt={p.product_name} width={40} height={40} className="rounded-md object-cover" />
                    ) : <div className="w-10 h-10 bg-muted rounded-md" />}
                    <span className="font-medium">{p.product_name}</span>
                  </TableCell>
                  <TableCell className="text-right">{p.total_quantity_sold}</TableCell>
                  <TableCell className="text-right">{formatCurrency(p.total_sales_amount)}</TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={3} className="text-center h-24">No data available.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPaymentMethods.length > 0 ? topPaymentMethods.map((p) => (
                <TableRow key={p.payment_method}>
                  <TableCell className="font-medium capitalize">{p.payment_method}</TableCell>
                  <TableCell className="text-right">{p.total_orders}</TableCell>
                  <TableCell className="text-right">{formatCurrency(p.total_amount)}</TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={3} className="text-center h-24">No data available.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSellingCategories.length > 0 ? topSellingCategories.map((c) => (
                <TableRow key={c.category_name}>
                  <TableCell className="font-medium">{c.category_name}</TableCell>
                  <TableCell className="text-right">{c.total_quantity_sold}</TableCell>
                  <TableCell className="text-right">{formatCurrency(c.total_sales_amount)}</TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={3} className="text-center h-24">No data available.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Brands</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSellingBrands.length > 0 ? topSellingBrands.map((b) => (
                <TableRow key={b.brand_name}>
                  <TableCell className="font-medium">{b.brand_name}</TableCell>
                  <TableCell className="text-right">{b.total_quantity_sold}</TableCell>
                  <TableCell className="text-right">{formatCurrency(b.total_sales_amount)}</TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={3} className="text-center h-24">No data available.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

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

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        </div>
      ) : renderContent}
    </div>
  );
}