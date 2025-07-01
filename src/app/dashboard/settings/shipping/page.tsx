import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShippingSettingsForm } from "@/components/dashboard/settings/shipping-settings-form";
import { Profile } from "@/lib/types";

export default async function ShippingSettingsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    console.error("Error fetching profile for shipping settings:", error);
    redirect("/dashboard?error=Profile not found.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Label Settings</CardTitle>
        <CardDescription>
          Configure your store's origin address for shipping label generation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ShippingSettingsForm initialData={profile as Profile} />
      </CardContent>
    </Card>
  );
}