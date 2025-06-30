"use client";

import { useState, useEffect } from "react";
import { format, subDays, subMonths, subYears, startOfYear, endOfYear, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import Image from "next/image";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  useEffect(() => {
    // Initial fetch is handled by server component.
    // This useEffect is for subsequent filter changes.
  }, []);

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
        // For custom date, use current state
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
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('all')}
        >
          All Products
        </Button>
        <Button
          variant={activeFilter === 'low_stock' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('low_stock')}
        >
          Low in Stock
        </Button>
        <Button
          variant={activeFilter === 'out_of_stock' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('out_of_stock')}
        >
          Out of Stock
        </Button>
        <Button
          variant={activeFilter === 'most_stocked' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('most_stocked')}
        >
          Most Stocked
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Stock Overview</CardTitle>
          <CardDescription>
            View and manage your product inventory based on stock levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              Loading products...
            </div>
          ) : (
            <StockReportsDataTable data={products} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}