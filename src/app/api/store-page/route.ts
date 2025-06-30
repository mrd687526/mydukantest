import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/integrations/supabase/server";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") || "home";
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_pages")
    .select("data")
    .eq("slug", slug)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data: data?.data });
}

export async function POST(req: NextRequest) {
  const { slug, data: pageData } = await req.json();
  const supabase = await createClient();
  const { error } = await supabase
    .from("store_pages")
    .upsert([{ slug, data: pageData, updated_at: new Date().toISOString() }], { onConflict: "slug" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}