// Incoming webhook payload types
export interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

export interface WebhookEntry {
  id: string;
  changes: WebhookChange[];
}

export interface WebhookChange {
  value: {
    messaging_product: string;
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    contacts?: Array<{
      profile: { name: string };
      wa_id: string;
    }>;
    messages?: IncomingMessage[];
    statuses?: StatusUpdate[];
  };
  field: string;
}

export interface IncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'interactive' | 'button' | 'image' | 'document' | 'location';
  text?: { body: string };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
}

export interface StatusUpdate {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string }>;
}

// Outgoing message types
export interface TextMessage {
  type: 'text';
  to: string;
  text: string;
}

export interface ButtonMessage {
  type: 'button';
  to: string;
  text: string;
  buttons: Array<{ id: string; title: string }>;
}

export interface ListMessage {
  type: 'list';
  to: string;
  text: string;
  buttonText: string;
  sections: Array<{
    title?: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>;
}

export interface TemplateMessage {
  type: 'template';
  to: string;
  templateName: string;
  languageCode: string;
  components?: Array<{
    type: 'body' | 'header';
    parameters: Array<{ type: 'text'; text: string }>;
  }>;
}

export interface ImageMessage {
  type: 'image';
  to: string;
  imageUrl: string;
  caption?: string;
}

export type OutgoingMessage = TextMessage | ButtonMessage | ListMessage | TemplateMessage | ImageMessage;

// Parsed user input (normalized from text or interactive)
export interface UserInput {
  phone: string;
  messageId: string;
  type: 'text' | 'button' | 'list' | 'other';
  text?: string;
  buttonId?: string;
  listId?: string;
  profileName?: string;
}
