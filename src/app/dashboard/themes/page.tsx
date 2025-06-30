import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { ThemesClient } from "@/components/dashboard/themes/themes-client";
import { getAllThemeManifests } from "@/lib/theme-utils";

export default async function ThemesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id) // Fetch profile by user.id
    .single();

  if (!profile) {
    return <CompleteProfilePrompt user={user} />;
  }

  const { data: themes, error } = await getAllThemeManifests();

  if (error) {
    console.error("Error fetching themes:", error);
    return <div>Error loading themes. Please try again later.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Storefront Themes</h1>
        <p className="text-muted-foreground">
          Manage and preview your e-commerce storefront themes.
        </p>
      </div>
      <ThemesClient initialThemes={themes || []} />
    </div>
  );
}