import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { DashboardTabsClient } from "@/components/dashboard/dashboard-tabs-client";

export default async function DashboardPage() {
  const supabase = createClient();

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

    // Allow access if:
    // 1. There's no subscription record (implies free plan)
    // 2. There is a subscription and its status is 'trialing' or 'active'
    const isAllowedBySubscription = !subscription || allowedStatuses.includes(subscription.status);

    if (!isAllowedBySubscription) {
      // If store admin has no active/trialing subscription, redirect to pricing page
      redirect("/dashboard/pricing?needsSubscription=true");
    }
  }

  const profileId = profile.id;

  // --- Fetch Marketing Data ---
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

  const marketingData = {
    actionCount: actionCountRes.count,
    campaignCount: campaignCountRes.count,
    accountCount: accountCountRes.count,
    recentActions: recentActionsRes.data,
    dailyCountsData: dailyCountsDataRes.data,
  };

  // --- Fetch E-Commerce Data ---
  const [
    totalProductsRes,
    totalSalesRes,
    totalOrdersRes,
    canceledOrdersRes,
    refundedOrdersRes,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("profile_id", profileId),
    supabase.from("orders").select("total_amount").eq("profile_id", profileId).eq("status", "delivered"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("profile_id", profileId),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("profile_id", profileId).eq("status", "cancelled"),
    supabase.from("order_refund_requests").select("id", { count: "exact", head: true }).eq("profile_id", profileId).eq("status", "approved"),
  ]);

  const ecommerceData = {
    totalProducts: totalProductsRes.count,
    totalSales: totalSalesRes.data?.reduce((sum, order) => sum + order.total_amount, 0) ?? 0,
    totalOrders: totalOrdersRes.count,
    canceledOrders: canceledOrdersRes.count,
    refundedOrders: refundedOrdersRes.count,
  };

  return (
    <DashboardTabsClient
      marketingData={marketingData}
      ecommerceData={ecommerceData}
    />
  );
}