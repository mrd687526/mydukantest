import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { PlanCouponsClient } from "@/components/superadmin/coupons/plan-coupons-client";
import { getPlanCoupons } from "@/app/actions/superadmin-coupons";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SuperAdminCouponsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // In development, the middleware bypasses this role check.
  // In production, this ensures only super admins can access this page.
  if (process.env.NODE_ENV !== 'development' && (!profile || profile.role !== 'super_admin')) {
    redirect("/dashboard?error=Permission denied.");
  }

  const { data: coupons, error } = await getPlanCoupons();

  if (error) {
    console.error("Error fetching plan coupons for super admin:", error);
    return <div>Error loading plan coupons. Please try again later.</div>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/superadmin/dashboard"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Super Admin Dashboard
      </Link>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Plan Coupon Management</h1>
        <p className="text-muted-foreground">
          View and manage all subscription plan coupons.
        </p>
      </div>
      <PlanCouponsClient coupons={coupons || []} />
    </div>
  );
}