import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import OpenAI from 'https://esm.sh/openai@4.52.7'

// --- Type Definitions ---
interface FacebookComment {
  page_id: string;
  comment_id: string;
  message: string;
  from: { id: string; name: string };
}

interface ReplyTemplate {
  template_text: string;
  reply_type: 'public' | 'private' | 'ai';
}

interface CampaignRule {
  id: string;
  keyword: string;
  match_type: 'exact' | 'contains';
  action: 'reply' | 'dm' | 'hide' | 'delete';
  reply_templates: ReplyTemplate | null; // Joined from reply_templates table
}

interface AutomationCampaign {
  id: string;
  is_active: boolean;
  campaign_rules: CampaignRule[];
}

interface Profile {
  id: string;
  automation_campaigns: AutomationCampaign[];
}

interface ConnectedAccount {
  access_token: string;
  profiles: Profile | null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- Helper Functions ---

/**
 * Parses the incoming Facebook webhook payload to extract essential comment data.
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
    comment_id: value.comment_id,
    message: value.message,
    from: value.from,
  };
}

/**
 * Finds a rule that matches the comment message.
 */
function findMatch(rules: CampaignRule[], message: string): CampaignRule | null {
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

/**
 * Logs the executed action into the campaign_reports table.
 */
async function logCampaignAction(supabase: SupabaseClient, report: {
  campaign_id: string;
  comment_id: string;
  reply_text: string;
  reply_type: string | undefined;
  action_taken: string;
  associated_keyword: string;
}) {
  const { error } = await supabase.from('campaign_reports').insert(report);
  if (error) {
    console.error('Error logging campaign action:', error);
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

    // Fetch account, profile, and all campaign data in one go
    const { data: account, error: accountError } = await supabaseAdmin
      .from('connected_accounts')
      .select(`
        access_token,
        profiles (
          id,
          automation_campaigns (
            id,
            is_active,
            campaign_rules (
              *,
              reply_templates (template_text, reply_type)
            )
          )
        )
      `)
      .eq('fb_page_id', comment.page_id)
      .single<ConnectedAccount>();

    if (accountError || !account) {
      throw new Error(`Account not found for page ID ${comment.page_id}: ${accountError?.message}`);
    }

    const activeCampaign = account.profiles?.automation_campaigns.find(c => c.is_active);

    if (!activeCampaign) {
      return new Response(JSON.stringify({ status: 'ignored', reason: 'No active campaign found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const matchedRule = findMatch(activeCampaign.campaign_rules, comment.message);

    if (!matchedRule) {
      return new Response(JSON.stringify({ status: 'ignored', reason: 'No matching rule found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let responseText = '';
    const replyTemplate = matchedRule.reply_templates;

    if (replyTemplate) {
      if (replyTemplate.reply_type === 'ai') {
        responseText = await generateAIReply(comment.message);
      } else {
        responseText = replyTemplate.template_text;
      }
    }

    await performAction(matchedRule.action, {
      comment_id: comment.comment_id,
      user_id: comment.from!.id,
      page_access_token: account.access_token,
      text: responseText,
    });

    await logCampaignAction(supabaseAdmin, {
      campaign_id: activeCampaign.id,
      comment_id: comment.comment_id,
      reply_text: responseText,
      reply_type: replyTemplate?.reply_type,
      action_taken: matchedRule.action,
      associated_keyword: matchedRule.keyword,
    });

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