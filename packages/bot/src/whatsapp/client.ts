import { config } from '../config';
import {
  buildTextPayload,
  buildButtonPayload,
  buildListPayload,
  buildTemplatePayload,
  buildImagePayload,
} from './message-builder';

const API_BASE = `https://graph.facebook.com/${config.whatsapp.apiVersion}/${config.whatsapp.phoneNumberId}`;

// Meta error codes that are non-transient — retrying just amplifies bad signals
// against our quality rating. Callers should skip further attempts on these.
// Ref: https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes
const PERMANENT_META_CODES = new Set<number>([
  131047, // Re-engagement message (24h window expired)
  131048, // Spam Rate limit hit (per-recipient marketing quota)
  131049, // Ecosystem engagement filter blocked delivery
  131050, // User has not accepted new terms
  131051, // Unsupported message type
  131056, // Pair Rate limit hit (too many to this recipient recently)
  132000, // Template param count mismatch
  132001, // Template does not exist / not approved in this language
  132005, // Template body text has been changed
  132007, // Template category mismatch
  132012, // Template violates policy
  132015, // Template paused
  132016, // Template disabled
  132018, // Param format (newlines, tabs, 4+ spaces)
  132021, // Template header/body param mismatch
  132022, // Template limit exceeded
  132025, // Template failed
  132026, // Template variable unset
]);

export class WhatsAppApiError extends Error {
  status: number;
  code: number | null;
  isPermanent: boolean;

  constructor(status: number, code: number | null, message: string) {
    super(message);
    this.name = 'WhatsAppApiError';
    this.status = status;
    this.code = code;
    this.isPermanent = code !== null && PERMANENT_META_CODES.has(code);
  }
}

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
    const errorBody: any = await response.json().catch(() => ({}));
    const code: number | null = errorBody?.error?.code ?? null;
    console.error('[WhatsApp] API error:', response.status, errorBody);
    throw new WhatsAppApiError(
      response.status,
      code,
      `WhatsApp API error: ${response.status} ${JSON.stringify(errorBody)}`
    );
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
