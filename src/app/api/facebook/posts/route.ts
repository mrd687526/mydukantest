import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { pageId, accessToken } = await request.json();

  if (!pageId || !accessToken) {
    return NextResponse.json(
      { error: "Page ID and Access Token are required." },
      { status: 400 }
    );
  }

  try {
    const fields = "id,message,created_time,full_picture,permalink_url";
    const url = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=${fields}&access_token=${accessToken}&limit=12`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("Facebook API Error:", data.error);
      return NextResponse.json(
        { error: data.error.message || "Failed to fetch posts from Facebook." },
        { status: 500 }
      );
    }

    return NextResponse.json({ posts: data.data });
  } catch (error) {
    console.error("Error fetching Facebook posts:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}