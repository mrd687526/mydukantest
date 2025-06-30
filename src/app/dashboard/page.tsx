import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { DashboardOverviewClient } from "@/components/dashboard/dashboard-overview-client";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role") // Select role as well
    .eq("id", user.id) // Fetch profile by user.id
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  // Check subscription status for store_admin users
  const isStoreAdmin = profile.role === 'store_admin';

  if (isStoreAdmin) {
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('profile_id', profile.id)
      .single();

    const allowedStatuses = ['trialing', 'active'];

    if (subscriptionError || !subscription || !allowedStatuses.includes(subscription.status)) {
      // If store admin has no active/trialing subscription, redirect to pricing page
      redirect("/dashboard/pricing?needsSubscription=true");
    }
  }

  const profileId = profile.id;

  // Fetch campaign IDs first
  const { data: campaigns } = await supabase
    .from("automation_campaigns")
    .select("id")
    .eq("profile_id", profileId);

  const campaignIds = campaigns?.map((c) => c.id) || [];

  // Fetch all data in parallel for performance
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

  return (
    <DashboardOverviewClient
      actionCount={actionCount}
      campaignCount={campaignCount}
      accountCount={accountCount}
      recentActions={recentActions}
      dailyCountsData={dailyCountsData}
    />
  );
}