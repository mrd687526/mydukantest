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
import { getCustomerOrderReports } from "@/app/actions/reports";
import { CustomerOrderReportData } from "@/lib/types";

// Dynamically import chart components with SSR disabled
const CustomerOrderVsGuestChart = dynamic(
  () =>
    import("./customer-order-vs-guest-chart").then(
      (mod) => mod.CustomerOrderVsGuestChart
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full" />,
  }
);

const CustomerVsGuestChart = dynamic(
  () =>
    import("./customer-vs-guest-chart").then(
      (mod) => mod.CustomerVsGuestChart
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full" />,
  }
);

interface CustomerReportsClientProps {
  initialData: CustomerOrderReportData[];
}

export function CustomerReportsClient({ initialData }: CustomerReportsClientProps) {
  const [reportData, setReportData] = useState<CustomerOrderReportData[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [activeFilter, setActiveFilter] = useState<string>('last_month');

  const totalOrders = reportData.reduce((sum, item) => sum + item.total_orders, 0);
  const totalCustomerOrders = reportData.reduce((sum, item) => sum + item.customer_orders, 0);
  const totalGuestOrders = reportData.reduce((sum, item) => sum + item.guest_orders, 0);

  const fetchData = async (start: string, end: string) => {
    setLoading(true);
    const result = await getCustomerOrderReports({ startDate: start, endDate: end });
    if (result.error) {
      toast.error("Failed to fetch reports", { description: result.error });
      setReportData([]);
    } else {
      setReportData(result.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial fetch is handled by server component, but if filters change, we refetch.
    // This useEffect is primarily for when the component mounts with initialData,
    // and subsequent filter changes will trigger fetchData.
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            {/* Icon can be added here */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Orders in selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Orders</CardTitle>
            {/* Icon can be added here */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomerOrders}</div>
            <p className="text-xs text-muted-foreground">
              Orders by registered customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guest Orders</CardTitle>
            {/* Icon can be added here */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuestOrders}</div>
            <p className="text-xs text-muted-foreground">
              Orders by guest users
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Order vs Guest Order (Monthly)</CardTitle>
          <CardDescription>
            Comparison of orders by registered customers vs. guests over months.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <CustomerOrderVsGuestChart data={reportData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer vs Guest (Daily)</CardTitle>
          <CardDescription>
            Daily breakdown of orders by registered customers vs. guests.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <CustomerVsGuestChart data={reportData} />
        </CardContent>
      </Card>
    </div>
  );
}