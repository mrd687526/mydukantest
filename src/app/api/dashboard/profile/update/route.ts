import { NextResponse } from "next/server";
import { createServerClient } from "@/integrations/supabase/server";

export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  let avatarUrl = null;
  const avatarFile = formData.get("avatar_file") as File | null;

  // Handle avatar upload
  if (avatarFile && avatarFile.size > 0) {
    const filePath = `avatars/${user.id}/${Date.now()}_${avatarFile.name}`;
    const { data, error: uploadError } = await supabase.storage.from('brand_assets').upload(filePath, avatarFile, { upsert: true });
    if (uploadError) {
      return NextResponse.json({ error: "Failed to upload avatar." }, { status: 500 });
    }
    const { data: { publicUrl } } = supabase.storage.from('brand_assets').getPublicUrl(filePath);
    avatarUrl = publicUrl;
  }

  // Update profile table
  const updateObj: Record<string, any> = { name };
  if (avatarUrl) updateObj.avatar = avatarUrl;
  const { error: profileError } = await supabase
    .from("profiles")
    .update(updateObj)
    .eq("id", user.id);
  if (profileError) {
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }

  // Update email if changed
  if (email && email !== user.email) {
    const { error: emailError } = await supabase.auth.updateUser({ email });
    if (emailError) {
      return NextResponse.json({ error: "Failed to update email." }, { status: 500 });
    }
  }

  // Update password if provided
  if (password && password.length >= 6) {
    const { error: passError } = await supabase.auth.updateUser({ password });
    if (passError) {
      return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
} 