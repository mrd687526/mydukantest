import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/integrations/supabase/server';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
  }

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('profile_id', profile.id)
    .single();

  if (subscriptionError || !subscription?.stripe_customer_id) {
    console.error('Error fetching Stripe customer ID for profile:', subscriptionError);
    return NextResponse.json({ error: 'Subscription not found for this user. Please subscribe first.' }, { status: 400 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${req.headers.get('origin')}/dashboard/settings`, // Redirect back to settings page
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating customer portal session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}