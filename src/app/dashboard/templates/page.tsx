import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { TemplatesClient } from "@/components/dashboard/templates/templates-client";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { CommentTemplate } from "@/lib/types";

export default async function TemplatesPage() {
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

  const { data: commentTemplates, error } = await supabase
    .from("comment_templates")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching comment templates:", error);
    return <div>Error loading templates. Please try again later.</div>;
  }

  return <TemplatesClient commentTemplates={commentTemplates || []} />;
}