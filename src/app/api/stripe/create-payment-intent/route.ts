import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/integrations/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { amount, currency, orderId } = await req.json();

  if (!amount || !currency || !orderId) {
    return NextResponse.json({ error: 'Amount, currency, and orderId are required.' }, { status: 400 });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      metadata: { order_id: orderId, user_id: user.id },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}