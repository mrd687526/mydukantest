import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { ConnectAccountsClient } from "@/components/dashboard/accounts/connect-accounts-client";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";

export default async function AccountsPage() {
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

  const [connectedAccountsRes, credentialsRes] = await Promise.all([
    supabase
      .from("connected_accounts")
      .select("*")
      .eq("profile_id", profile.id),
    supabase
      .from("profile_credentials")
      .select("fb_app_id")
      .eq("profile_id", profile.id)
      .single(),
  ]);

  if (connectedAccountsRes.error) {
    console.error(
      "Error fetching connected accounts:",
      connectedAccountsRes.error
    );
    // We can still render the page, just show an empty list.
  }

  const connectedAccounts = connectedAccountsRes.data || [];
  const fbAppId = credentialsRes.data?.fb_app_id || null;

  return (
    <ConnectAccountsClient
      connectedAccounts={connectedAccounts}
      fbAppId={fbAppId}
    />
  );
}