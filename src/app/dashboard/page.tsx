import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { DashboardTabsClient } from "@/components/dashboard/dashboard-tabs-client";
import { format, subDays } from "date-fns";

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
  // Define date range for customer order reports and top selling products (e.g., last 30 days)
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 29);
  const startDate = format(thirtyDaysAgo, 'yyyy-MM-dd');
  const endDate = format(today, 'yyyy-MM-dd');

  const [
    totalProductsRes,
    totalSalesRes,
    totalOrdersRes,
    canceledOrdersRes,
    refundedOrdersRes,
    recentOrdersRes,
    dailyOrderCountsRes,
    customerOrderReportsRes,
    topSellingProductsRes,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("profile_id", profileId),
    supabase.from("orders").select("total_amount").eq("profile_id", profileId).eq("status", "delivered"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("profile_id", profileId),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("profile_id", profileId).eq("status", "cancelled"),
    supabase.from("order_refund_requests").select("id", { count: "exact", head: true }).eq("profile_id", profileId).eq("status", "approved"),
    supabase.from("orders").select("*").eq("profile_id", profileId).order("created_at", { ascending: false }).limit(5),
    supabase.rpc("get_daily_order_counts", { p_profile_id: profileId }),
    supabase.rpc("get_customer_order_analytics", { p_profile_id: profileId, p_start_date: startDate, p_end_date: endDate }),
    supabase.rpc("get_top_selling_products", { p_profile_id: profileId, p_start_date: startDate, p_end_date: endDate }),
  ]);

  // Enrich top selling products with stock status
  let topSellingProductsWithStock: (TopSellingProductReportData & { stock_status?: Product['stock_status'] })[] = [];
  if (topSellingProductsRes.data && topSellingProductsRes.data.length > 0) {
    const productIds = topSellingProductsRes.data.map(p => p.product_id);
    const { data: productsDetails, error: productsDetailsError } = await supabase
      .from('products')
      .select('id, stock_status, category')
      .in('id', productIds);

    if (productsDetailsError) {
      console.error("Error fetching product details for top selling products:", productsDetailsError);
    } else {
      const productDetailsMap = new Map(productsDetails?.map(p => [p.id, { stock_status: p.stock_status, category: p.category }]));
      topSellingProductsWithStock = topSellingProductsRes.data.map(p => ({
        ...p,
        stock_status: productDetailsMap.get(p.product_id)?.stock_status,
        category: productDetailsMap.get(p.product_id)?.category, // Add category here
      }));
    }
  }

  const ecommerceData = {
    totalProducts: totalProductsRes.count,
    totalSales: totalSalesRes.data?.reduce((sum, order) => sum + order.total_amount, 0) ?? 0,
    totalOrders: totalOrdersRes.count,
    canceledOrders: canceledOrdersRes.count,
    refundedOrders: refundedOrdersRes.count,
    recentOrders: recentOrdersRes.data,
    dailyOrderCounts: dailyOrderCountsRes.data,
    customerOrderReports: customerOrderReportsRes.data,
    topSellingProducts: topSellingProductsWithStock,
  };

  return (
    <DashboardTabsClient
      marketingData={marketingData}
      ecommerceData={ecommerceData}
    />
  );
}