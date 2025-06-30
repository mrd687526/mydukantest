"use client";

import { useState, useEffect } from "react";
import { format, subDays, subMonths, subYears, startOfYear, endOfYear, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { toast } from "sonner";
import dynamic from "next/dynamic";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getTopSalesReports } from "@/app/actions/reports";
import { TopPaymentMethodReportData } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Placeholder components for reports not yet supported by schema
function TopSellingProductsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Top products by sales volume.</CardDescription>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground py-8">
        No Data Found. Requires an 'order_items' table to track individual product sales.
      </CardContent>
    </Card>
  );
}

function TopSellingCategoryCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Category</CardTitle>
        <CardDescription>Top categories by sales volume.</CardDescription>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground py-8">
        No Data Found. Requires an 'order_items' table to track individual product sales.
      </CardContent>
    </Card>
  );
}

function TopSellingBrandCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Brand</CardTitle>
        <CardDescription>Top brands by sales volume.</CardDescription>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground py-8">
        No Data Found. Requires an 'order_items' table to track individual product sales.
      </CardContent>
    </Card>
  );
}

interface TopSalesReportsClientProps {
  initialTopPaymentMethods: TopPaymentMethodReportData[];
}

export function TopSalesReportsClient({ initialTopPaymentMethods }: TopSalesReportsClientProps) {
  const [topPaymentMethods, setTopPaymentMethods] = useState<TopPaymentMethodReportData[]>(initialTopPaymentMethods);
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
    } else {
      setTopPaymentMethods(result.topPaymentMethods || []);
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <TopSellingProductsCard />
        <TopSellingCategoryCard />
        <TopSellingBrandCard />
        <Card>
          <CardHeader>
            <CardTitle>Top Payment Method</CardTitle>
            <CardDescription>
              Breakdown of orders by payment method.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : topPaymentMethods.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPaymentMethods.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium capitalize">{item.payment_method}</TableCell>
                      <TableCell className="text-right">{item.total_orders}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(item.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No Data Found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}