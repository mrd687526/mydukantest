import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { UsersClient } from "@/components/superadmin/users-client";
import { Profile, Subscription } from "@/lib/types";
import { getDailyNewUserCounts, getAllUsersAndProfiles } from "@/app/actions/superadmin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewUsersChartContainer } from "@/components/superadmin/new-users-chart-container";
import { Users } from "lucide-react";
import { format, subDays } from "date-fns";

// Define a type for the data passed to the UsersClient, matching the RPC output
interface UserProfileWithSubscription {
  id: string;
  name: string | null;
  role: 'super_admin' | 'store_admin';
  created_at: string;
  email: string;
  subscription_status: string | null;
  subscription_end_date: string | null;
}

export default async function SuperAdminDashboardPage() {
  const supabase = await createClient();

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
  // The getAllUsersAndProfiles function now returns data in the UserProfileWithSubscription format
  const { data: users, error: usersError } = await getAllUsersAndProfiles();

  if (usersError) {
    console.error("Supabase error fetching all profiles for super admin dashboard:", usersError.message);
    return <div>Error loading user data. Please try again later.</div>;
  }

  // No need for profilesWithEmail mapping here, as RPC returns flat structure
  const profilesWithEmail = users || [];

  // --- Fetch data for New User Analytics (last 30 days) ---
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 29); // Get data for the last 30 days including today
  const startDate = format(thirtyDaysAgo, 'yyyy-MM-dd');
  const endDate = format(today, 'yyyy-MM-MM');

  const { data: dailyNewUserCounts, error: dailyCountsError } = await getDailyNewUserCounts(startDate, endDate);

  if (dailyCountsError) {
    console.error("Error fetching daily new user counts:", dailyCountsError);
    // Continue rendering with empty data for the chart if there's an error
  }

  const totalNewUsersLast30Days = dailyNewUserCounts?.reduce((sum, item) => sum + Number(item.count), 0) || 0;


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Manage all user accounts and monitor application-wide metrics.
      </p>

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

      {/* Existing User Management Table */}
      <div className="mt-8">
        <UsersClient users={profilesWithEmail} />
      </div>
    </div>
  );
}