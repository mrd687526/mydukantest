"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrafficSourcesList } from "./traffic-sources-list";
import { DeviceUsageChart } from "./device-usage-chart";
import { PopularPagesList } from "./popular-pages-list";

interface StoreAnalyticsClientProps {
  profileId: string;
}

export function StoreAnalyticsClient({ profileId }: StoreAnalyticsClientProps) {
  const [trafficSources, setTrafficSources] = useState<any[] | null>(null);
  const [deviceUsage, setDeviceUsage] = useState<any[] | null>(null);
  const [popularPages, setPopularPages] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        const commonBody = { profileId, startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date().toISOString() };

        const [
          trafficRes,
          deviceRes,
          pagesRes,
        ] = await Promise.all([
          fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...commonBody, type: "metrics/referrer" }) }),
          fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...commonBody, type: "metrics/device" }) }),
          fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...commonBody, type: "metrics/url" }) }),
        ]);

        const trafficData = await trafficRes.json();
        const deviceData = await deviceRes.json();
        const pagesData = await pagesRes.json();

        if (!trafficRes.ok) throw new Error(trafficData.error || "Failed to fetch traffic sources.");
        if (!deviceRes.ok) throw new Error(deviceData.error || "Failed to fetch device usage.");
        if (!pagesRes.ok) throw new Error(pagesData.error || "Failed to fetch popular pages.");

        setTrafficSources(trafficData.data);
        setDeviceUsage(deviceData.data);
        setPopularPages(pagesData.data);

      } catch (error: any) {
        toast.error("Failed to load analytics data", { description: error.message });
        setTrafficSources([]);
        setDeviceUsage([]);
        setPopularPages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [profileId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Analytics and Insights</CardTitle>
        <CardDescription>
          Insights into your store's traffic, device usage, and popular pages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Traffic Sources</CardTitle></CardHeader>
              <CardContent><TrafficSourcesList data={trafficSources || []} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Device Usage</CardTitle></CardHeader>
              <CardContent><DeviceUsageChart data={deviceUsage || []} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Most Visited Pages</CardTitle></CardHeader>
              <CardContent><PopularPagesList data={popularPages || []} /></CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}