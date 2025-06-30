import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { CompleteProfilePrompt } from "@/components/dashboard/complete-profile-prompt";
import { ThemesClient } from "@/components/dashboard/themes/themes-client";
import { getThemes } from "@/app/actions/themes"; // Import the getThemes action

export default async function ThemesPage() {
  const supabase = createClient();

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

  // Use the getThemes action which returns { data, error }
  const { data: themes, error } = await getThemes();

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