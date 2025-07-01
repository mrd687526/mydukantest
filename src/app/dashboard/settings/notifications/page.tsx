import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationsSettingsForm } from "@/components/dashboard/settings/notifications-settings-form";
import { getSettings } from "@/app/actions/settings";

export default async function NotificationsSettingsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  // For store admins, they should be able to access their own notification settings
  // No explicit role check here, as the getSettings action will handle authorization based on profile_id.

  const { data: settings, error } = await getSettings();

  if (error) {
    return <div>Error loading settings. Please try again later.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure automated email notifications for your store.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NotificationsSettingsForm initialData={settings || {}} />
      </CardContent>
    </Card>
  );
}