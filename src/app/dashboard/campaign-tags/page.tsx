import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { CampaignTagsClient } from "@/components/dashboard/campaign-tags/campaign-tags-client";

export default async function CampaignTagsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id) // Fetch profile by user.id
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  const { data: campaignTags, error } = await supabase
    .from("campaign_tags")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching campaign tags:", error);
    return <div>Error loading campaign tags. Please try again later.</div>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/comment-manager"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Comment Manager
      </Link>
      <CampaignTagsClient campaignTags={campaignTags || []} />
    </div>
  );
}