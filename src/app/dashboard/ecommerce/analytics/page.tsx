import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesChart } from "@/components/dashboard/ecommerce/analytics/sales-chart";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

// Dynamically import the chart component with SSR disabled
const DynamicSalesChart = dynamic(
  () =>
    import("@/components/dashboard/ecommerce/analytics/sales-chart").then(
      (mod) => mod.SalesChart
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full" />,
  }
);

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
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
          <DynamicSalesChart data={dailySalesData || []} />
        </CardContent>
      </Card>
    </div>
  );
}