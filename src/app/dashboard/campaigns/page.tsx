import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CampaignsClient } from "@/components/dashboard/campaigns/campaigns-client";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";

export default async function CampaignsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  const { data: campaigns, error } = await supabase
    .from("automation_campaigns")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching campaigns:", error);
    return <div>Error loading campaigns. Please try again later.</div>;
  }

  return <CampaignsClient campaigns={campaigns || []} />;
}