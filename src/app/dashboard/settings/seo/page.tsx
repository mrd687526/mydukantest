import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SeoSettingsForm } from "@/components/dashboard/settings/seo-settings-form";
import { Profile } from "@/lib/types";

export default async function SeoSettingsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    console.error("Error fetching profile for SEO settings:", error);
    redirect("/dashboard?error=Profile not found.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Settings</CardTitle>
        <CardDescription>
          Optimize your store for search engines and social media.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SeoSettingsForm initialData={profile as Profile} />
      </CardContent>
    </Card>
  );
}