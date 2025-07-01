import { createServerClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CookieSettingsForm } from "@/components/superadmin/settings/cookie-settings-form";
import { getSettings } from "@/app/actions/settings";

export default async function SuperAdminCookieSettingsPage() {
  const supabase = createServerClient();

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
        <CardTitle>Cookie Consent Settings</CardTitle>
        <CardDescription>
          Manage the content and behavior of the cookie consent banner.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CookieSettingsForm initialData={settings || {}} />
      </CardContent>
    </Card>
  );
}