import { config } from '../config';
import {
  buildTextPayload,
  buildButtonPayload,
  buildListPayload,
  buildTemplatePayload,
  buildImagePayload,
} from './message-builder';

const API_BASE = `https://graph.facebook.com/${config.whatsapp.apiVersion}/${config.whatsapp.phoneNumberId}`;

async function sendToWhatsApp(payload: any): Promise<{ messageId: string | null }> {
  if (config.whatsapp.isMock) {
    console.log('[WhatsApp MOCK] Sending message:', JSON.stringify(payload, null, 2));
    return { messageId: `mock_${Date.now()}` };
  }

  const response = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.whatsapp.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('[WhatsApp] API error:', response.status, error);
    throw new Error(`WhatsApp API error: ${response.status} ${JSON.stringify(error)}`);
  }

  const data = (await response.json()) as { messages?: Array<{ id: string }> };
  return { messageId: data.messages?.[0]?.id || null };
}

export const whatsappClient = {
  async sendText(to: string, text: string) {
    return sendToWhatsApp(buildTextPayload(to, text));
  },

  async sendButtons(to: string, text: string, buttons: Array<{ id: string; title: string }>) {
    if (buttons.length > 3) {
      throw new Error('WhatsApp allows max 3 reply buttons');
    }
    return sendToWhatsApp(buildButtonPayload(to, text, buttons));
  },

  async sendList(
    to: string,
    text: string,
    buttonText: string,
    sections: Array<{
      title?: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>
  ) {
    const totalRows = sections.reduce((sum, s) => sum + s.rows.length, 0);
    if (totalRows > 10) {
      throw new Error('WhatsApp allows max 10 rows in a list message');
    }
    return sendToWhatsApp(buildListPayload(to, text, buttonText, sections));
  },

  async sendTemplate(to: string, templateName: string, bodyParams?: string[], lang = 'ru') {
    return sendToWhatsApp(buildTemplatePayload(to, templateName, lang, bodyParams));
  },

  async sendImage(to: string, imageUrl: string, caption?: string) {
    return sendToWhatsApp(buildImagePayload(to, imageUrl, caption));
  },
};
