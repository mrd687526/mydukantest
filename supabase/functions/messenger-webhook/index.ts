import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import type { Node, Edge } from 'https://esm.sh/reactflow@11.11.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- Type Definitions ---
interface MessengerEvent {
  sender: { id: string };
  recipient: { id: string };
  message: { mid: string; text: string };
}

interface BotFlow {
  nodes: Node[];
  edges: Edge[];
}

// --- Helper Functions ---

/**
 * Parses the incoming Facebook webhook payload to extract essential message data.
 */
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

/**
 * Finds the first message node connected to the 'start' node.
 */
function getFirstMessage(flow: BotFlow): string | null {
  if (!flow || !flow.nodes || !flow.edges) {
    return null;
  }

  const startNode = flow.nodes.find(node => node.id === 'start');
  if (!startNode) {
    return null;
  }

  const firstEdge = flow.edges.find(edge => edge.source === 'start');
  if (!firstEdge) {
    return null;
  }

  const firstMessageNode = flow.nodes.find(node => node.id === firstEdge.target);
  if (firstMessageNode && firstMessageNode.type === 'messageNode' && firstMessageNode.data.text) {
    return firstMessageNode.data.text;
  }

  return null;
}

/**
 * Sends a message to a user via the Facebook Graph API.
 */
async function sendMessengerMessage(pageAccessToken: string, recipientId: string, text: string) {
  const GRAPH_API_URL = 'https://graph.facebook.com/v20.0/me/messages';
  const authParam = `access_token=${pageAccessToken}`;

  const response = await fetch(`${GRAPH_API_URL}?${authParam}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
      messaging_type: 'RESPONSE',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(`Failed to send message:`, errorData);
    throw new Error('Failed to send message via Graph API.');
  }

  console.log(`Message sent successfully to user ${recipientId}`);
  return await response.json();
}


// --- Main Server Logic ---

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const payload = await req.json();
    const event = parseMessengerWebhook(payload);

    if (!event) {
      return new Response(JSON.stringify({ status: 'ignored', reason: 'Not a message event' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pageId = event.recipient.id;
    const userId = event.sender.id;

    // Fetch the connected account, its access token, and the active bot in one go.
    const { data: account, error: accountError } = await supabaseAdmin
      .from('connected_accounts')
      .select('id, access_token, bots!inner(id, name, status, flow_data)')
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
    const pageAccessToken = account.access_token;

    if (!pageAccessToken) {
        console.error(`Access token not found for page ID ${pageId}.`);
        return new Response(JSON.stringify({ status: 'error', reason: 'Access token missing' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }

    const firstMessageText = getFirstMessage(bot.flow_data as BotFlow);

    if (firstMessageText) {
      await sendMessengerMessage(pageAccessToken, userId, firstMessageText);
    } else {
      console.log(`No initial message found in flow for bot ${bot.id}`);
    }

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