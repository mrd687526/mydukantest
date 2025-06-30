import { NextResponse } from 'next/server';
import Stripe from 'stripe'; // Import Stripe namespace
import { stripe } from '@/lib/stripe';
import { createClient } from '@/integrations/supabase/server';

const relevantEvents = new Set([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not set.');
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      const supabase = createClient();
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
          console.log(`PaymentIntent succeeded: ${paymentIntentSucceeded.id}`);
          // Update your order status in Supabase
          await supabase
            .from('orders')
            .update({
              status: 'processing', // Or 'paid', 'completed'
              stripe_payment_intent_id: paymentIntentSucceeded.id,
              stripe_charge_id: paymentIntentSucceeded.latest_charge as string,
            })
            .eq('id', paymentIntentSucceeded.metadata.order_id);
          break;
        case 'payment_intent.payment_failed':
          const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
          console.log(`PaymentIntent failed: ${paymentIntentFailed.id}`);
          // Update your order status to 'failed' or 'cancelled'
          await supabase
            .from('orders')
            .update({
              status: 'cancelled', // Or 'failed'
              stripe_payment_intent_id: paymentIntentFailed.id,
            })
            .eq('id', paymentIntentFailed.metadata.order_id);
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          console.log(`Checkout session completed: ${checkoutSession.id}`);
          // If you're using Checkout Sessions, you'd handle order fulfillment here.
          // For Payment Intents, the payment_intent.succeeded event is usually enough.
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          const priceId = subscription.items.data[0].price.id;
          const status = subscription.status;
          const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

          // Find the profile associated with this Stripe customer ID
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profileError || !profileData) {
            console.error(`Profile not found for Stripe customer ID: ${customerId}`);
            // If profile not found, it means the customer was created in Stripe first,
            // or there's a mismatch. You might need to create a profile or link it.
            // For now, we'll just log and return.
            return new NextResponse('Profile not found for subscription update', { status: 404 });
          }

          const profileId = profileData.id;

          const { error: upsertError } = await supabase
            .from('subscriptions')
            .upsert({
              profile_id: profileId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              stripe_price_id: priceId,
              status: status,
              current_period_start: currentPeriodStart,
              current_period_end: currentPeriodEnd,
            }, { onConflict: 'stripe_subscription_id' }); // Use subscription ID as conflict key

          if (upsertError) {
            console.error('Error upserting subscription:', upsertError);
            throw new Error('Failed to upsert subscription data.');
          }
          console.log(`Subscription ${subscription.id} ${event.type} and updated in DB.`);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error: any) {
      console.error('Error handling Stripe event:', error);
      return new NextResponse('Webhook handler failed', { status: 500 });
    }
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}