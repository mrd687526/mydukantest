import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/dashboard/settings/settings-form";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";

export default async function SettingsPage() {
  const supabase = createClient();

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

  const { data: credentials } = await supabase
    .from("profile_credentials")
    .select("*")
    .eq("profile_id", profile.id)
    .single();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and credentials.
        </p>
      </div>
      <SettingsForm credentials={credentials} />
    </div>
  );
}