import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { DashboardOverviewClient } from "@/components/dashboard/dashboard-overview-client";
import { UsersClient } from "@/components/superadmin/users-client";
import { Profile, Subscription } from "@/lib/types";

// Define a type for the data passed to the UsersClient, combining Profile and Subscription info
interface UserProfileWithSubscription extends Profile {
  subscriptions: Pick<Subscription, 'status' | 'current_period_end'>[] | null;
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
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  if (profile.role !== 'super_admin') {
    redirect("/dashboard?error=Permission denied. Not a super admin.");
  }

  const profileId = profile.id;

  // --- Fetch data for Dashboard Overview ---
  const { data: campaigns } = await supabase
    .from("automation_campaigns")
    .select("id")
    .eq("profile_id", profileId);

  const campaignIds = campaigns?.map((c) => c.id) || [];

  const [
    actionCountRes,
    campaignCountRes,
    accountCountRes,
    recentActionsRes,
    dailyCountsDataRes,
  ] = await Promise.all([
    campaignIds.length > 0
      ? supabase
          .from("campaign_reports")
          .select("id", { count: "exact", head: true })
          .in("campaign_id", campaignIds)
      : Promise.resolve({ count: 0, error: null }),
    supabase
      .from("automation_campaigns")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId),
    supabase
      .from("connected_accounts")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId),
    campaignIds.length > 0
      ? supabase
          .from("campaign_reports")
          .select("action_taken, associated_keyword, sent_at")
          .in("campaign_id", campaignIds)
          .order("sent_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [], error: null }),
    supabase.rpc("get_daily_action_counts", { p_profile_id: profileId }),
  ]);

  const actionCount = actionCountRes.count;
  const campaignCount = campaignCountRes.count;
  const accountCount = accountCountRes.count;
  const recentActions = recentActionsRes.data;
  const dailyCountsData = dailyCountsDataRes.data;

  // --- Fetch data for User Management ---
  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select(`
      id,
      user_id,
      name,
      auth_users:user_id ( email ),
      role,
      created_at,
      subscriptions ( status, current_period_end )
    `)
    .order("created_at", { ascending: false });

  if (usersError) {
    console.error("Supabase error fetching all profiles for super admin dashboard:", usersError.message);
    // Handle error gracefully, perhaps show a partial dashboard or an error message
  }

  const profilesWithEmail = users?.map(userProfile => ({
    ...userProfile,
    email: userProfile.auth_users?.email || null,
  })) as UserProfileWithSubscription[] || [];


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Overview of the application and user management.
      </p>

      <DashboardOverviewClient
        actionCount={actionCount}
        campaignCount={campaignCount}
        accountCount={accountCount}
        recentActions={recentActions}
        dailyCountsData={dailyCountsData}
      />

      <div className="mt-8">
        <UsersClient users={profilesWithEmail} />
      </div>
    </div>
  );
}