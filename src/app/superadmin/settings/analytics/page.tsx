import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsSettingsForm } from "@/components/superadmin/settings/analytics-settings-form";
import { getSettings } from "@/app/actions/settings";

export default async function SuperAdminAnalyticsSettingsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (process.env.NODE_ENV !== 'development' && (!profile || profile.role !== 'super_admin')) {
    redirect("/dashboard?error=Permission denied.");
  }

  const { data: settings, error } = await getSettings();

  if (error) {
    return <div>Error loading settings. Please try again later.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Settings</CardTitle>
        <CardDescription>
          Configure your external analytics service (e.g., Umami) for store insights.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnalyticsSettingsForm initialData={settings || {}} />
      </CardContent>
    </Card>
  );
}