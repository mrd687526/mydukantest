import { createServerClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandSettingsForm } from "@/components/superadmin/settings/brand-settings-form";
import { getSettings } from "@/app/actions/settings";

export default async function SuperAdminBrandSettingsPage() {
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
        <CardTitle>Brand Settings</CardTitle>
        <CardDescription>
          Manage your platform's branding and public-facing feature toggles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BrandSettingsForm initialData={settings || {}} />
      </CardContent>
    </Card>
  );
}