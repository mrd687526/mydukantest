import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { UsersClient } from "@/components/superadmin/users-client";
import { Profile, Subscription, UserProfileWithSubscription } from "@/lib/types"; // Import UserProfileWithSubscription
import { getDailyNewUserCounts, getAllUsersAndProfiles, getSuperAdminDashboardMetrics } from "@/app/actions/superadmin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewUsersChartContainer } from "@/components/superadmin/new-users-chart-container";
import { MonthlyOrderTrendChart } from "@/components/superadmin/monthly-order-trend-chart";
import { MostUsedCouponsTable } from "@/components/superadmin/most-used-coupons-table";
import { PopularPlansTable } from "@/components/superadmin/popular-plans-table";
import { TopCustomersTable } from "@/components/superadmin/top-customers-table";
import { Users, ShoppingCart, Store, DollarSign, TrendingUp, Percent, Star } from "lucide-react"; // Added new icons
import { format, subDays } from "date-fns";

export default async function SuperAdminDashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id) // Fetch profile by user.id
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  // In development, the middleware bypasses this role check.
  // In production, this ensures only super admins can access this page.
  if (process.env.NODE_ENV !== 'development' && profile.role !== 'super_admin') {
    redirect("/dashboard?error=Permission denied. Not a super admin.");
  }

  // --- Fetch data for User Management ---
  const { data: users, error: usersError } = await getAllUsersAndProfiles();

  if (usersError) {
    console.error("Supabase error fetching all profiles for super admin dashboard:", usersError);
    // Continue rendering with empty data for the table if there's an error
  }

  const profilesWithEmail = users || [];

  // --- Fetch data for New User Analytics (last 30 days) ---
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 29); // Get data for the last 30 days including today
  const startDate = format(thirtyDaysAgo, 'yyyy-MM-dd');
  const endDate = format(today, 'yyyy-MM-dd'); // Corrected format

  const { data: dailyNewUserCounts, error: dailyCountsError } = await getDailyNewUserCounts(startDate, endDate);

  if (dailyCountsError) {
    console.error("Error fetching daily new user counts:", dailyCountsError);
    // Continue rendering with empty data for the chart if there's an error
  }

  const totalNewUsersLast30Days = dailyNewUserCounts?.reduce((sum, item) => sum + Number(item.count), 0) || 0;

  // --- Fetch data for Super Admin Dashboard Metrics ---
  const {
    totalStores,
    totalOrders,
    totalActivePlans,
    monthlyOrderTrend,
    mostUsedCoupons,
    popularPlans,
    topCustomers,
    error: metricsError,
  } = await getSuperAdminDashboardMetrics();

  if (metricsError) {
    console.error("Error fetching super admin dashboard metrics:", metricsError);
    // Continue rendering with null/empty data for metrics if there's an error
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Manage all user accounts and monitor application-wide metrics.
      </p>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStores ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered store admin accounts
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
              All orders processed across stores
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivePlans ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently active subscription plans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* New User Analytics Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            New Users (Last 30 Days)
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalNewUsersLast30Days}</div>
          <p className="text-xs text-muted-foreground">
            Total new sign-ups
          </p>
          <div className="h-[350px] mt-4">
            <NewUsersChartContainer data={dailyNewUserCounts || []} />
          </div>
        </CardContent>
      </Card>

      {/* Monthly Order Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Order Trend</CardTitle>
          <CardDescription>Total orders processed per month.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <MonthlyOrderTrendChart data={monthlyOrderTrend || []} />
        </CardContent>
      </Card>

      {/* Top Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Popular Plans</CardTitle>
            <CardDescription>Top plans by active subscriptions.</CardDescription>
          </CardHeader>
          <CardContent>
            <PopularPlansTable data={popularPlans || []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Most Used Coupons</CardTitle>
            <CardDescription>Top 10 most frequently used discount codes.</CardDescription>
          </CardHeader>
          <CardContent>
            <MostUsedCouponsTable data={mostUsedCoupons || []} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>Customers with the highest total spend across all stores.</CardDescription>
          </CardHeader>
          <CardContent>
            <TopCustomersTable data={topCustomers || []} />
          </CardContent>
        </Card>
      </div>

      {/* Existing User Management Table */}
      <div className="mt-8">
        <UsersClient users={profilesWithEmail} />
      </div>
    </div>
  );
}