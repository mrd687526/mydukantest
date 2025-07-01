import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/integrations/supabase/server";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") || "home";
  const profileId = req.nextUrl.searchParams.get("profileId"); // Optional: for specific store's page

  const supabase = createServerClient();

  let query = supabase
    .from("store_pages")
    .select("data")
    .eq("slug", slug);

  // If a profileId is provided, filter by it. This is for dashboard editor or specific store views.
  if (profileId) {
    query = query.eq("profile_id", profileId);
  } else {
    // For public storefront, we need to determine which store's page to show.
    // For this demo, we'll fetch the profile_id of the first store_admin.
    // In a real multi-tenant app, this would come from subdomain/path.
    const { data: firstStoreProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "store_admin")
      .limit(1)
      .single();

    if (profileError || !firstStoreProfile) {
      console.error("Error fetching first store profile for public page:", profileError?.message);
      return NextResponse.json({ error: "No store profile found for public page." }, { status: 404 });
    }
    query = query.eq("profile_id", firstStoreProfile.id);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error("Error fetching store page:", error.message);
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ data: data?.data });
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