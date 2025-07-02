import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { NewsletterClient } from "@/components/dashboard/marketing/newsletter/newsletter-client";
import { getNewsletterSubscribers } from "@/app/actions/newsletter";

export default async function MarketingNewsletterPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id) // Fetch profile by user.id
    .maybeSingle();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  const { data: subscribers, error } = await getNewsletterSubscribers();

  if (error) {
    console.error("Error fetching newsletter subscribers:", error);
    return <div>Error loading newsletter subscribers. Please try again later.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
        <p className="text-muted-foreground">
          Manage your email marketing subscriber list.
        </p>
      </div>
      <NewsletterClient subscribers={subscribers || []} />
    </div>
  );
}