import { createServerClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GeographyClient } from "@/components/superadmin<think>Deciding which files are relevant...

{
  "complexity": "low",
  "relevantFiles": [
    "src/app/dashboard/accounts/page.tsx",
    "src/app/dashboard/bot-manager/page.tsx",
    "src/app/dashboard/campaign-tags/page.tsx",
    "src/app/dashboard/campaigns/page.tsx",
    "src/app/dashboard/comment-manager/reply-templates/page.tsx",
    "src/app/dashboard/ecommerce/analytics/page.tsx",
    "src/app/dashboard/ecommerce/customers/page.tsx",
    "src/app/dashboard/ecommerce/discounts/page.tsx",
    "src/app/dashboard/ecommerce/orders/page.tsx",
    "src/app/dashboard/ecommerce/refunds/page.tsx",
    "src/app/dashboard/ecommerce/top-sales-reports/page.tsx",
    "src/app/dashboard/facebook-posts/page.tsx",
    "src/app/dashboard/templates/page.tsx",
    "src/app/dashboard/bot-manager/[botId]/page.tsx",
    "src/app/dashboard/campaigns/[campaignId]/page.tsx",
    "src/app/dashboard/ecommerce/products/[productId]/edit/page.tsx",
    "src/app/dashboard/themes/page.tsx",
    "src/app/dashboard/page.tsx",
    "src/app/dashboard/layout.tsx",
    "src/app/dashboard/ecommerce/orders/[orderId]/page.tsx",
    "src/app/dashboard/ecommerce/customers/[customerId]/page.tsx",
    "src/app/dashboard/reports/customer/page.tsx",
    "src/app/dashboard/reports/orders/page.tsx",
    "src/app/dashboard/reports/stock/page.tsx",
    "src/app/dashboard/settings/customizations/page.tsx",
    "src/app/dashboard/settings/identity/page.tsx",
    "src/app/dashboard/settings/notifications/page.tsx",
    "src/app/dashboard/settings/shipping/page.tsx",
    "src/app/dashboard/settings/seo/page.tsx",
    "src/app/page.tsx",
    "src/app/store/account/page.tsx",
    "src/app/store/layout.tsx",
    "src/app/store/page.tsx",
    "src/app/superadmin/coupons/page.tsx",
    "src/app/superadmin/dashboard/page.tsx",
    "src/app/superadmin/layout.tsx",
    "src/app/superadmin/plan-requests/page.tsx",
    "src/app/store/products/[productId]/page.tsx",
    "src/app/superadmin/settings/analytics/page.tsx",
    "src/app/superadmin/plans/page.tsx",
    "src/app/superadmin/settings/brand/page.tsx",
    "src/app/superadmin/settings/cookie/page.tsx",
    "src/app/superadmin/settings/email/page.tsx",
    "src/app/superadmin/settings/geography/page.tsx",
    "src/app/superadmin/users/page.tsx",
    "src/app/superadmin/settings/storage/page.tsx",
    "src/app/dashboard/ecommerce/products/page.tsx",
    "src/app/dashboard/settings/checkout/page.tsx"
  ]
}</think><dyad-codebase-context files="src/app/dashboard/accounts/page.tsx,src/app/dashboard/bot-manager/page.tsx,src/app/dashboard/campaign-tags/page.tsx,src/app/dashboard/campaigns/page.tsx,src/app/dashboard/comment-manager/reply-templates/page.tsx,src/app/dashboard/ecommerce/analytics/page.tsx,src/app/dashboard/ecommerce/customers/page.tsx,src/app/dashboard/ecommerce/discounts/page.tsx,src/app/dashboard/ecommerce/orders/page.tsx,src/app/dashboard/ecommerce/refunds/page.tsx,src/app/dashboard/ecommerce/top-sales-reports/page.tsx,src/app/dashboard/facebook-posts/page.tsx,src/app/dashboard/templates/page.tsx,src/app/dashboard/bot-manager/[botId]/page.tsx,src/app/dashboard/campaigns/[campaignId]/page.tsx,src/app/dashboard/ecommerce/products/[productId]/edit/page.tsx,src/app/dashboard/themes/page.tsx,src/app/dashboard/page.tsx,src/app/dashboard/layout.tsx,src/app/dashboard/ecommerce/orders/[orderId]/page.tsx,src/app/dashboard/ecommerce/customers/[customerId]/page.tsx,src/app/dashboard/reports/customer/page.tsx,src/app/dashboard/reports/orders/page.tsx,src/app/dashboard/reports/stock/page.tsx,src/app/dashboard/settings/customizations/page.tsx,src/app/dashboard/settings/identity/page.tsx,src/app/dashboard/settings/notifications/page.tsx,src/app/dashboard/settings/shipping/page.tsx,src/app/dashboard/settings/seo/page.tsx,src/app/page.tsx,src/app/store/account/page.tsx,src/app/store/layout.tsx,src/app/store/page.tsx,src/app/superadmin/coupons/page.tsx,src/app/superadmin/dashboard/page.tsx,src/app/superadmin/layout.tsx,src/app/superadmin/plan-requests/page.tsx,src/app/store/products/[productId]/page.tsx,src/app/superadmin/settings/analytics/page.tsx,src/app/superadmin/plans/page.tsx,src/app/superadmin/settings/brand/page.tsx,src/app/superadmin/settings/cookie/page.tsx,src/app/superadmin/settings/email/page.tsx,src/app/superadmin/settings/geography/page.tsx,src/app/superadmin/users/page.tsx,src/app/superadmin/settings/storage/page.tsx,src/app/dashboard/ecommerce/products/page.tsx,src/app/dashboard/settings/checkout/page.tsx">Complexity: low</dyad-codebase-context>/settings/geography-client";
import { getCountries } from "@/app/actions/geography";

export default async function SuperAdminGeographyPage() {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (process.env.NODE_ENV !== 'development' && (!profile || profile.role !== 'super_admin')) {
    redirect("/dashboard?error=Permission denied.");
  }

  const { data: countries, error } = await getCountries();

  if (error) {
    return <div>Error loading geographical data. Please try again later.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographical Data Management</CardTitle>
        <CardDescription>
          Manage countries, states, and regions for use in address forms across the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GeographyClient initialCountries={countries || []} />
      </CardContent>
    </Card>
  );
}