import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { ConnectAccountsClient } from "@/components/dashboard/accounts/connect-accounts-client";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { ConnectedAccount } from "@/lib/types";

export default async function AccountsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
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

  const { data: connectedAccounts, error } = await supabase
    .from("connected_accounts")
    .select("*")
    .eq("profile_id", profile.id);

  if (error) {
    console.error("Error fetching connected accounts:", error);
    // We can still render the page, just show an empty list.
  }

  return <ConnectAccountsClient connectedAccounts={connectedAccounts || []} />;
}