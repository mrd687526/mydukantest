import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { TemplatesClient } from "@/components/dashboard/templates/templates-client";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";

export default async function TemplatesPage() {
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

  const [commentTemplatesRes, replyTemplatesRes] = await Promise.all([
    supabase
      .from("comment_templates")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("reply_templates")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  if (commentTemplatesRes.error || replyTemplatesRes.error) {
    console.error("Error fetching templates:", commentTemplatesRes.error || replyTemplatesRes.error);
    return <div>Error loading templates. Please try again later.</div>;
  }

  return (
    <TemplatesClient
      commentTemplates={commentTemplatesRes.data || []}
      replyTemplates={replyTemplatesRes.data || []}
    />
  );
}