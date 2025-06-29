import { NextResponse } from "next/server";

const APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;

export async function POST(request: Request) {
  const { accessToken } = await request.json();

  if (!accessToken) {
    return NextResponse.json({ error: "Access Token not provided" }, { status: 400 });
  }

  if (!APP_ID || !APP_SECRET) {
    console.error("Facebook App ID or Secret is not configured.");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  try {
    // 1. Verify the short-lived user token
    const debugUrl = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${APP_ID}|${APP_SECRET}`;
    const debugResponse = await fetch(debugUrl);
    const debugData = await debugResponse.json();

    if (debugData.data.error || !debugData.data.is_valid || debugData.data.app_id !== APP_ID) {
      console.error("Invalid Facebook Token:", debugData.data.error);
      return NextResponse.json({ error: "Invalid Facebook Token" }, { status: 401 });
    }

    // 2. Exchange for a long-lived user token (optional but good practice)
    // For this flow, we'll proceed with the verified short-lived token to fetch pages.

    // 3. Fetch the pages the user has access to
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