"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";

const commentSchema = z.object({
  postId: z.string(),
  message: z.string().min(1, "Comment cannot be empty."),
});

export async function postFacebookComment(values: z.infer<typeof commentSchema>) {
  const validatedFields = commentSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid input." };
  }
  const { postId, message } = validatedFields.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Authentication required." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "User profile not found." };
  }

  const pageId = postId.split('_')[0];
  if (!pageId) {
    return { error: "Invalid Post ID format." };
  }

  const { data: account, error: accountError } = await supabase
    .from("connected_accounts")
    .select("access_token")
    .eq("profile_id", profile.id)
    .eq("fb_page_id", pageId)
    .single();

  if (accountError || !account || !account.access_token) {
    console.error("Error fetching account token:", accountError);
    return { error: "Could not find access token for this page." };
  }

  const accessToken = account.access_token;
  const url = `https://graph.facebook.com/v19.0/${postId}/comments`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `message=${encodeURIComponent(message)}&access_token=${accessToken}`,
    });

    const responseData = await response.json();

    if (!response.ok || responseData.error) {
      console.error("Facebook API Error:", responseData.error);
      return { error: responseData.error?.message || "Failed to post comment to Facebook." };
    }

    return { success: "Comment posted successfully!" };
  } catch (error) {
    console.error("Error posting comment:", error);
    return { error: "An internal server error occurred." };
  }
}