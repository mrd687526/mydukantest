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
    pathname.startsWith('/login') || // Main login page now handles both
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/privacy-policy') ||
    pathname.startsWith('/data-deletion') ||
    pathname.startsWith('/store') ||
    pathname.startsWith('/api/stripe/webhook') ||
    pathname.startsWith('/superadmin/signup') // Allow access to super admin signup
  ) {
    return response;
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check user role for super admin access
  let isSuperAdmin = false;
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, stripe_customer_id, role')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    // If no profile, prompt to complete profile (handled by /dashboard page)
    // For now, let them proceed to dashboard to complete profile/subscribe.
    if (pathname.startsWith('/dashboard')) {
      return response;
    }
  } else {
    isSuperAdmin = profile.role === 'super_admin';
  }

  // Allow super admins to access /superadmin routes
  if (pathname.startsWith('/superadmin')) {
    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL('/dashboard?error=Permission denied. Not a super admin.', request.url));
    }
    return response;
  }

  // Check subscription status for dashboard access (only for non-super admins)
  if (pathname.startsWith('/dashboard') && !isSuperAdmin) {
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('profile_id', profile?.id) // Use profile.id if it exists
      .single();

    // Define allowed statuses for dashboard access
    const allowedStatuses = ['trialing', 'active'];

    if (subscriptionError || !subscription || !allowedStatuses.includes(subscription.status)) {
      // If no active/trialing subscription, redirect to the pricing page
      if (!pathname.startsWith('/dashboard/pricing')) { // Avoid infinite redirect
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