// Supabase Edge Function: Meta Webhook
import { serve } from 'std/server';
import { handleMetaEvent } from './bot-engine.ts';
import { createBrowserClient } from '@/integrations/supabase/client'

serve(async (req) => {
  const { method, url } = req;
  const { searchParams } = new URL(url);

  if (method === 'GET') {
    // Verification
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');
    // TODO: Replace with your verify token logic
    if (mode === 'subscribe' && token && challenge) {
      // Accept any token for now (replace with DB check)
      return new Response(challenge, { status: 200 });
    }
    return new Response('Verification failed', { status: 403 });
  }

  if (method === 'POST') {
    try {
      const body = await req.json();
      const result = await handleMetaEvent(body);
      // Log actions for now
      console.log('Bot actions:', JSON.stringify(result.actions));
      return new Response('EVENT_RECEIVED', { status: 200 });
    } catch (err) {
      console.error('Meta webhook error:', err);
      return new Response('Webhook error', { status: 500 });
    }
  }

  return new Response('Not found', { status: 404 });
}); 