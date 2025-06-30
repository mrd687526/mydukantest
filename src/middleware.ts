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

  // TEMPORARY DEVELOPMENT BYPASS: Allow access to superadmin routes for any logged-in user in development
  // REMOVE THIS BLOCK FOR PRODUCTION!
  if (process.env.NODE_ENV === 'development' && pathname.startsWith('/superadmin')) {
    return response; // Allow access without strict role check
  }
  // END TEMPORARY DEVELOPMENT BYPASS

  // Fetch user profile to determine role (only if not bypassed by dev mode)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, stripe_customer_id, role')
    .eq('user_id', user.id)
    .single();

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

  // Allow super admins to access /superadmin routes (this check is now after the dev bypass)
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