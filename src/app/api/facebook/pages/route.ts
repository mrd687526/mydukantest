import { NextResponse } from "next/server";
import { createClient } from "@/integrations/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "User profile not found." }, { status: 404 });
  }

  const { data: credentials } = await supabase
    .from("profile_credentials")
    .select("fb_app_id, fb_app_secret")
    .eq("profile_id", profile.id)
    .single();

  const APP_ID = credentials?.fb_app_id;
  const APP_SECRET = credentials?.fb_app_secret;

  if (!APP_ID || !APP_SECRET) {
    return NextResponse.json({ error: "Facebook App credentials are not configured in your settings." }, { status: 400 });
  }

  const { accessToken } = await request.json();

  if (!accessToken) {
    return NextResponse.json({ error: "Access Token not provided" }, { status: 400 });
  }

  try {
    const debugUrl = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${APP_ID}|${APP_SECRET}`;
    const debugResponse = await fetch(debugUrl);
    const debugData = await debugResponse.json();

    if (debugData.data.error || !debugData.data.is_valid || debugData.data.app_id !== APP_ID) {
      console.error("Invalid Facebook Token:", debugData.data.error);
      return NextResponse.json({ error: "Invalid Facebook Token" }, { status: 401 });
    }

    const userId = debugData.data.user_id;
    const pagesUrl = `https://graph.facebook.com/v19.0/${userId}/accounts?access_token=${accessToken}`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();

    if (pagesData.error) {
        console.error("Error fetching pages:", pagesData.error);
        return NextResponse.json({ error: "Could not fetch Facebook pages." }, { status: 500 });
    }

    return NextResponse.json({ pages: pagesData.data });

  } catch (error) {
    console.error("Backend authentication error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}