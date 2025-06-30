import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { PostsClient } from "@/components/dashboard/facebook-posts/posts-client";
import type { ConnectedAccount, AutomationCampaign } from "@/lib/types";

export default async function FacebookPostsPage() {
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
    .eq("id", user.id) // Fetch profile by user.id
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  const [accountsRes, campaignsRes] = await Promise.all([
    supabase
      .from("connected_accounts")
      .select("*")
      .eq("profile_id", profile.id),
    supabase
      .from("automation_campaigns")
      .select("*")
      .eq("profile_id", profile.id)
  ]);


  if (accountsRes.error) {
    console.error("Error fetching connected accounts:", accountsRes.error);
    // We can still render the page, just show an empty list.
  }
  
  if (campaignsRes.error) {
    console.error("Error fetching campaigns:", campaignsRes.error);
    return <div>Error loading campaign data. Please try again later.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Facebook Posts</h1>
        <p className="text-muted-foreground">
          Select a page to view its posts and manage automation.
        </p>
      </div>
      <PostsClient 
        accounts={accountsRes.data as ConnectedAccount[]} 
        campaigns={campaignsRes.data as AutomationCampaign[]}
      />
    </div>
  );
}