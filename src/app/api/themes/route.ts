import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/integrations/supabase/server';

// GET: Fetch all section definitions and templates for a tenant
export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const tenant_id = req.nextUrl.searchParams.get('tenant_id');
  if (!tenant_id) return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 });

  // Fetch section definitions
  const { data: sectionDefs, error: sectionDefsError } = await supabase
    .from('theme_section_definitions')
    .select('*');
  if (sectionDefsError) return NextResponse.json({ error: sectionDefsError.message }, { status: 500 });

  // Fetch themes for tenant
  const { data: themes, error: themesError } = await supabase
    .from('themes')
    .select('*, theme_templates(*)')
    .eq('tenant_id', tenant_id);
  if (themesError) return NextResponse.json({ error: themesError.message }, { status: 500 });

  return NextResponse.json({ sectionDefs, themes });
}

// POST: Save a template (create or update)
export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();
  const { theme_id, name, data_json } = body;
  if (!theme_id || !name || !data_json) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Upsert template (fix: onConflict must be an array)
  const { data, error } = await supabase
    .from('theme_templates')
    .upsert([
      { theme_id, name, data_json },
    ], { onConflict: 'theme_id,name' })
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ template: data[0] });
} 