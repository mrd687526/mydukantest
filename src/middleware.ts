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

  // Allow access to login, auth callback, privacy policy, data deletion, and storefront pages
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/privacy-policy') ||
    pathname.startsWith('/data-deletion') ||
    pathname.startsWith('/store') ||
    pathname.startsWith('/api/stripe/webhook') // Allow webhook to be publicly accessible
  ) {
    return response;
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check subscription status for dashboard access
  if (pathname.startsWith('/dashboard')) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      // If no profile, prompt to complete profile (handled by /dashboard page)
      // Or if profile exists but no stripe_customer_id, it means it's a new user
      // who hasn't gone through subscription flow yet.
      // For now, let them proceed to dashboard to complete profile/subscribe.
      return response;
    }

    // Fetch subscription status
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('profile_id', profile.id)
      .single();

    // Define allowed statuses for dashboard access
    const allowedStatuses = ['trialing', 'active'];

    if (subscriptionError || !subscription || !allowedStatuses.includes(subscription.status)) {
      // If no active/trialing subscription, redirect to a billing/subscription page
      // For now, we'll redirect to settings, where they can manage subscription.
      // In a real app, you'd have a dedicated /dashboard/billing or /dashboard/subscribe page.
      if (!pathname.startsWith('/dashboard/settings')) { // Avoid infinite redirect
        return NextResponse.redirect(new URL('/dashboard/settings?needsSubscription=true', request.url));
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