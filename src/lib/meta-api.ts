import fetch from 'node-fetch';

const FB_GRAPH_API = 'https://graph.facebook.com/v18.0';

export async function sendFacebookMessage({ recipientId, message, accessToken }: { recipientId: string, message: any, accessToken: string }) {
  const url = `${FB_GRAPH_API}/me/messages?access_token=${accessToken}`;
  const payload = {
    recipient: { id: recipientId },
    message,
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    return data;
  } catch (err) {
    console.error('sendFacebookMessage error:', err);
    throw err;
  }
}

export async function sendFacebookImage({ recipientId, imageUrl, accessToken }: { recipientId: string, imageUrl: string, accessToken: string }) {
  return sendFacebookMessage({
    recipientId,
    message: {
      attachment: {
        type: 'image',
        payload: { url: imageUrl, is_reusable: true },
      },
    },
    accessToken,
  });
}

export async function sendFacebookQuickReplies({ recipientId, text, quickReplies, accessToken }: { recipientId: string, text: string, quickReplies: any[], accessToken: string }) {
  return sendFacebookMessage({
    recipientId,
    message: {
      text,
      quick_replies: quickReplies,
    },
    accessToken,
  });
}

export async function sendInstagramMessage({ recipientId, message, accessToken }: { recipientId: string, message: any, accessToken: string }) {
  return sendFacebookMessage({ recipientId, message, accessToken });
}

export async function sendInstagramImage({ recipientId, imageUrl, accessToken }: { recipientId: string, imageUrl: string, accessToken: string }) {
  return sendFacebookImage({ recipientId, imageUrl, accessToken });
}

export async function sendInstagramQuickReplies({ recipientId, text, quickReplies, accessToken }: { recipientId: string, text: string, quickReplies: any[], accessToken: string }) {
  return sendFacebookQuickReplies({ recipientId, text, quickReplies, accessToken });
}

// TODO: Add support for templates/cards (generic templates, carousels, etc.) 