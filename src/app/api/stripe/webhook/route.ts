import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/integrations/supabase/server';

const relevantEvents = new Set([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'checkout.session.completed',
  // Add other events you want to handle, e.g., 'charge.refunded'
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
      const supabase = await createClient();
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