import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import OpenAI from 'https://esm.sh/openai@4.52.7'

// Define types for clarity
interface FacebookComment {
  page_id: string;
  item: string;
  verb: string;
  comment_id: string;
  message: string;
  from: { id: string; name: string };
}
interface CommentRule {
  keyword: string;
  match_type: 'exact' | 'contains';
  action: 'reply' | 'dm' | 'hide' | 'delete';
}
interface AutoReply {
  template: string;
  type: 'public' | 'private' | 'ai';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- Helper Functions ---

/**
 * Parses the incoming Facebook webhook payload to extract comment data.
 */
function parseFacebookWebhook(payload: any): Partial<FacebookComment> {
  const entry = payload.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  if (change?.field !== 'feed' || value?.item !== 'comment' || value?.verb !== 'add') {
    return {};
  }

  return {
    page_id: entry.id,
    item: value.item,
    verb: value.verb,
    comment_id: value.comment_id,
    message: value.message,
    from: value.from,
  };
}

/**
 * Finds a rule that matches the comment message.
 */
function findMatch(rules: CommentRule[], message: string): CommentRule | null {
  if (!message || !rules) return null;
  const lowerCaseMessage = message.toLowerCase();

  for (const rule of rules) {
    const keyword = rule.keyword?.toLowerCase();
    if (!keyword) continue;

    if (rule.match_type === 'exact' && lowerCaseMessage === keyword) {
      return rule;
    }
    if (rule.match_type === 'contains' && lowerCaseMessage.includes(keyword)) {
      return rule;
    }
  }
  return null;
}

/**
 * Generates a smart reply using OpenAI.
 */
async function generateAIReply(commentText: string): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.error("OPENAI_API_KEY is not set. Falling back to default reply.");
    return "Thanks for your comment!";
  }
  const openai = new OpenAI({ apiKey: openaiApiKey });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful social media assistant. Your goal is to provide a friendly and concise reply to user comments." },
        { role: "user", content: `Please generate a short, friendly reply to the following comment: "${commentText}"` }
      ],
      max_tokens: 60,
    });
    return response.choices[0].message.content?.trim() ?? "Sorry, I couldn't think of a reply.";
  } catch (error) {
    console.error('Error generating AI reply:', error);
    return "We've received your comment and will get back to you shortly!";
  }
}

/**
 * Gets the appropriate response text from templates or AI.
 */
async function getResponseText(replies: AutoReply[], action: string, originalMessage: string): Promise<string> {
  const isReply = action === 'reply';
  const isDm = action === 'dm';

  if (!isReply && !isDm) return '';

  const template = replies?.find(r => 
    (isReply && r.type === 'public') || 
    (isDm && r.type === 'private') ||
    r.type === 'ai'
  );

  if (template?.type === 'ai') {
    return await generateAIReply(originalMessage);
  }

  return template?.template || "Thanks for your comment!";
}

/**
 * Executes the specified action using the Facebook Graph API.
 */
async function performAction(action: string, params: { comment_id: string; user_id: string; page_access_token: string; text: string }) {
  const { comment_id, user_id, page_access_token, text } = params;
  const GRAPH_API_URL = 'https://graph.facebook.com/v20.0';
  const authParam = `access_token=${page_access_token}`;

  let url = '';
  let options: RequestInit = {};

  switch (action) {
    case 'reply':
      url = `${GRAPH_API_URL}/${comment_id}/comments?${authParam}`;
      options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      };
      break;
    case 'dm':
      url = `${GRAPH_API_URL}/me/messages?${authParam}`;
      options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: user_id },
          message: { text },
          messaging_type: 'RESPONSE',
        }),
      };
      break;
    case 'hide':
      url = `${GRAPH_API_URL}/${comment_id}?is_hidden=true&${authParam}`;
      options = { method: 'POST' };
      break;
    case 'delete':
      url = `${GRAPH_API_URL}/${comment_id}?${authParam}`;
      options = { method: 'DELETE' };
      break;
    default:
      console.log(`Unknown action: ${action}`);
      return;
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    console.error(`Failed to perform action '${action}':`, errorData);
  }
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
    const comment = parseFacebookWebhook(payload);

    if (!comment.page_id || !comment.message || !comment.comment_id) {
      return new Response(JSON.stringify({ status: 'ignored', reason: 'Not a valid new comment payload' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: account } = await supabaseAdmin
      .from('connected_accounts')
      .select(`access_token, profiles ( comment_rules (*), auto_replies (*) )`)
      .eq('fb_page_id', comment.page_id)
      .single();

    if (!account || !account.profiles) {
      throw new Error(`No profile found for page ID: ${comment.page_id}`);
    }

    const { access_token, profiles: profile } = account;
    const matchedRule = findMatch(profile.comment_rules, comment.message);

    if (!matchedRule) {
      return new Response(JSON.stringify({ status: 'ignored', reason: 'No matching rule found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const responseText = await getResponseText(profile.auto_replies, matchedRule.action, comment.message);

    await performAction(matchedRule.action, {
      comment_id: comment.comment_id,
      user_id: comment.from!.id,
      page_access_token: access_token,
      text: responseText,
    });

    if (responseText) {
      await supabaseAdmin.from('reply_logs').insert({
        comment_id: comment.comment_id,
        reply_text: responseText,
        reply_type: matchedRule.action,
      });
    }

    return new Response(JSON.stringify({ status: 'processed' }), {
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