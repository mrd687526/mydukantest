import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutSettingsForm } from "@/components/dashboard/settings/checkout-settings-form";
import { Profile } from "@/lib/types";

export default async function CheckoutSettingsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    console.error("Error fetching profile for checkout settings:", error);
    redirect("/dashboard?error=Profile not found.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout Settings</CardTitle>
        <CardDescription>
          Configure options related to your store's checkout process.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CheckoutSettingsForm initialData={profile as Profile} />
      </CardContent>
    </Card>
  );
}