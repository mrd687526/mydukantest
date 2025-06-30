import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { RefundsClient } from "@/components/dashboard/ecommerce/refunds/refunds-client";
import { getRefundRequests } from "@/app/actions/refunds";

export default async function RefundsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id) // Fetch profile by user.id
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  const { data: refundRequests, error } = await getRefundRequests();

  if (error) {
    console.error("Error fetching refund requests:", error);
    return <div>Error loading refund requests. Please try again later.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Refund Requests</h1>
        <p className="text-muted-foreground">
          View and manage all refund requests from your customers.
        </p>
      </div>
      <RefundsClient refundRequests={refundRequests || []} />
    </div>
  );
}