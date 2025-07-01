import { createServerClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailSettingsForm } from "@/components/superadmin/settings/email-settings-form";
import { getEmailSettings } from "@/app/actions/settings";

export default async function SuperAdminEmailSettingsPage() {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (process.env.NODE_ENV !== 'development' && (!profile || profile.role !== 'super_admin')) {
    redirect("/dashboard?error=Permission denied.");
  }

  const { data: settings, error } = await getEmailSettings();

  if (error) {
    return <div>Error loading settings. Please try again later.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>
            Configure the platform's email sending service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailSettingsForm initialData={settings || {}} />
        </CardContent>
      </Card>
    </div>
  );
}