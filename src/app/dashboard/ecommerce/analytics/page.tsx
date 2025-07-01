import { createServerClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicSalesChartWrapper } from "@/components/dashboard/ecommerce/analytics/dynamic-sales-chart-wrapper"; // Import the new wrapper

export default async function AnalyticsPage() {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id) // Fetch profile by user.id
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  const { data: dailySalesData, error } = await supabase.rpc("get_daily_sales_data", {
    p_profile_id: profile.id,
  });

  if (error) {
    console.error("Error fetching daily sales data:", error);
    return <div>Error loading analytics data. Please try again later.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your store's performance and growth.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview (Last 30 Days)</CardTitle>
          <CardDescription>Total sales amount per day.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <DynamicSalesChartWrapper data={dailySalesData || []} />
        </CardContent>
      </Card>
    </div>
  );
}