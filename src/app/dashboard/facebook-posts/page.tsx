import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { PostsClient } from "@/components/dashboard/facebook-posts/posts-client";
import type { ConnectedAccount } from "@/lib/types";

export default async function FacebookPostsPage() {
  const supabase = await createClient();

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

  const { data: accounts, error } = await supabase
    .from("connected_accounts")
    .select("*")
    .eq("profile_id", profile.id);

  if (error) {
    console.error("Error fetching connected accounts:", error);
    return <div>Error loading data. Please try again later.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Facebook Posts</h1>
        <p className="text-muted-foreground">
          Select a page to view and manage its posts.
        </p>
      </div>
      <PostsClient accounts={accounts as ConnectedAccount[]} />
    </div>
  );
}