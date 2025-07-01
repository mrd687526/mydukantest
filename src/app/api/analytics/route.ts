import { NextResponse } from "next/server";
import { createClient } from "@/integrations/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { profileId, type, startDate, endDate } = await req.json();

  if (!profileId || !type) {
    return NextResponse.json({ error: "Profile ID and analytics type are required." }, { status: 400 });
  }

  // Fetch analytics service credentials from settings table (Super Admin configured)
  const { data: settings, error: settingsError } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", ["ANALYTICS_URL", "ANALYTICS_WEBSITE_ID"]);

  if (settingsError || !settings) {
    console.error("Error fetching analytics settings:", settingsError);
    return NextResponse.json({ error: "Analytics service not configured." }, { status: 500 });
  }

  const analyticsUrl = settings.find(s => s.key === "ANALYTICS_URL")?.value;
  const websiteId = settings.find(s => s.key === "ANALYTICS_WEBSITE_ID")?.value;
  const apiKey = process.env.ANALYTICS_API_KEY;

  if (!analyticsUrl || !websiteId || !apiKey) {
    return NextResponse.json({ error: "Analytics service credentials missing. Please configure them in Super Admin settings and environment variables." }, { status: 500 });
  }

  try {
    // 1. Get Umami access token
    const authRes = await fetch(`${analyticsUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: process.env.ANALYTICS_USERNAME, // Assuming Umami username/password for token
        password: process.env.ANALYTICS_PASSWORD, // Or use API key directly if supported for token
      }),
    });

    if (!authRes.ok) {
      const errorData = await authRes.json();
      console.error("Umami Auth Error:", errorData);
      // Fallback to API Key if username/password is not used for token generation
      // For Umami, often the API key is used directly as a Bearer token.
      // If your Umami setup uses API key as Bearer token directly, skip this auth step.
      // For this example, we'll assume the API_KEY is the Bearer token.
      // If Umami requires username/password for token, you'd need to set those env vars too.
      // For simplicity, we'll use the provided ANALYTICS_API_KEY as the Bearer token directly.
    }
    // const { token } = await authRes.json(); // If auth step is needed

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`, // Using API key as Bearer token
    };

    let umamiApiEndpoint = '';
    let umamiApiParams: Record<string, any> = {
      websiteId,
      startAt: new Date(startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).getTime(), // Default last 30 days
      endAt: new Date(endDate || Date.now()).getTime(),
    };

    // Umami API filtering for specific store's pages: /store/{profileId}/...
    const storePathPrefix = `/store/${profileId}/`;

    switch (type) {
      case 'pageviews':
        umamiApiEndpoint = 'pageviews';
        umamiApiParams.url = storePathPrefix; // Filter by URL prefix
        break;
      case 'stats':
        umamiApiEndpoint = 'stats';
        umamiApiParams.url = storePathPrefix; // Filter by URL prefix
        break;
      case 'metrics/url':
        umamiApiEndpoint = 'metrics';
        umamiApiParams.type = 'url';
        umamiApiParams.url = storePathPrefix; // Filter by URL prefix
        break;
      case 'metrics/referrer':
        umamiApiEndpoint = 'metrics';
        umamiApiParams.type = 'referrer';
        umamiApiParams.url = storePathPrefix; // Filter by URL prefix
        break;
      case 'metrics/device':
        umamiApiEndpoint = 'metrics';
        umamiApiParams.type = 'device';
        umamiApiParams.url = storePathPrefix; // Filter by URL prefix
        break;
      default:
        return NextResponse.json({ error: "Invalid analytics type." }, { status: 400 });
    }

    const queryString = new URLSearchParams(umamiApiParams).toString();
    const umamiRes = await fetch(`${analyticsUrl}/api/websites/${websiteId}/${umamiApiEndpoint}?${queryString}`, { headers });
    const umamiData = await umamiRes.json();

    if (!umamiRes.ok) {
      console.error(`Umami API Error (${umamiRes.status}):`, umamiData);
      return NextResponse.json({ error: umamiData.message || `Failed to fetch analytics data for type: ${type}` }, { status: umamiRes.status });
    }

    // Post-process data if needed (e.g., strip profileId from URLs for display)
    if (type === 'metrics/url' && Array.isArray(umamiData)) {
      umamiData.forEach(item => {
        if (item.x && typeof item.x === 'string') {
          item.x = item.x.replace(storePathPrefix, '/'); // Strip the /store/{profileId}/ part
        }
      });
    }

    return NextResponse.json({ data: umamiData });

  } catch (error: any) {
    console.error("Analytics proxy error:", error);
    return NextResponse.json({ error: "An internal server error occurred while fetching analytics." }, { status: 500 });
  }
}