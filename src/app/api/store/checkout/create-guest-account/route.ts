import { NextResponse } from "next/server";
import { createServerClient } from "@/integrations/supabase/server";

export async function POST(req: Request) {
  const supabase = createServerClient();
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }

  // Create user in Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });
  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 });
  }

  // Create profile row (if not handled by trigger)
  const userId = signUpData.user?.id;
  if (userId) {
    await supabase.from("profiles").upsert({
      id: userId,
      name,
      role: "store_admin", // or "customer" if you have a customer role
    });
  }

  return NextResponse.json({ success: true });
} 