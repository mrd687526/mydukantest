import { NextResponse } from "next/server";
import { createServerClient } from "@/integrations/supabase/server";

export async function POST(request: Request) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json(
      { error: "User profile not found." },
      { status: 404 }
    );
  }

  const { data: credentials } = await supabase
    .from("profile_credentials")
    .select("fb_app_id, fb_app_secret")
    .eq("profile_id", profile.id)
    .single();

  const APP_ID = credentials?.fb_app_id;
  const APP_SECRET = credentials?.fb_app_secret;

  if (!APP_ID || !APP_SECRET) {
    return NextResponse.json(
      {
        error:
          "Facebook App credentials are not configured in your settings.",
      },
      { status: 400 }
    );
  }

  const { accessToken: shortLivedUserToken } = await request.json();

  if (!shortLivedUserToken) {
    return NextResponse.json(
      { error: "Access Token not provided" },
      { status: 400 }
    );
  }

  try {
    // Step 1: Exchange the short-lived user token for a long-lived one
    const exchangeUrl = `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortLivedUserToken}`;
    const exchangeResponse = await fetch(exchangeUrl);
    const exchangeData = await exchangeResponse.json();

    if (exchangeData.error) {
      console.error("Error exchanging token:", exchangeData.error);
      return NextResponse.json(
        { error: "Could not get long-lived token. Please try again." },
        { status: 500 }
      );
    }
    const longLivedUserToken = exchangeData.access_token;

    // Step 2: Use the long-lived token to fetch pages. The page tokens will also be long-lived.
    const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${longLivedUserToken}&fields=id,name,access_token,category`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();

    if (pagesData.error) {
      console.error("Error fetching pages:", pagesData.error);
      return NextResponse.json(
        { error: "Could not fetch Facebook pages." },
        { status: 500 }
      );
    }

    return NextResponse.json({ pages: pagesData.data });
  } catch (error) {
    console.error("Backend authentication error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}