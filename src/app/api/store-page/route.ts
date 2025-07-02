import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/integrations/supabase/server";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") || "home";
  const profileId = req.nextUrl.searchParams.get("profileId"); // Optional: for specific store's page

  const supabase = createServerClient();

  let targetProfileId: string | null = null;

  // If a profileId is provided, filter by it. This is for dashboard editor or specific store views.
  if (profileId) {
    targetProfileId = profileId;
  } else {
    // For public storefront, we need to determine which store's page to show.
    // For this demo, we'll fetch the profile_id of the first store_admin.
    // In a real multi-tenant app, this would come from subdomain/path.
    const { data: firstStoreProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "store_admin")
      .limit(1); // Use limit(1) instead of single()

    if (profileError) {
      console.error("Error fetching first store profile for public page:", profileError.message);
      return NextResponse.json({ error: "Database error fetching profile." }, { status: 500 });
    }
    
    if (firstStoreProfiles && firstStoreProfiles.length > 0) {
      targetProfileId = firstStoreProfiles[0].id;
    } else {
      // If no store_admin profile exists, return null data for public view
      return NextResponse.json({ data: null }); // Return 200 OK with null data
    }
  }

  if (!targetProfileId) {
    return NextResponse.json({ error: "Profile ID could not be determined." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("store_pages")
    .select("data")
    .eq("slug", slug)
    .eq("profile_id", targetProfileId)
    .maybeSingle(); // Use maybeSingle() to handle 0 or 1 row

  if (error) {
    console.error("Error fetching store page:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If data is null, it means no page was found. Return 200 OK with null data.
  // The client-side will then use DEFAULT_TREE.
  if (!data) {
    return NextResponse.json({ data: null });
  }

  return NextResponse.json({ data: data.data });
}

export async function POST(req: NextRequest) {
  const { slug, data: pageData } = await req.json();
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching user profile for store page save:", profileError?.message);
    return NextResponse.json({ error: "User profile not found." }, { status: 404 });
  }

  const { error } = await supabase
    .from("store_pages")
    .upsert([{ slug, data: pageData, updated_at: new Date().toISOString(), profile_id: profile.id }], { onConflict: "slug,profile_id" }); // Conflict on both slug and profile_id

  if (error) {
    console.error("Error saving store page:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}