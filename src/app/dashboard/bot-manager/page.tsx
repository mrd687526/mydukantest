import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { BotManagerClient } from "@/components/dashboard/bot-manager/bot-manager-client";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import type { ConnectedAccount } from "@/lib/types";

export default async function BotManagerPage() {
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

  const { data: accounts, error } = await supabase
    .from("connected_accounts")
    .select("*, bots(*)")
    .eq("profile_id", profile.id);

  if (error) {
    console.error("Error fetching accounts and bots:", error);
    return <div>Error loading data. Please try again later.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bot Manager</h1>
        <p className="text-muted-foreground">
          Create and manage your Messenger bots for your connected pages.
        </p>
      </div>
      <BotManagerClient accounts={accounts as ConnectedAccount[]} />
    </div>
  );
}