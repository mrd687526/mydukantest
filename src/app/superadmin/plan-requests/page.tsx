import { createServerClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { getPendingPlanRequests } from "@/app/actions/plan-requests";
import { PlanRequestsClient } from "@/components/superadmin/plan-requests/plan-requests-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SuperAdminPlanRequestsPage() {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (process.env.NODE_ENV !== 'development' && (!profile || profile.role !== 'super_admin')) {
    redirect("/dashboard?error=Permission denied.");
  }

  const { data: requests, error } = await getPendingPlanRequests();

  if (error) {
    return <div>Error loading plan requests. Please try again later.</div>;
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
      <PlanRequestsClient requests={requests || []} />
    </div>
  );
}