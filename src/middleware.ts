import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Allow access to public pages
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/privacy-policy') ||
    pathname.startsWith('/data-deletion') ||
    pathname.startsWith('/store') ||
    pathname.startsWith('/api/stripe/webhook') ||
    pathname.startsWith('/superadmin/signup')
  ) {
    return response;
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // --- START: Development Bypass for Super Admin Routes ---
  // This block allows any logged-in user to access /superadmin routes in a local development environment.
  // In production, this should be removed or replaced with a robust role-based authorization.
  // We use NEXT_PUBLIC_SUPABASE_URL as a proxy for being in a development environment.
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && pathname.startsWith('/superadmin')) {
    return response;
  }
  // --- END: Development Bypass ---

  // Fetch user profile to determine role (original logic for production)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, stripe_customer_id, role')
    .eq('id', user.id) // Fetch profile by user.id
    .maybeSingle();

  let isSuperAdmin = false;
  if (profileError || !profile) {
    // If no profile, let them proceed to dashboard to complete profile.
    // This is crucial for the CompleteProfilePrompt component to function.
    if (pathname.startsWith('/dashboard')) {
      return response;
    }
  } else {
    isSuperAdmin = profile.role === 'super_admin';

    // If user is a super_admin and tries to access the regular dashboard, redirect to super admin dashboard
    if (isSuperAdmin && pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/pricing')) {
      return NextResponse.redirect(new URL('/superadmin/dashboard', request.url));
    }
  }

  // Check subscription status for dashboard access (only for non-super admins)
  if (pathname.startsWith('/dashboard') && !isSuperAdmin) {
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('profile_id', profile?.id) // Use profile.id if it exists
      .maybeSingle();

    // Define allowed statuses for dashboard access
    const allowedStatuses = ['trialing', 'active'];

    // Allow access if:
    // 1. There's no subscription record (implies free plan)
    // 2. There is a subscription and its status is 'trialing' or 'active'
    const isAllowedBySubscription = !subscription || allowedStatuses.includes(subscription.status);

    if (!isAllowedBySubscription) {
      // If not allowed, redirect to pricing page (unless already on it)
      if (!pathname.startsWith('/dashboard/pricing')) {
        return NextResponse.redirect(new URL('/dashboard/pricing?needsSubscription=true', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api/stripe/webhook (Stripe webhook endpoint)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook).*)',
  ],
}