import { createServerClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IdentitySettingsForm } from "@/components/dashboard/settings/identity-settings-form";
import { Profile } from "@/lib/types";

export default async function IdentitySettingsPage() {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    console.error("Error fetching profile for identity settings:", error);
    redirect("/dashboard?error=Profile not found.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Identity</CardTitle>
        <CardDescription>
          Manage your store's name and logo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <IdentitySettingsForm initialData={profile as Profile} />
      </CardContent>
    </Card>
  );
}