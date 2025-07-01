import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomSettingsForm } from "@/components/dashboard/settings/custom-settings-form";
import { Profile } from "@/lib/types";

export default async function CustomizationsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    console.error("Error fetching profile for custom settings:", error);
    redirect("/dashboard?error=Profile not found.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customizations</CardTitle>
        <CardDescription>
          Configure your store's domain and add custom code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CustomSettingsForm initialData={profile as Profile} />
      </CardContent>
    </Card>
  );
}