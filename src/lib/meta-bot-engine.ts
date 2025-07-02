import { createClient } from '@supabase/supabase-js';
import { sendFacebookMessage, sendInstagramMessage } from './meta-api';

// Types for event, meta_account, bot, and flow (simplified)
export interface MetaWebhookEvent {
  object: string;
  entry: any[];
}

export interface MetaAccount {
  id: string;
  bot_id: string;
  type: string;
  page_id?: string;
  ig_user_id?: string;
  access_token: string;
}

export interface Bot {
  id: string;
  name: string;
  // ...other fields
}

// Main handler
export async function handleMetaEvent(event: MetaWebhookEvent) {
  // 1. Parse event and extract page_id or ig_user_id
  const entry = event.entry?.[0];
  const pageId = entry?.id;
  if (!pageId) throw new Error('No page_id/ig_user_id in event');

  // 2. Lookup meta_account by page_id or ig_user_id
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: metaAccount, error: metaError } = await supabase
    .from('meta_accounts')
    .select('*')
    .or(`page_id.eq.${pageId},ig_user_id.eq.${pageId}`)
    .single();
  if (metaError || !metaAccount) throw new Error('Meta account not found');

  // 3. Lookup bot by bot_id
  const { data: bot, error: botError } = await supabase
    .from('bots')
    .select('*')
    .eq('id', metaAccount.bot_id)
    .single();
  if (botError || !bot) throw new Error('Bot not found');

  // 4. Load flow definition (stub)
  // TODO: Load and parse the bot's flow from DB or file
  const flow = {};

  // 5. Execute flow logic (stub)
  // TODO: Implement flow execution and response generation
  const actions = [{ type: 'send_message', text: 'Hello from bot!' }];

  // 6. Send actions via Meta API
  for (const action of actions) {
    if (action.type === 'send_message') {
      // For Messenger, recipientId is entry.messaging[0].sender.id
      const recipientId = entry.messaging?.[0]?.sender?.id;
      if (!recipientId) {
        console.warn('No recipientId found in event');
        continue;
      }
      try {
        if (metaAccount.type === 'facebook_page') {
          const result = await sendFacebookMessage({ recipientId, message: action.text, accessToken: metaAccount.access_token });
          console.log('Sent FB message:', result);
        } else if (metaAccount.type === 'instagram_account') {
          const result = await sendInstagramMessage({ recipientId, message: action.text, accessToken: metaAccount.access_token });
          console.log('Sent IG message:', result);
        }
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
    // TODO: Support images, quick replies, etc.
  }

  // 7. Return actions for logging/analytics
  return { actions, metaAccount, bot };
} 