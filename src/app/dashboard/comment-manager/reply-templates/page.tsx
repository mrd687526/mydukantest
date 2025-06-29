import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { ReplyTemplatesClient } from "@/components/dashboard/comment-manager/reply-templates-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ReplyTemplatesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  const { data: replyTemplates, error } = await supabase
    .from("reply_templates")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reply templates:", error);
    return <div>Error loading templates. Please try again later.</div>;
  }

  return (
    <div className="space-y-4">
        <Link
            href="/dashboard/comment-manager"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Comment Manager
        </Link>
        <ReplyTemplatesClient replyTemplates={replyTemplates || []} />
    </div>
  );
}