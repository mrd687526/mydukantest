"use client";

import { createBrowserClient as supabaseCreateBrowserClient } from '@supabase/ssr'

export const createBrowserClient = () =>
  supabaseCreateBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )