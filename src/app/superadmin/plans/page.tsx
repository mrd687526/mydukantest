import { createServerClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { PlansClient } from "@/components/superadmin/plans/plans-client";
import { getPlans } from "@/app/actions/plans";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SuperAdminPlansPage() {
  const supabase = createServerClient();

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

  const { data: plans, error } = await getPlans();

  if (error) {
    console.error("Error fetching plans for super admin:", error);
    return <div>Error loading plans. Please try again later.</div>;
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
        <h1 className="text-3xl font-bold">Plan Management</h1>
        <p className="text-muted-foreground">
          View and manage all subscription plans.
        </p>
      </div>
      <PlansClient plans={plans || []} />
    </div>
  );
}