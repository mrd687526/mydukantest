import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GeographyClient } from "@/components/superadmin/settings/geography-client";
import { getCountries } from "@/app/actions/geography";

export default async function SuperAdminGeographyPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (process.env.NODE_ENV !== 'development' && (!profile || profile.role !== 'super_admin')) {
    redirect("/dashboard?error=Permission denied.");
  }

  const { data: countries, error } = await getCountries();

  if (error) {
    return <div>Error loading geographical data. Please try again later.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographical Data Management</CardTitle>
        <CardDescription>
          Manage countries, states, and regions for use in address forms across the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GeographyClient initialCountries={countries || []} />
      </CardContent>
    </Card>
  );
}