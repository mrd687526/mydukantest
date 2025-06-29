import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Basic type for incoming message
interface MessengerEvent {
  sender: { id: string };
  recipient: { id: string };
  message: {
    mid: string;
    text: string;
  };
}

// Function to parse the webhook payload
function parseMessengerWebhook(payload: any): MessengerEvent | null {
  const entry = payload.entry?.[0];
  const messaging = entry?.messaging?.[0];

  if (messaging && messaging.sender && messaging.recipient && messaging.message) {
    return {
      sender: messaging.sender,
      recipient: messaging.recipient,
      message: messaging.message,
    };
  }
  return null;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 2. Parse incoming request body
    const payload = await req.json();
    console.log("Received payload:", JSON.stringify(payload, null, 2));

    const event = parseMessengerWebhook(payload);

    if (!event) {
      console.log("Ignored: Payload is not a standard message event.");
      return new Response(JSON.stringify({ status: 'ignored', reason: 'Not a message event' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pageId = event.recipient.id;
    const messageText = event.message.text;
    console.log(`Processing message for page ${pageId}: "${messageText}"`);

    // 3. Find the active bot for the page
    const { data: account, error: accountError } = await supabaseAdmin
      .from('connected_accounts')
      .select('id, bots!inner(id, name, status, flow_data)')
      .eq('fb_page_id', pageId)
      .eq('bots.status', 'active')
      .single();

    if (accountError || !account || !account.bots || account.bots.length === 0) {
      console.log(`No active bot found for page ID ${pageId}.`);
      return new Response(JSON.stringify({ status: 'ignored', reason: 'No active bot found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const bot = account.bots[0];
    console.log(`Found active bot: ${bot.name} (ID: ${bot.id})`);

    // 4. TODO: Process the bot flow
    // For now, we just log that we found the bot and its flow data.
    console.log("Bot flow data:", JSON.stringify(bot.flow_data, null, 2));
    
    // This is where the logic to traverse the nodes and edges would go.
    // We would start at the 'start' node and follow the connections.

    return new Response(JSON.stringify({ status: 'processed', botName: bot.name }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook processing error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});